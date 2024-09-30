import { BookmarkIcon, ClockIcon, PaperAirplaneIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import AgentAvatar from '../AgentAvatar';
import { AgentInfoSkeleton, ChatAreaSkeleton, ConversationListSkeleton } from './ChatSkeletons';
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
  const [isAgentInfoLoading, setIsAgentInfoLoading] = useState(true);
  const [isConversationListLoading, setIsConversationListLoading] = useState(true);
  const [isChatMessagesLoading, setIsChatMessagesLoading] = useState(true);
  const [conversationName, setConversationName] = useState('');

  useEffect(() => {
    fetchChatDetails();
  }, []);

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
        fetchPinnedConversations(response.data.agent_id);
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
      return; // 如果消息已经加载，则不重复加载
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
    setIsConversationListLoading(true);
    try {
      const response = await axios.get(`/console/api/chat/agent/${agentId}/pinned-conversations`);
      setPinnedConversations(response.data);
      setIsConversationListLoading(false);
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
        name: `新会话 ${new Date().toLocaleString()}`
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

            {isConversationListLoading ? (
              <ConversationListSkeleton />
            ) : (
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
                <div className="flex flex-col h-full">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    最近对话
                  </h3>
                  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {conversationHistory.map(chat => (
                      <SidebarItem
                        key={chat.id}
                        text={chat.name}
                        isActive={chat.id === currentConversationId}
                      />
                    ))}
                  </div>
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
              </nav>
            )}
          </>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm relative">
        {isChatMessagesLoading ? (
          <ChatAreaSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between p-3 flex-shrink-0 border-b border-secondary">
              <h3 className="text-base font-semibold text-text-body font-sans-sc truncate">
                {conversationName || '新对话'}
              </h3>
              <div className="flex items-center">
                <button className="text-text-muted hover:text-text-body p-1 rounded-full hover:bg-bg-secondary transition-colors duration-200 ml-2">
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

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
                  <div className={`inline-block p-3 rounded-xl ${message.message_type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-bg-tertiary text-text-primary'
                    } max-w-[70%]`}
                  >
                    <p className={`text-sm leading-relaxed ${message.message_type === 'user'
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

            {/* Chat input */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="w-full py-3 px-4 bg-white rounded-lg border border-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        )}
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

export default Chat;