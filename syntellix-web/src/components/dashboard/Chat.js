import { BookmarkIcon, ClockIcon, PaperAirplaneIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import AgentAvatar from '../AgentAvatar';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';
import NewChatPrompt from './NewChatPrompt';

function Chat() {
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
  const [pinnedConversations, setPinnedConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);

  useEffect(() => {
    fetchChatDetails();
  }, []);

  const fetchChatDetails = async (agentId = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = agentId
        ? `/console/api/chat/agent/${agentId}`
        : '/console/api/chat/agent';
      const response = await axios.get(url);
      setChatDetails(response.data);
      if (response.data.latest_conversation) {
        setCurrentConversationId(response.data.latest_conversation.id);
      }
      if (response.data.agent_id) {
        fetchPinnedConversations(response.data.agent_id);
        fetchConversationHistory(response.data.agent_id);
      }
    } catch (error) {
      console.error('Failed to fetch chat details:', error);
      setError('对话内容获取失败');
      showToast('对话内容获取失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = useCallback(async (conversationId, page = 1, perPage = 7) => {
    if (isMessagesLoaded) return; // 防止重复加载
    try {
      const response = await axios.get(`/console/api/chat/conversation/${conversationId}/messages`, {
        params: { page, per_page: perPage }
      });
      if (page === 1) {
        setConversationMessages(response.data);
      } else {
        setConversationMessages(prevMessages => [...prevMessages, ...response.data]);
      }
      setHasMoreMessages(response.data.length === perPage);
      setCurrentPage(page);
      setIsMessagesLoaded(true);
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      showToast('消息获取失败', 'error');
    }
  }, [showToast, isMessagesLoaded]);

  const loadMoreMessages = () => {
    if (chatDetails?.latest_conversation && hasMoreMessages) {
      fetchConversationMessages(chatDetails.latest_conversation.id, currentPage + 1);
    }
  };

  useEffect(() => {
    if (chatDetails?.latest_conversation && !isMessagesLoaded) {
      fetchConversationMessages(chatDetails.latest_conversation.id);
    }
  }, [chatDetails, fetchConversationMessages, isMessagesLoaded]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      try {
        // TODO: Implement sending message to backend
        // const response = await axios.post('/api/send-message', { message: inputMessage });
        // Update chat details with new message
        setInputMessage('');
        showToast('消息发送成功', 'success');
      } catch (error) {
        console.error('Failed to send message:', error);
        showToast('消息发送失败', 'error');
      }
    }
  };

  const handleSelectAgent = async (agentId) => {
    await fetchChatDetails(agentId);
  };

  const handleKnowledgeBaseClick = (knowledgeBaseId) => {
    setSelectedKnowledgeBaseId(knowledgeBaseId);
  };

  const handleBackFromKnowledgeBaseDetail = () => {
    setSelectedKnowledgeBaseId(null);
  };

  const fetchPinnedConversations = useCallback(async (agentId) => {
    try {
      const response = await axios.get(`/console/api/chat/agent/${agentId}/pinned-conversations`);
      setPinnedConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch pinned conversations:', error);
      showToast('固定对话获取失败', 'error');
    }
  }, [showToast]);

  const fetchConversationHistory = useCallback(async (agentId, lastId = null, limit = 10) => {
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
    }
  }, [showToast]);

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

  return (
    <div className="h-full flex overflow-hidden gap-6 p-3">
      {/* Left sidebar */}
      <div className="w-72 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
        {loading ? (
          <LeftSidebarSkeleton />
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
                onClick={() => {/* Handle new chat */ }}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm mb-6"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                <span className="font-sans-sc">新对话</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
                  <BookmarkIcon className="w-5 h-5 mr-2" />
                  固定对话
                </h3>
                <ul className="space-y-1">
                  {pinnedConversations.map(chat => (
                    <SidebarItem
                      key={chat.id}
                      text={chat.name}
                      isActive={chat.id === currentConversationId}
                    />
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  最近对话
                </h3>
                <div className="flex-1 overflow-y-auto">
                  {conversationHistory.map(chat => (
                    <SidebarItem
                      key={chat.id}
                      text={chat.name}
                      isActive={chat.id === currentConversationId}
                    />
                  ))}
                  {hasMoreConversations && (
                    <button
                      onClick={() => fetchConversationHistory(chatDetails.agent_id, conversationHistory[conversationHistory.length - 1]?.id)}
                      className="w-full text-sm text-primary hover:text-primary-dark font-semibold py-2 px-3 rounded-lg transition-colors duration-200 hover:bg-bg-secondary mt-2 flex items-center justify-center"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      加载更多
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </>
        )}
      </div>

      {/* Main chat area */}
      {loading ? (
        <ChatSkeleton />
      ) : (
        <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm relative">
          {/* Chat header */}
          <div className="flex items-center justify-between p-3 flex-shrink-0 border-b border-secondary">
            <h3 className="text-base font-semibold text-text-body font-sans-sc truncate">
              {chatDetails?.latest_conversation?.name || '新对话'}
            </h3>
            <div className="flex items-center">
              <button className="text-text-muted hover:text-text-body p-1 rounded-full hover:bg-bg-secondary transition-colors duration-200 ml-2">
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-24" ref={chatContainerRef}>
            {conversationMessages.map((message, index) => (
              <div key={index} className={`mb-4 flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.message_type === 'agent' && (
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
                    : 'bg-bg-tertiary text-text-primary'
                } max-w-[70%]`}
                >
                  <p className={`text-sm leading-relaxed ${
                    message.message_type === 'user'
                      ? 'font-sans-sc font-medium'
                      : 'font-sans-sc font-normal'
                  }`}
                  >
                    {message.message}
                  </p>
                </div>
                {message.message_type === 'user' && (
                  <div className="w-8 h-8 ml-2">
                    <UserCircleIcon className="w-full h-full text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
            <div className="relative">
              <input
                type="text"
                placeholder="输入您的问题..."
                className="w-full p-4 pr-12 rounded-lg border border-secondary bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-lg transition-all duration-300 hover:shadow-xl"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark transition-colors duration-200"
                onClick={handleSendMessage}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm relative animate-pulse">
      {/* Chat header */}
      <div className="flex items-center justify-between p-3 flex-shrink-0 border-b border-secondary">
        <div className="h-6 bg-secondary rounded w-1/4"></div>
        <div className="w-8 h-8 bg-secondary rounded-full"></div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && (
                <div className="w-8 h-8 rounded-full bg-secondary mr-2 flex-shrink-0"></div>
              )}
              <div className={`inline-block p-3 rounded-xl ${i % 2 === 0 ? 'bg-bg-tertiary' : 'bg-primary bg-opacity-10'
                } ${i % 2 === 0 ? 'w-[50%]' : 'w-[50%]'}`}>
                <div className="h-4 bg-secondary rounded w-full"></div>
              </div>
              {i % 2 !== 0 && (
                <div className="w-8 h-8 rounded-full bg-secondary ml-2 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
        <div className="h-14 bg-white rounded-lg w-full border border-secondary"></div>
      </div>
    </div>
  );
}

function SidebarItem({ text, isActive = false }) {
  return (
    <li className={`py-2 px-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body hover:bg-bg-secondary'
      }`}>
      <span className={`font-sans-sc text-sm ${isActive ? 'font-semibold' : ''} truncate`}>{text}</span>
    </li>
  );
}

function LeftSidebarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="p-6 flex-shrink-0">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary mr-3"></div>
            <div className="h-6 bg-secondary rounded w-3/4"></div>
          </div>
          <div className="h-4 bg-secondary rounded w-full mb-2"></div>
          <div className="h-4 bg-secondary rounded w-5/6 mb-4"></div>
          <div className="bg-bg-secondary rounded-lg p-3">
            <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 bg-secondary rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-10 bg-primary rounded-lg mb-6"></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="mb-6">
          <div className="h-5 bg-secondary rounded w-1/2 mb-2"></div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-5 bg-secondary rounded w-1/2 mb-2"></div>
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Chat;