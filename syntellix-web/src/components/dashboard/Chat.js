import { ArrowPathIcon, ArrowUpIcon, BeakerIcon, ChatBubbleLeftRightIcon, ClockIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { API_BASE_URL } from '../../config';
import AgentAvatar from '../AgentAvatar';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import RenameModal from '../RenameModal';
import SlidingPanel from './ChatSlidingPanel';
import AgentInfo from './ChatAgentInfo';
import RecentConversations from './ChatRecentConversations';
import { AgentInfoSkeleton, ChatAreaSkeleton, ConversationListSkeleton } from './ChatSkeletons';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';
import NewChatPrompt from './NewChatPrompt';

function Chat({ selectedAgentId }) {
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [isAgentInfoLoading, setIsAgentInfoLoading] = useState(true);
  const [isConversationListLoading, setIsConversationListLoading] = useState(true);
  const [isChatMessagesLoading, setIsChatMessagesLoading] = useState(true);
  const [conversationName, setConversationName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const abortControllerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isChangingConversation, setIsChangingConversation] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isAgentInfoOpen, setIsAgentInfoOpen] = useState(false);
  const [isRecentConversationsOpen, setIsRecentConversationsOpen] = useState(false);

  const fetchChatDetails = useCallback(async (agentId = null) => {
    setIsAgentInfoLoading(true);
    setError(null);
    try {
      const url = agentId
        ? `/console/api/chat/agent/${agentId}`
        : '/console/api/chat/agent';
      const response = await axios.get(url);
      setChatDetails(response.data);
      if (response.data.latest_conversation_id) {
        setCurrentConversationId(response.data.latest_conversation_id);
      }
      setIsAgentInfoLoading(false);
    } catch (error) {
      console.error('Failed to fetch chat details:', error);
      setError('对话内容获取失败');
      showToast('对话内容获取失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchChatDetails(selectedAgentId);
    } else {
      fetchChatDetails();
    }
  }, [selectedAgentId, fetchChatDetails]);

  const fetchConversationMessages = useCallback(async (conversationId, page = 1, perPage = 5) => {
    if (isLoadingMore && page !== 1) return;
    if (page === 1) {
      setIsChangingConversation(true);
      setShouldScrollToBottom(true);
    } else {
      setIsLoadingMore(true);
    }
    setIsChatMessagesLoading(true);
    try {
      const response = await axios.get(`/console/api/chat/conversation/${conversationId}/messages`, {
        params: { page, per_page: perPage }
      });
      if (page === 1) {
        setConversationMessages(response.data.messages);
        setConversationName(response.data.conversation.name);
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
      setIsLoadingMore(false);
      setIsChatMessagesLoading(false);
      setIsChangingConversation(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    if (currentConversationId && !isMessagesLoaded) {
      setIsChatMessagesLoading(true);
      fetchConversationMessages(currentConversationId).finally(() => {
        if (isMounted) {
          setIsChatMessagesLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentConversationId, isMessagesLoaded, fetchConversationMessages]);

  const loadMoreMessages = useCallback(() => {
    if (hasMore && currentConversationId && !isLoadingMore) {
      setIsLoadingMore(true);
      const currentScrollHeight = chatContainerRef.current.scrollHeight;
      fetchConversationMessages(currentConversationId, currentPage + 1)
        .then(() => {
          // After loading more messages, adjust scroll position
          setTimeout(() => {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const heightDifference = newScrollHeight - currentScrollHeight;
            chatContainerRef.current.scrollTop = heightDifference;
          }, 0);
        })
        .finally(() => setIsLoadingMore(false));
    }
  }, [hasMore, currentConversationId, currentPage, fetchConversationMessages, isLoadingMore]);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setScrollPosition(scrollTop);
      if (scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    }
  }, [loadMoreMessages, hasMore]);

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

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isSubmitting) {
      try {
        setIsSubmitting(true);
        setConversationMessages(prevMessages => {
          const messages = Array.isArray(prevMessages) ? prevMessages : [];
          return [
            ...messages,
            { message: inputMessage, message_type: 'user' }
          ];
        });
        setInputMessage('');
        setIsWaitingForResponse(true);
        setShouldScrollToBottom(true);  // Set flag to scroll to bottom after sending message

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        // Get token
        const token = localStorage.getItem('token');

        // Construct URL with query parameters
        const params = new URLSearchParams({
          agent_id: chatDetails.agent_info.id.toString(),
          message: inputMessage,
          pre_message_id: conversationMessages[conversationMessages.length - 1]?.id
        });
        const url = `${API_BASE_URL}/console/api/chat/conversation/${currentConversationId}/stream?${params}`;

        await fetchEventSource(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`
          },
          signal: abortControllerRef.current.signal,
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
              setShouldScrollToBottom(true);  // Set flag to scroll to bottom after status update
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
              setShouldScrollToBottom(true);  // Set flag to scroll to bottom after status update
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
              setShouldScrollToBottom(true);  // Set flag to scroll to bottom after status update
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
              setShouldScrollToBottom(true);  // Set flag to scroll to bottom after receiving new chunk
            } else if (data.error) {
              console.error('Error:', data.error);
              showToast(data.error, 'error');
            } else if (data.done) {
              setIsWaitingForResponse(false);
              setIsSubmitting(false);
              setShouldScrollToBottom(true);  // Set flag to scroll to bottom when response is complete
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
  };

  useEffect(() => {
    return () => {
      // 组件卸载时取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSelectAgent = async (agentId) => {
    await fetchChatDetails(agentId);
  };

  const handleKnowledgeBaseClick = (knowledgeBaseId) => {
    setSelectedKnowledgeBaseId(knowledgeBaseId);
  };

  const handleBackFromKnowledgeBaseDetail = () => {
    setSelectedKnowledgeBaseId(null);
  };

  const fetchConversationHistory = useCallback(async (agentId, lastId = null, limit = 10) => {
    setIsConversationListLoading(true);
    try {
      const response = await axios.get(`/console/api/chat/agent/${agentId}/conversation-history`, {
        params: { last_id: lastId, limit }
      });
      if (lastId === null) {
        setConversationHistory(response.data);
      } else {
        setConversationHistory(prevHistory => [...prevHistory, ...response.data]);
      }
      setHasMoreConversations(response.data.length === limit);
      setConversationPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      showToast('历史对话获取失败', 'error');
    } finally {
      setIsConversationListLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (chatDetails?.agent_info?.id) {
      fetchConversationHistory(chatDetails.agent_info.id);
    }
  }, [chatDetails, fetchConversationHistory]);

  const handleNewChat = useCallback(async () => {
    if (!chatDetails?.agent_info?.id) {
      showToast('无法创建新会话，请先选择一个智能助手', 'error');
      return;
    }

    setIsConversationListLoading(true);
    try {
      const response = await axios.post('/console/api/chat/conversations', {
        agent_id: chatDetails.agent_info.id,
      });

      const newConversation = response.data;
      setConversationMessages([]);
      setIsMessagesLoaded(false);
      setCurrentConversationId(newConversation.id);

      // Update only the conversation history
      await fetchConversationHistory(chatDetails.agent_info.id);

      // Update chat details without fetching agent info again
      setChatDetails(prevDetails => ({
        ...prevDetails,
        latest_conversation: newConversation
      }));

      showToast('新会话创建成功', 'success');
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      showToast('新会话创建失败', 'error');
    } finally {
      setIsConversationListLoading(false);
    }
  }, [chatDetails, showToast, fetchConversationHistory]);

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axios.delete('/console/api/chat/conversations', {
        data: { conversation_id: conversationId }
      });
      showToast('对话删除成功', 'success');
      // Remove the deleted conversation from the list
      setConversationHistory(prevHistory => prevHistory.filter(conv => conv.id !== conversationId));
      // If the deleted conversation was the current one, reset the current conversation
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setConversationMessages([]);
        setIsMessagesLoaded(false);
        setConversationName('');
      }
      // If this was the last conversation, fetch the latest agent
      if (conversationHistory.length === 1) {
        fetchChatDetails();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast('删除对话失败', 'error');
    }
  };

  const handleRenameConversation = async (conversationId, newName) => {
    try {
      const response = await axios.put('/console/api/chat/conversations', {
        conversation_id: conversationId,
        new_name: newName
      });
      showToast('对话已重命名', 'success');
      // Update the conversation name in the list
      setConversationHistory(prevHistory =>
        prevHistory.map(conv =>
          conv.id === conversationId ? { ...conv, name: response.data.name } : conv
        )
      );
      // If the renamed conversation is the current one, update the conversation name
      if (currentConversationId === conversationId) {
        setConversationName(response.data.name);
      }
      // Update the chatDetails to reflect the change
      setChatDetails(prevDetails => ({
        ...prevDetails,
        latest_conversation: prevDetails.latest_conversation && prevDetails.latest_conversation.id === conversationId
          ? { ...prevDetails.latest_conversation, name: response.data.name }
          : prevDetails.latest_conversation
      }));
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      showToast('重命名对话失', 'error');
    }
  };

  const handleDeleteCurrentConversation = useCallback(async () => {
    if (currentConversationId) {
      setIsDeleting(true);
      try {
        await handleDeleteConversation(currentConversationId);
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      }
    }
  }, [currentConversationId, handleDeleteConversation]);

  const handleRenameCurrentConversation = useCallback(async (newName) => {
    if (currentConversationId) {
      setIsRenaming(true);
      try {
        await handleRenameConversation(currentConversationId, newName);
      } finally {
        setIsRenaming(false);
        setIsRenameModalOpen(false);
      }
    }
  }, [currentConversationId, handleRenameConversation]);

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
          onClick={() => fetchChatDetails()}
          className="px-4 py-2 bg-danger text-bg-primary rounded-md hover:bg-danger-dark transition-colors duration-200"
        >
          重试
        </button>
      </div>
    );
  }

  if (!chatDetails?.has_recent_conversation && !loading) {
    return <NewChatPrompt onSelectAgent={handleSelectAgent} setLoading={setLoading} />;
  }

  if (loading) {
    return (
      <div className="h-full flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 flex flex-col bg-bg-primary overflow-hidden border-r border-bg-tertiary">
          <AgentInfoSkeleton />
          <div className="mx-4 my-4 border-t border-bg-tertiary"></div>
          <ConversationListSkeleton />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-14 relative">
          <ChatAreaSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main chat area (left side) */}
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-6 relative">
        {(isChatMessagesLoading || isChangingConversation) && !isLoadingMore ? (
          <ChatAreaSkeleton />
        ) : currentConversationId ? (
          <>
            <div
              className="flex-1 overflow-y-auto py-4 bg-bg-primary pb-24"
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {isLoadingMore && (
                <div className="flex justify-center items-center py-3">
                  <div className="bg-bg-secondary rounded-full px-4 py-2 flex items-center shadow-sm">
                    <ArrowPathIcon className="w-4 h-4 text-primary animate-spin mr-2" />
                    <span className="text-xs text-text-secondary font-medium">加载更多历史消息...</span>
                  </div>
                </div>
              )}
              {conversationMessages.map((message, index) => (
                <div key={index} className={`mb-4 flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {(message.message_type === 'agent' || message.message_type === 'status') && (
                    <div className="mr-2">
                      <AgentAvatar
                        avatarData={chatDetails?.agent_info?.avatar}
                        agentName={chatDetails?.agent_info?.name || '智能助手'}
                        size="xs"
                      />
                    </div>
                  )}
                  <div className={`inline-block p-3 rounded-xl ${message.message_type === 'user'
                    ? 'bg-primary text-white'
                    : message.message_type === 'status'
                      ? 'bg-bg-secondary text-text-secondary'
                      : 'bg-bg-secondary text-text-primary'
                    } max-w-[70%]`}
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
                    <div className="w-8 h-8 ml-2">
                      <UserCircleIcon className="w-full h-full text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl">
              <div className="relative">
                {/* Edge background */}
                <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-full blur-md"></div>

                {/* Input container */}
                <div className="relative flex items-center">
                  {/* New chat button */}
                  <div className="absolute left-4 group">
                    <button
                      onClick={handleNewChat}
                      className="w-8 h-8 flex items-center justify-center bg-bg-secondary rounded-full text-primary hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg-secondary text-text-primary text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      新会话
                    </div>
                  </div>

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
                    className="w-full py-4 px-6 pl-16 pr-14 bg-bg-primary rounded-full border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-md text-sm"
                    disabled={isSubmitting || isWaitingForResponse}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isSubmitting || isWaitingForResponse || !inputMessage.trim()
                      ? 'text-text-muted cursor-not-allowed'
                      : 'text-primary hover:text-primary-dark'
                      } transition-colors duration-200`}
                    disabled={isSubmitting || isWaitingForResponse || !inputMessage.trim()}
                  >
                    <ArrowUpIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-bg-primary text-center px-4">
            <div className="flex flex-col items-center -mt-40">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2 font-sans-sc">开始新的对话</h3>
              <p className="text-sm text-text-muted mb-6 max-w-md font-sans-sc">
                您可以选择历史对话或开启一个新的对话
              </p>
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 text-sm font-semibold font-sans-sc"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                开启新对话
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-16 flex flex-col bg-bg-primary overflow-hidden transition-all duration-300 ease-in-out">
        {/* Agent info icon */}
        <div className="flex-shrink-0 p-2">
          <div
            className="flex items-center justify-center cursor-pointer group"
            onClick={() => setIsAgentInfoOpen(true)}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors duration-200">
              <BeakerIcon className={`w-6 h-6 ${isAgentInfoOpen ? 'text-primary' : 'text-text-secondary'} group-hover:text-primary transition-colors duration-200`} />
            </div>
          </div>
        </div>

        {/* Recent conversations icon */}
        <div className="flex-shrink-0 p-2">
          <div
            className="flex items-center justify-center cursor-pointer group"
            onClick={() => setIsRecentConversationsOpen(true)}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors duration-200">
              <ClockIcon className={`w-6 h-6 ${isRecentConversationsOpen ? 'text-primary' : 'text-text-secondary'} group-hover:text-primary transition-colors duration-200`} />
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Panels */}
      <SlidingPanel
        isOpen={isAgentInfoOpen}
        onClose={() => setIsAgentInfoOpen(false)}
        title="智能助手信息"
      >
        <AgentInfo
          agentInfo={chatDetails?.agent_info}
          onKnowledgeBaseClick={handleKnowledgeBaseClick}
        />
      </SlidingPanel>

      <SlidingPanel
        isOpen={isRecentConversationsOpen}
        onClose={() => setIsRecentConversationsOpen(false)}
        title="最近会话"
      >
        <RecentConversations
          conversationHistory={conversationHistory}
          currentConversationId={currentConversationId}
          isConversationListLoading={isConversationListLoading}
          hasMoreConversations={hasMoreConversations}
          onConversationClick={(chatId) => {
            setCurrentConversationId(chatId);
            setIsChangingConversation(true);
            fetchConversationMessages(chatId);
            setIsRecentConversationsOpen(false);
          }}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onLoadMore={() => fetchConversationHistory(chatDetails.agent_info.id, conversationHistory[conversationHistory.length - 1]?.id)}
        />
      </SlidingPanel>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCurrentConversation}
        itemType="对话"
        itemName={conversationName || '当前对话'}
        isLoading={isDeleting}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameCurrentConversation}
        currentName={conversationName || ''}
        itemType="对话"
        isLoading={isRenaming}
      />
    </div>
  );
}

export default Chat;