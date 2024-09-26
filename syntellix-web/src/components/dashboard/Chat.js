import { BookmarkIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon, DocumentTextIcon, PaperAirplaneIcon, PlusIcon, StarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';

function Chat({ onBack }) {
  const [currentAgent, setCurrentAgent] = useState({ id: 1, name: '人力资源助手', avatar: '/path/to/avatar.jpg' });
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
    { id: 1, title: '查询年假余额' },
    { id: 2, title: '办公环境投诉' },
  ];

  const recentChats = [
    { id: 3, title: '加班时间计算错误' },
    { id: 4, title: '晋升机会咨询' },
    { id: 5, title: '技能提升培训申请' },
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
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-lg font-semibold text-text-body font-sans-sc truncate">
                {currentAgent.name}
              </h1>
            </div>
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
              {pinnedChats.map(chat => (
                <SidebarItem key={chat.id} text={chat.title} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              最近对话
            </h3>
            <ul className="space-y-1">
              {recentChats.map(chat => (
                <SidebarItem key={chat.id} text={chat.title} />
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
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary mr-2 self-end" />
              )}
              <div className={`inline-block p-3 rounded-xl ${message.sender === 'user'
                ? 'bg-primary text-white'
                : 'bg-bg-tertiary text-text-primary'
                } max-w-[70%]`}
              >
                <p className={`text-sm leading-relaxed ${message.sender === 'user'
                  ? 'font-sans-sc font-medium'
                  : 'font-sans-sc font-normal'
                  }`}
                >
                  {message.text}
                </p>
              </div>
              {message.sender === 'user' && (
                <UserCircleIcon className="w-8 h-8 text-primary ml-2 self-end" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="输入您的问题..."
              className="w-full p-3 pr-12 rounded-lg border border-secondary bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark transition-colors duration-200"
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