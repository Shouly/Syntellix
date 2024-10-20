import { ArrowPathIcon, ArrowUpIcon, BeakerIcon as BeakerIconOutline, ClockIcon, ClockIcon as ClockIconOutline, PencilSquareIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../../components/Toast';
import { API_BASE_URL } from '../../config';
import AgentAvatar from '../AgentAvatar';
import AgentInfo from './ChatAgentInfo';
import RecentConversations from './ChatRecentConversations';
import { ChatAreaSkeleton, LoadingMoreSkeleton } from './ChatSkeletons';
import SlidingPanel from './ChatSlidingPanel';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';

function Chat({ selectedAgent, initialMessage, initialConversation, isNewChat, setIsNewChat, onNewChat, onDeleteCurrentConversation }) {
  const [currentConversationId, setCurrentConversationId] = useState(initialConversation?.id || null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const { showToast } = useToast();
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [isChatMessagesLoading, setIsChatMessagesLoading] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const abortControllerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isAgentInfoOpen, setIsAgentInfoOpen] = useState(false);
  const [isRecentConversationsOpen, setIsRecentConversationsOpen] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [inputMessage, setInputMessage] = useState(initialMessage || '');
  const [error, setError] = useState(null);
  const [shouldLoadConversations, setShouldLoadConversations] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(initialConversation || null);
  const [isSwitchingConversation, setIsSwitchingConversation] = useState(false);

  const fetchConversationMessages = useCallback(async (conversationId, page = 1, perPage = 4) => {
    if (page === 1) {
      setShouldScrollToBottom(true);
    }
    setIsChatMessagesLoading(true);
    try {
      const response = await axios.get(`/console/api/chat/conversation/${conversationId}/messages`, {
        params: { page, per_page: perPage }
      });
      if (page === 1) {
        setConversationMessages(response.data.messages);
        setCurrentConversation(response.data.conversation);
        if (response.data.messages.length > 0) {
          setLastMessageId(response.data.messages[response.data.messages.length - 1].id);
        } else {
          setLastMessageId(null);
        }
      } else {
        setConversationMessages(prevMessages => [...response.data.messages, ...prevMessages]);
      }
      setHasMore(response.data.has_more);
      setCurrentPage(page);
      setIsMessagesLoaded(true);
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      showToast('消息获取失败', 'error');
    } finally {
      setIsChatMessagesLoading(false);
    }
  }, [showToast]);

  const handleSendMessage = useCallback(async (messageToSend = inputMessage) => {
    // 确保 messageToSend 是字符串
    const message = typeof messageToSend === 'string' ? messageToSend : String(messageToSend);

    if (message.trim() !== '' && !isSubmitting && selectedAgent) {
      try {
        setIsSubmitting(true);
        setConversationMessages(prevMessages => [
          ...prevMessages,
          { message: message.trim(), message_type: 'user' }
        ]);

        setInputMessage('');
        setIsWaitingForResponse(true);
        setShouldScrollToBottom(true);

        abortControllerRef.current = new AbortController();

        const token = localStorage.getItem('token');

        const params = new URLSearchParams({
          agent_id: selectedAgent.id.toString(),
          message: message.trim(),
          ...(lastMessageId && { pre_message_id: lastMessageId.toString() })
        });
        const url = `${API_BASE_URL}/console/api/chat/conversation${currentConversationId ? `/${currentConversationId}` : ''}/stream?${params}`;

        let newConversationId = null;

        await fetchEventSource(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`
          },
          signal: abortControllerRef.current.signal,
          async onopen(response) {
            // 检查响应头中是否有新的会话 ID
            newConversationId = response.headers.get('X-Conversation-Id');
            if (newConversationId) {
              setCurrentConversationId(newConversationId);
              setIsNewChat(false);
            }
          },
          onmessage(event) {
            const data = JSON.parse(event.data);
            if (data.status === "retrieving_documents") {
              setConversationMessages(prevMessages => {
                const messages = Array.isArray(prevMessages) ? prevMessages : [];
                return [
                  ...messages,
                  { message: "正在检索知识库文档", message_type: 'status' }
                ];
              });
              setShouldScrollToBottom(true);
            } else if (data.status === "retrieving_documents_done") {
              setConversationMessages(prevMessages => {
                const messages = Array.isArray(prevMessages) ? prevMessages : [];
                const updatedMessages = [...messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.message_type === 'status') {
                  lastMessage.message = "知识库文档检索完成";
                } else {
                  updatedMessages.push({ message: "知识库文档检索完成", message_type: 'status' });
                }
                return updatedMessages;
              });
              setShouldScrollToBottom(true);
            } else if (data.status === "generating_answer") {
              setConversationMessages(prevMessages => {
                const messages = Array.isArray(prevMessages) ? prevMessages : [];
                const updatedMessages = [...messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.message_type === 'status') {
                  lastMessage.message = "开始生成回答";
                } else {
                  updatedMessages.push({ message: "开始生成回答", message_type: 'status' });
                }
                return updatedMessages;
              });
              setShouldScrollToBottom(true);
            } else if (data.chunk) {
              setConversationMessages(prevMessages => {
                const messages = Array.isArray(prevMessages) ? prevMessages : [];
                const updatedMessages = [...messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.message_type === 'agent') {
                  lastMessage.message += data.chunk;
                } else {
                  // Remove previous status messages
                  while (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].message_type === 'status') {
                    updatedMessages.pop();
                  }
                  updatedMessages.push({ message: data.chunk, message_type: 'agent' });
                }
                return updatedMessages;
              });
              setShouldScrollToBottom(true);
            } else if (data.error) {
              console.error('Error:', data.error);
              showToast(data.error, 'error');
            } else if (data.done) {
              setIsWaitingForResponse(false);
              setIsSubmitting(false);
              setShouldScrollToBottom(true);
            } else if (data.last_message_id) {
              setLastMessageId(data.last_message_id);
            }
          },
          onclose() {
            setIsWaitingForResponse(false);
            setIsSubmitting(false);
          },
          onerror(err) {
            console.error('EventSource failed:', err);
            setIsWaitingForResponse(false);
            setIsSubmitting(false);
            showToast('消息发送失败', 'error');
          },
        });

      } catch (error) {
        console.error('Failed to send message:', error);
        showToast('消息发送失败', 'error');
        setIsWaitingForResponse(false);
        setIsSubmitting(false);
      }
    }
  }, [inputMessage, isSubmitting, selectedAgent, currentConversationId, lastMessageId, setConversationMessages, showToast]);

  useEffect(() => {
    let isMounted = true;
    if (selectedAgent && !isMessagesLoaded) {
      if (isNewChat) {
        if (initialMessage) {
          handleSendMessage(initialMessage);
        }
        setIsMessagesLoaded(true);
        setIsChatMessagesLoading(false);
        setIsSwitchingConversation(false);
      } else if (initialConversation) {
        setCurrentConversationId(initialConversation.id);
        setIsChatMessagesLoading(true);
        fetchConversationMessages(initialConversation.id).finally(() => {
          if (isMounted) {
            setIsChatMessagesLoading(false);
            setIsMessagesLoaded(true);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [selectedAgent, initialConversation, isMessagesLoaded, isNewChat, initialMessage, handleSendMessage, fetchConversationMessages]);

  const createNewConversation = async () => {
    setError(null);
    try {
      const response = await axios.post('/console/api/chat/conversations', {
        agent_id: selectedAgent.id,
      });
      const newConversation = response.data;
      setCurrentConversationId(newConversation.id);

      if (initialMessage) {
        handleSendMessage(initialMessage);
      }
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      setError('创建新对话失败');
      showToast('创建新对话失败', 'error');
    }
  };

  const loadMoreMessages = useCallback(() => {
    if (hasMore && currentConversationId && !isLoadingMore) {
      setIsLoadingMore(true);
      const currentScrollHeight = chatContainerRef.current.scrollHeight;
      fetchConversationMessages(currentConversationId, currentPage + 1)
        .then(() => {
          setTimeout(() => {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const heightDifference = newScrollHeight - currentScrollHeight;
            chatContainerRef.current.scrollTop = heightDifference;
          }, 0);
        })
        .finally(() => setIsLoadingMore(false));
    }
  }, [hasMore, currentConversationId, currentPage, fetchConversationMessages, isLoadingMore]);

  const debouncedHandleScroll = useCallback(
    debounce(() => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        if (scrollTop === 0 && hasMore && !isLoadingMore) {
          loadMoreMessages();
        }
      }
    }, 100),  // 增加延迟到 100ms
    [loadMoreMessages, hasMore, isLoadingMore]
  );

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', debouncedHandleScroll);
      return () => {
        chatContainer.removeEventListener('scroll', debouncedHandleScroll);
        debouncedHandleScroll.cancel();
      };
    }
  }, [debouncedHandleScroll]);

  // Modify the scrollToBottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Update the useEffect for scrolling
  useEffect(() => {
    if (shouldScrollToBottom && !isChatMessagesLoading) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, isChatMessagesLoading, scrollToBottom]);

  const handleKnowledgeBaseClick = (knowledgeBaseId) => {
    setSelectedKnowledgeBaseId(knowledgeBaseId);
  };

  const handleBackFromKnowledgeBaseDetail = () => {
    setSelectedKnowledgeBaseId(null);
  };

  const handleNewChat = useCallback(() => {
    onNewChat();
  }, [onNewChat]);

  const handleConversationClick = useCallback(async (conversation) => {
    setCurrentConversationId(conversation.id);
    setCurrentConversation(conversation);
    setCurrentPage(1);
    setHasMore(false);
    setIsNewChat(false);
    setIsSwitchingConversation(true);
    try {
      const response = await axios.get(`/console/api/chat/conversation/${conversation.id}/messages`, {
        params: { page: 1, per_page: 4 }
      });
      setConversationMessages(response.data.messages);
      setIsMessagesLoaded(true);
      setHasMore(response.data.has_more);
      if (response.data.messages.length > 0) {
        setLastMessageId(response.data.messages[response.data.messages.length - 1].id);
      } else {
        setLastMessageId(null);
      }
      setShouldScrollToBottom(true);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      showToast('消息获取失败', 'error');
    } finally {
      setIsRecentConversationsOpen(false);
      setIsSwitchingConversation(false);
    }
  }, [showToast, setIsNewChat]);

  const handleConversationUpdate = useCallback((updatedConversation) => {
    setRecentConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === updatedConversation.id
          ? updatedConversation
          : conv
      )
    );
  }, []);

  const handleConversationDelete = useCallback(async (deletedConversationId) => {
    if (currentConversationId === deletedConversationId) {
      onDeleteCurrentConversation();
    }

    setRecentConversations(prevConversations =>
      prevConversations.filter(conv => conv.id !== deletedConversationId)
    );
  }, [currentConversationId, setRecentConversations, onDeleteCurrentConversation]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const distance = formatDistanceToNow(date, { locale: zhCN });
    return distance.replace(/大约 /, '')
      .replace(/ 天/, '天')
      .replace(/ 个?小时/, '小时')
      .replace(/ 分钟/, '分钟')
      .replace(/不到 /, '') + '前';
  };

  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setEditedName(currentConversation?.name || '新对话');
  }, [currentConversation]);

  const handleNameSave = useCallback(async () => {
    if (editedName.trim() !== (currentConversation?.name || '新对话')) {
      const originalName = currentConversation?.name || '新对话';
      try {
        // Optimistically update UI
        setCurrentConversation(prev => ({ ...prev, name: editedName.trim() }));
        setRecentConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, name: editedName.trim() }
              : conv
          )
        );

        // Send request to server
        await axios.put('/console/api/chat/conversations', {
          conversation_id: currentConversationId,
          new_name: editedName.trim()
        });

      } catch (error) {
        showToast('更新会话名称失败', 'error');
        
        // Revert changes on error
        setCurrentConversation(prev => ({ ...prev, name: originalName }));
        setRecentConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, name: originalName }
              : conv
          )
        );
      }
    }
    setIsEditingName(false);
  }, [editedName, currentConversation, currentConversationId, showToast, setRecentConversations]);

  useEffect(() => {
    return () => {
      // Cancel the request when the component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleRecentConversationsClick = () => {
    setIsRecentConversationsOpen(true);
    setShouldLoadConversations(true);
  };

  if (selectedKnowledgeBaseId) {
    return (
      <KnowledgeBaseDetail
        id={selectedKnowledgeBaseId}
        onBack={handleBackFromKnowledgeBaseDetail}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-danger-light bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl p-6">
        <ExclamationCircleIcon className="w-12 h-12 text-danger mb-4" />
        <div className="text-danger font-semibold text-lg mb-2">对话内容获取失败</div>
        <div className="text-danger-dark text-sm mb-4">{error}</div>
        <button
          onClick={createNewConversation}
          className="px-4 py-2 bg-danger text-bg-primary rounded-md hover:bg-danger-dark transition-colors duration-200"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between py-2 px-3 bg-bg-primary border-b border-border-primary">
        <div className="flex-1 flex items-center">
          <div className="flex items-center text-xs text-text-secondary font-sans-sc">
            <ClockIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="flex-shrink-0">
              {isNewChat ? '现在' : formatRelativeTime(currentConversation?.created_at)}
            </span>
          </div>
        </div>
        <div className="flex-1 text-center">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-sm font-medium text-text-primary bg-bg-secondary rounded-md px-3 py-1.5 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-bg-primary transition-all duration-200 selection:bg-primary selection:text-white"
              autoFocus
            />
          ) : (
            <div
              className="text-sm font-medium text-text-primary truncate px-2 cursor-pointer group flex items-center justify-center"
              onClick={handleNameEdit}
            >
              <span className="group-hover:text-primary transition-colors duration-200 py-1.5 px-3 rounded-md hover:bg-bg-secondary">
                {currentConversation?.name || '新对话'}
              </span>
              <PencilSquareIcon className="w-4 h-4 ml-1 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-end space-x-3">
          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-secondary transition-colors duration-200"
            title="新建对话"
          >
            <PlusIcon className="w-5 h-5 text-text-secondary hover:text-primary transition-colors duration-200" />
          </button>

          {/* Agent info button */}
          <button
            onClick={() => setIsAgentInfoOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-secondary transition-colors duration-200 group"
            title="智能体信息"
          >
            <BeakerIconOutline className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-200" />
          </button>

          {/* Recent conversations button */}
          <button
            onClick={handleRecentConversationsClick}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-secondary transition-colors duration-200 group"
            title="最近会话"
          >
            <ClockIconOutline className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-200" />
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-6 relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ExclamationCircleIcon className="w-12 h-12 text-danger mb-4" />
              <div className="text-danger font-semibold text-lg mb-2">{error}</div>
              <button
                onClick={createNewConversation}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
              >
                重试
              </button>
            </div>
          ) : isChatMessagesLoading || isSwitchingConversation ? (
            <ChatAreaSkeleton />
          ) : (
            <>
              <div
                className="flex-1 overflow-y-auto py-4 bg-bg-primary pb-24 chat-container"
                ref={chatContainerRef}
              >
                <div className="max-w-4xl mx-auto w-full">
                  {isLoadingMore && <LoadingMoreSkeleton />}
                  {conversationMessages.map((message, index) => (
                    <div key={index} className={`mb-4 flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {(message.message_type === 'agent' || message.message_type === 'status') && (
                        <div className="mr-2 flex-shrink-0">
                          <AgentAvatar
                            avatarData={selectedAgent?.avatar}
                            agentName={selectedAgent?.name || '智能助手'}
                            size="xs"
                          />
                        </div>
                      )}
                      <div className={`inline-block p-3 rounded-xl ${message.message_type === 'user'
                        ? 'bg-primary text-white'
                        : message.message_type === 'status'
                          ? 'bg-bg-secondary text-text-secondary'
                          : 'bg-bg-secondary text-text-primary'
                        } max-w-[80%]`}
                      >
                        {message.message_type === 'user' ? (
                          <p className="text-sm leading-relaxed font-sans-sc font-medium">
                            {message.message}
                          </p>
                        ) : message.message_type === 'status' ? (
                          <p className="text-xs leading-relaxed font-sans-sc font-medium italic flex items-center">
                            <span className="mr-1">{message.message}</span>
                            <span className="inline-flex">
                              <span className="animate-ellipsis">.</span>
                              <span className="animate-ellipsis" style={{ animationDelay: '0.2s' }}>.</span>
                              <span className="animate-ellipsis" style={{ animationDelay: '0.4s' }}>.</span>
                            </span>
                          </p>
                        ) : (
                          <ReactMarkdown className="markdown-content">
                            {message.message}
                          </ReactMarkdown>
                        )}
                      </div>
                      {message.message_type === 'user' && (
                        <div className="w-8 h-8 ml-2 flex-shrink-0">
                          <UserCircleIcon className="w-full h-full text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat input */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-6">
                <ChatInput
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  handleSendMessage={handleSendMessage}
                  isSubmitting={isSubmitting}
                  isWaitingForResponse={isWaitingForResponse}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sliding Panels */}
      <SlidingPanel
        isOpen={isAgentInfoOpen}
        onClose={() => setIsAgentInfoOpen(false)}
        title="智能体信息"
      >
        <AgentInfo
          agentInfo={selectedAgent}
          onKnowledgeBaseClick={handleKnowledgeBaseClick}
        />
      </SlidingPanel>

      <SlidingPanel
        isOpen={isRecentConversationsOpen}
        onClose={() => setIsRecentConversationsOpen(false)}
        title="最近会话"
      >
        <RecentConversations
          agentId={selectedAgent?.id}
          currentConversationId={currentConversationId}
          onConversationClick={handleConversationClick}
          onConversationUpdate={handleConversationUpdate}
          onConversationDelete={handleConversationDelete}
          recentConversations={recentConversations}
          setRecentConversations={setRecentConversations}
          shouldLoadConversations={shouldLoadConversations}
        />
      </SlidingPanel>
    </div>
  );
}

// ChatInput component
function ChatInput({ inputMessage, setInputMessage, handleSendMessage, isSubmitting, isWaitingForResponse }) {
  return (
    <div className="relative">
      {/* Edge background */}
      <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-full blur-md"></div>

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting && !isWaitingForResponse) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="请输入问题，Enter发送"
          className="w-full py-4 px-6 pr-14 bg-bg-primary rounded-full border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-md text-sm"
          disabled={isSubmitting || isWaitingForResponse}
        />
        <button
          onClick={handleSendMessage}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isSubmitting || isWaitingForResponse || !inputMessage.trim()
            ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-dark'
            } transition-colors duration-200 flex items-center justify-center`}
          disabled={isSubmitting || isWaitingForResponse || !inputMessage.trim()}
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Chat;
