import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ClockIcon, ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

function Chat() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAgent, setCurrentAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const recentAgents = [
    { id: 1, name: '小嘟汽修铺', avatar: '/path/to/avatar.jpg' }
  ];

  const suggestedQuestions = [
    '我的车胎爆在路上了，你们能修吗？',
    '你们收费是怎么样的呢？',
    '汽车如何进行定期保养？'
  ];

  const handleNewChat = () => {
    setCurrentAgent(null);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      // 这里添加发送消息到后端的逻辑
    }
  };

  return (
    <div className="flex h-full">
      {/* 左侧边栏 */}
      <div className="w-1/4 bg-white bg-opacity-70 backdrop-filter backdrop-blur-md p-4 flex flex-col border-r border-indigo-100">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索 agent"
              className="w-full p-2 pl-8 rounded-lg border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          className="flex items-center justify-center bg-white text-blue-600 rounded-lg p-2 mb-4 hover:bg-blue-50"
          onClick={handleNewChat}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新会话
        </button>
        <div className="flex-grow overflow-y-auto">
          <h3 className="font-semibold mb-2 flex items-center">
            <ClockIcon className="h-5 w-5 mr-1" />
            最近使用
          </h3>
          {recentAgents.map(agent => (
            <div
              key={agent.id}
              className="flex items-center p-2 hover:bg-gray-200 rounded-lg cursor-pointer"
              onClick={() => setCurrentAgent(agent)}
            >
              <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full mr-2" />
              <span>{agent.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 主对话区域 */}
      <div className="flex-1 flex flex-col bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm">
        {currentAgent ? (
          <>
            <div className="bg-white bg-opacity-80 p-4 shadow-md">
              <div className="flex items-center">
                <img src={currentAgent.avatar} alt={currentAgent.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h2 className="text-xl font-bold">{currentAgent.name}</h2>
                  <p className="text-gray-600">除了感情不修，啥都能修。老铁！有啥可以帮你的吗？</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* 这里显示消息历史 */}
            </div>
            <div className="p-4 border-t border-indigo-100">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="问我任何问题..."
                  className="flex-1 p-2 rounded-l-lg border-l border-t border-b border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 transition-colors duration-200">
                  <ArrowPathIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">暂无会话</h2>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="block w-full text-left p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;