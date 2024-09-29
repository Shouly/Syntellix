import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ChatBubbleLeftRightIcon, UserCircleIcon, PaperAirplaneIcon, PlusIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import NewChatPrompt from './NewChatPrompt';

function Chat() {
  const [recentChatStatus, setRecentChatStatus] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchRecentChatStatus();
  }, []);

  const fetchRecentChatStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/console/api/recent-chat-status');
      setRecentChatStatus(response.data);
      if (response.data.has_recent_conversation) {
        fetchAgentChatDetails(response.data.agent_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch recent chat status:', error);
      setError('Failed to load chat status. Please try again.');
      setLoading(false);
    }
  };

  const fetchAgentChatDetails = async (agentId) => {
    try {
      const response = await axios.get(`/console/api/agent-chat-details/${agentId}`);
      setChatDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent chat details:', error);
      setError('Failed to load chat details. Please try again.');
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      // TODO: Implement sending message to backend
      setInputMessage('');
    }
  };

  const handleSelectAgent = async (agentId) => {
    // TODO: Implement logic to start a new chat with the selected agent
    console.log('Starting new chat with agent:', agentId);
    // You might want to create a new conversation here and then redirect to it
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">{error}</div>;
  }

  if (!recentChatStatus?.has_recent_conversation) {
    return <NewChatPrompt onSelectAgent={handleSelectAgent} />;
  }

  return (
    <div className="h-full flex overflow-hidden gap-6 p-3">
      {/* Left sidebar */}
      <div className="w-64 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
        <div className="p-6 flex-shrink-0">
          <div className="mb-10 mt-5">
            <div className="flex items-center mb-10 cursor-pointer group">
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-lg font-semibold text-text-body font-sans-sc truncate">
                {chatDetails?.agent_info?.name || '智能助手'}
              </h1>
            </div>
          </div>

          <button
            onClick={() => {/* Handle new chat */}}
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
              {chatDetails?.pinned_conversations.map(chat => (
                <SidebarItem key={chat.id} text={chat.name} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              最近对话
            </h3>
            <ul className="space-y-1">
              {chatDetails?.conversation_history.map(chat => (
                <SidebarItem key={chat.id} text={chat.name} />
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main chat area */}
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
        <div className="flex-1 overflow-y-auto px-6 pb-24" ref={chatContainerRef}>
          {chatDetails?.latest_conversation_messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.message_type === 'agent' && (
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary mr-2 self-end" />
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
                <UserCircleIcon className="w-8 h-8 text-primary ml-2 self-end" />
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
    </div>
  );
}

function SidebarItem({ text, active = false }) {
  return (
    <li className={`py-2 px-3 rounded-lg transition-colors duration-200 ${
      active ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body hover:bg-bg-secondary'
    }`}>
      <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''} truncate`}>{text}</span>
    </li>
  );
}

export default Chat;