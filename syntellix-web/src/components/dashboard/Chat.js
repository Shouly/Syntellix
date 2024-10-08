import { ClockIcon, PaperAirplaneIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import AgentAvatar from '../AgentAvatar';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import RenameModal from '../RenameModal';
import { AgentInfoSkeleton, ChatAreaSkeleton, ConversationListSkeleton } from './ChatSkeletons';
import ConversationActionMenu from './ConversationActionMenu';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';
import NewChatPrompt from './NewChatPrompt';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { API_BASE_URL } from '../../config';

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
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
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

  useEffect(() => {
    if (selectedAgentId) {
      fetchChatDetails(selectedAgentId);
    } else {
      fetchChatDetails();
    }
  }, [selectedAgentId]);

  const fetchChatDetails = async (agentId = null) => {
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
        fetchConversationMessages(response.data.latest_conversation_id);
      }
      if (response.data.agent_id) {
        fetchConversationHistory(response.data.agent_id);
      }
      setIsAgentInfoLoading(false);
    } catch (error) {
      console.error('Failed to fetch chat details:', error);
      setError('对话内容获取失败');
      showToast('对话内容获取失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = useCallback(async (conversationId, page = 1, perPage = 7) => {
    if (conversationId === currentConversationId && isMessagesLoaded) {
      return; // 如果消息已加载，则不重复加
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
        setConversationMessages(prevMessages => [...prevMessages, ...response.data.messages]);
      }
      setHasMoreMessages(response.data.messages.length === perPage);
      setCurrentPage(page);
      setIsChatMessagesLoading(false);
      setIsMessagesLoaded(true);
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      showToast('消息获取失败', 'error');
    }
  }, [showToast, currentConversationId, isMessagesLoaded]);

  const loadMoreMessages = () => {
    if (chatDetails?.latest_conversation && hasMoreMessages) {
      fetchConversationMessages(chatDetails.latest_conversation.id, currentPage + 1);
    }
  };

  useEffect(() => {
    if (currentConversationId && !isMessagesLoaded) {
      fetchConversationMessages(currentConversationId);
    }
  }, [currentConversationId, fetchConversationMessages, isMessagesLoaded]);

  // 新增：滚动到底部的数
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // 新增：当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isSubmitting) {
      try {
        setIsSubmitting(true);
        setConversationMessages(prevMessages => {
          // Check if prevMessages is an array, if not, initialize it
          const messages = Array.isArray(prevMessages) ? prevMessages : [];
          return [
            ...messages,
            { message: inputMessage, message_type: 'user' }
          ];
        });
        setInputMessage('');
        setIsWaitingForResponse(true);

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        // Get token
        const token = localStorage.getItem('token');

        // Construct URL with query parameters
        const params = new URLSearchParams({
          agent_id: chatDetails.agent_info.id.toString(),
          message: inputMessage
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
              // Scroll to bottom after each chunk
              scrollToBottom();
            } else if (data.error) {
              console.error('Error:', data.error);
              showToast(data.error, 'error');
            } else if (data.done) {
              setIsWaitingForResponse(false);
              setIsSubmitting(false);
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
    setIsChatMessagesLoading(true);
    try {
      const response = await axios.post('/console/api/chat/conversations', {
        agent_id: chatDetails.agent_info.id,
      });

      const newConversation = response.data;
      setCurrentConversationId(newConversation.id);
      setConversationMessages([]);
      setIsMessagesLoaded(false);

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
      setIsChatMessagesLoading(false);
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
      showToast('重命名对话失败', 'error');
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
      <div className="h-full flex overflow-hidden gap-6 p-3">
        <div className="w-72 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
          <AgentInfoSkeleton />
          <ConversationListSkeleton />
        </div>
        <ChatAreaSkeleton />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden gap-6 p-3">
      {/* Left sidebar */}
      <div className="w-72 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
        {isAgentInfoLoading ? (
          <AgentInfoSkeleton />
        ) : (
          <>
            <div className="p-6 flex-shrink-0">
              <div className="mb-6">
                <div className="flex items-center mb-4 cursor-pointer group">
                  <div className="mr-3">
                    <AgentAvatar
                      avatarData={chatDetails?.agent_info?.avatar}
                      agentName={chatDetails?.agent_info?.name || '智能助手'}
                      size="small"
                    />
                  </div>
                  <h1 className="text-base font-semibold text-text-body font-sans-sc truncate">
                    {chatDetails?.agent_info?.name || '智能助手'}
                  </h1>
                </div>
                {/* Agent description */}
                {chatDetails?.agent_info?.description && (
                  <p className="text-sm text-text-muted mb-4 line-clamp-3 hover:line-clamp-none transition-all duration-300">
                    {chatDetails.agent_info.description}
                  </p>
                )}
                {/* Knowledge base names */}
                {chatDetails?.agent_info?.knowledge_bases?.length > 0 && (
                  <div className="text-xs text-text-muted bg-bg-secondary rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-text-body">关联知识库:</h4>
                    <ul className="space-y-1">
                      {chatDetails.agent_info.knowledge_bases.map((kb) => (
                        <li
                          key={kb.id}
                          className="flex items-center cursor-pointer hover:text-primary transition-colors duration-200"
                          onClick={() => handleKnowledgeBaseClick(kb.id)}
                        >
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          <span className="truncate">{kb.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleNewChat}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm mb-6"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                <span className="font-sans-sc">新对话</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  最近对话
                </h3>
                {isConversationListLoading ? (
                  <ConversationListSkeleton />
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] space-y-1">
                      {conversationHistory.map(chat => (
                        <SidebarItem
                          key={chat.id}
                          text={chat.name}
                          isActive={chat.id === currentConversationId}
                          onClick={() => {
                            setCurrentConversationId(chat.id);
                            fetchConversationMessages(chat.id);
                          }}
                          onRename={(newName) => handleRenameConversation(chat.id, newName)}
                          onDelete={() => handleDeleteConversation(chat.id)}
                        />
                      ))}
                      {hasMoreConversations && (
                        <li
                          onClick={() => fetchConversationHistory(chatDetails.agent_info.id, conversationHistory[conversationHistory.length - 1]?.id)}
                          className="py-2 px-3 rounded-lg transition-colors duration-200 cursor-pointer text-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-center group mb-1"
                        >
                          <span className="font-sans-sc text-sm font-semibold flex items-center">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            加载更多
                          </span>
                        </li>
                      )}
                    </div>
                  </>
                )}
              </div>
            </nav>
          </>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm relative">
        {isChatMessagesLoading ? (
          <ChatAreaSkeleton />
        ) : currentConversationId ? (
          <>
            <div className="flex items-center justify-between p-3 flex-shrink-0 border-b border-secondary">
              <h3 className="text-base font-semibold text-text-body font-sans-sc truncate">
                {conversationName || '新对话'}
              </h3>
              <ConversationActionMenu
                onRename={() => setIsRenameModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 bg-bg-primary" ref={chatContainerRef}>
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
                  <div className={`inline-block p-3 rounded-xl ${
                    message.message_type === 'user'
                      ? 'bg-primary text-white'
                      : message.message_type === 'status'
                      ? 'bg-bg-tertiary text-text-secondary'
                      : 'bg-bg-tertiary text-text-primary'
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
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isWaitingForResponse) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入消息..."
                  className="w-full py-3 px-4 bg-white rounded-lg border border-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting || isWaitingForResponse}
                />
                <button
                  onClick={handleSendMessage}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isSubmitting || isWaitingForResponse ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-primary-dark'
                    }`}
                  disabled={isSubmitting || isWaitingForResponse}
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white bg-opacity-50 text-center px-4">
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

function SidebarItem({ text, isActive = false, onClick, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(text);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = () => {
    if (isEditing) {
      onRename(newName);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <li
        className={`py-1 px-3 rounded-lg transition-colors duration-200 cursor-pointer ${isActive ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body hover:bg-bg-secondary'
          } flex items-center justify-between group mb-1`}
        onClick={isEditing ? undefined : onClick}
      >
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRename();
              }
            }}
            className="bg-transparent border-none focus:outline-none text-sm font-sans-sc flex-grow mr-2"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`font-sans-sc text-sm ${isActive ? 'font-semibold' : ''} truncate flex-grow mr-2`}>{text}</span>
        )}
        <ConversationActionMenu
          onRename={() => handleRename()}
          onDelete={() => setIsDeleteModalOpen(true)}
        />
      </li>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemType="对话"
        itemName={text}
        isLoading={isDeleting}
      />
    </>
  );
}

export default Chat;