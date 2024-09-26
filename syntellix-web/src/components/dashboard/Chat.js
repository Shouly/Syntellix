import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon, PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

function Chat({ onBack }) {
  const [currentAgent, setCurrentAgent] = useState({ id: 1, name: 'Tesla HR assistant', avatar: '/path/to/avatar.jpg' });
  const [chatName, setChatName] = useState('未命名会话');
  const [messages, setMessages] = useState([
    { text: "您好!我是Tesla HR助手。我可以帮您解答有关人力资源的问题。请问有什么我可以帮到您的吗?", sender: 'ai' },
    { text: "你好,我想了解一下我的年假余额。", sender: 'user' },
    { text: "当然可以。根据我们的记录,您目前的年假余额是15天。您可以在公司的HR系统中查看详细信息,包括已使用的天数和即将到期的天数。您是否需要我帮您查看更多细节?", sender: 'ai' },
    { text: "谢谢,这个信息已经足够了。我还有一个问题,关于加班补偿的政策是怎样的?", sender: 'user' },
    { text: "关于加班补偿,Tesla的政策如下:\n\n1. 工作日加班:可选择调休或领取加班工资,加班工资为平时工资的1.5倍。\n2. 周末加班:可获得双倍工资或选择调休。\n3. 法定节假日加班:可获得三倍工资。\n\n请注意,所有加班都需要提前得到主管批准。您还有其他问题吗?", sender: 'ai' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const pinnedChats = [
    { id: 1, title: 'Check paid annual leave balance' },
    { id: 2, title: 'Dissatisfied with office...' },
  ];

  const recentChats = [
    { id: 3, title: 'Overtime hours miscal...' },
    { id: 4, title: 'Inquiring about promoti...' },
    { id: 5, title: 'Applying for skills impr...' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // This will trigger scrollToBottom whenever messages change

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      const scrollHeight = scrollContainer.scrollHeight;
      const height = scrollContainer.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      scrollContainer.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      
      // Simulating AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "This is a simulated AI response. In a real application, this should call a backend API to get the actual AI response.", sender: 'ai' }]);
      }, 1000);
    }
  };

  return (
    <div className="h-full flex overflow-hidden gap-4">
      {/* Left sidebar */}
      <div className="w-64 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
        <div className="p-6 flex-shrink-0">
          <div className="mb-10 mt-5">
            <div className="flex items-center mb-10 cursor-pointer group" onClick={onBack}>
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                <img src={currentAgent.avatar} alt="AI Avatar" className="w-6 h-6 rounded-full" />
              </div>
              <h1 className="text-base font-semibold text-text-body font-sans-sc truncate">
                {currentAgent.name}
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
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">固定对话</h3>
            <ul className="space-y-1">
              {pinnedChats.map(chat => (
                <SidebarItem key={chat.id} icon={ChatBubbleLeftRightIcon} text={chat.title} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">最近对话</h3>
            <ul className="space-y-1">
              {recentChats.map(chat => (
                <SidebarItem key={chat.id} icon={ClockIcon} text={chat.title} />
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-text-body font-sans-sc">{chatName}</h3>
          <button className="text-text-muted hover:text-text-body">
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'ai' && (
                <img src={currentAgent.avatar} alt="AI Avatar" className="w-8 h-8 rounded-full mr-2" />
              )}
              <div className={`inline-block p-3 rounded-lg ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-primary'} max-w-[70%]`}>
                {message.text}
              </div>
              {message.sender === 'user' && (
                <img src="/path/to/user-avatar.jpg" alt="User Avatar" className="w-8 h-8 rounded-full ml-2" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="输入您的问题..."
              className="flex-1 p-2 rounded-l-lg border border-secondary bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="bg-primary text-white p-2 rounded-r-lg hover:bg-primary-dark transition-colors duration-200"
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

function SidebarItem({ icon: Icon, text, active = false }) {
  return (
    <li className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
      active ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body hover:bg-bg-secondary'
    }`}>
      <Icon className={`w-5 h-5 mr-3 ${active ? 'text-primary' : 'text-text-muted'}`} />
      <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''} truncate`}>{text}</span>
    </li>
  );
}

export default Chat;