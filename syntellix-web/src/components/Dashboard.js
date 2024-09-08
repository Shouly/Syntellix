import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Cog6ToothIcon, BeakerIcon, BookOpenIcon, CircleStackIcon, UserIcon, ChevronUpIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Agents from './dashboard/Agent';
import KnowledgeBase from './dashboard/KnowledgeBase';
import Database from './dashboard/Database';
import Settings from './dashboard/Settings';
import Chat from './dashboard/Chat';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Agent');
  const [showLogout, setShowLogout] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get('/console/api/logout');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  const menuItems = [
    { name: 'Chat', displayName: '对话', icon: ChatBubbleLeftRightIcon },
    { name: 'Agent', displayName: '智能体', icon: BeakerIcon },
    { name: 'KnowledgeBase', displayName: '知识库', icon: BookOpenIcon },
    { name: 'Database', displayName: '数据库', icon: CircleStackIcon },
    { name: 'Settings', displayName: '设置', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-300 relative overflow-hidden">
      {/* Subtle tech-inspired background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMTAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMDAwMDIwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-30"></div>
      </div>

      {/* Left Sidebar */}
      <div className={`${isMenuCollapsed ? 'w-16' : 'w-56'} flex flex-col transition-all duration-300 ease-in-out relative`}>
        <div className="p-6 flex items-center">
          <img src="logo512.png" alt="Syntellix Logo" className="w-10 h-10 mr-3" />
          {!isMenuCollapsed && <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-transparent bg-clip-text">Syntellix</h1>}
        </div>
        
        <nav className="flex-grow px-2 flex flex-col justify-start pt-10">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <button
                className={`flex items-center w-11/12 mx-auto px-3 py-3 mb-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeMenu === item.name
                    ? 'bg-white bg-opacity-40 text-indigo-900 shadow-md'
                    : 'text-indigo-800 hover:bg-white hover:bg-opacity-30 hover:text-indigo-900'
                }`}
                onClick={() => setActiveMenu(item.name)}
              >
                <item.icon className={`w-5 h-5 mr-2 ${activeMenu === item.name ? 'text-indigo-600' : 'text-indigo-400'}`} />
                {!isMenuCollapsed && <span>{item.displayName}</span>}
              </button>
              {index === 0 && <div className="w-11/12 mx-auto border-t border-indigo-300 border-opacity-50 mb-4"></div>}
            </React.Fragment>
          ))}
        </nav>

        {/* Updated user info section */}
        <div className="p-4 border-t border-indigo-300 border-opacity-50 relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex items-center w-full text-left transition-colors duration-200 hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            {!isMenuCollapsed && (
              <div className="ml-2 flex flex-col">
                <span className="text-sm font-medium text-indigo-800">admin</span>
                {isHovering && (
                  <span className="text-xs text-indigo-600">bing.liang@gmail.com</span>
                )}
              </div>
            )}
          </button>
          {showLogout && (
            <div className="absolute bottom-full left-0 w-full bg-white shadow-md rounded-t-md overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                登出
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden p-3">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col border border-white border-opacity-20">
          {/* Header */}
          <header className="p-4 border-b border-indigo-300 border-opacity-20">
            <h2 className="text-2xl font-bold text-indigo-800 font-noto-sans-sc">
              {menuItems.find(item => item.name === activeMenu)?.displayName}
            </h2>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-auto p-4">
            {activeMenu === 'Chat' && <Chat />}
            {activeMenu === 'Agent' && <Agents />}
            {activeMenu === 'KnowledgeBase' && <KnowledgeBase />}
            {activeMenu === 'Database' && <Database />}
            {activeMenu === 'Settings' && <Settings />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;