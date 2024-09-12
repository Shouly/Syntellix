import {
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Agent from './dashboard/Agent';
import Chat from './dashboard/Chat';
import Database from './dashboard/Database';
import KnowledgeBase from './dashboard/KnowledgeBase';
import Settings from './dashboard/Settings';
import AccountSettings from './AccountSettings';
import CreateKnowledgeBase from './dashboard/CreateKnowledgeBase';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Agent');
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const [tags, setTags] = useState(['全部标签']);
  const [selectedTag, setSelectedTag] = useState('全部标签');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [showCreateKnowledgeBase, setShowCreateKnowledgeBase] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await axios.get('/console/api/account/profile');
        setUserProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.get('/console/api/logout');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAccountSettings = () => {
    setIsAccountSettingsOpen(true);
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile
    }));
  };

  const handleMenuChange = (menuName) => {
    setActiveMenu(menuName);
    setShowCreateKnowledgeBase(false);
  };

  const handleCreateKnowledgeBase = () => {
    setShowCreateKnowledgeBase(true);
  };

  const handleBackToKnowledgeBase = () => {
    setShowCreateKnowledgeBase(false);
  };

  const menuItems = [
    { name: 'Chat', displayName: '对话', icon: ChatBubbleLeftRightIcon },
    { name: 'Agent', displayName: '智能体', icon: BeakerIcon },
    { name: 'KnowledgeBase', displayName: '知识库', icon: BookOpenIcon },
    { name: 'Database', displayName: '数据库', icon: CircleStackIcon },
    { name: 'Settings', displayName: '设置', icon: Cog6ToothIcon },
  ];

  const renderContent = () => {
    if (showCreateKnowledgeBase) {
      return <CreateKnowledgeBase onBack={handleBackToKnowledgeBase} />;
    }

    switch (activeMenu) {
      case 'Chat':
        return <Chat />;
      case 'Agent':
        return <Agent />;
      case 'KnowledgeBase':
        return <KnowledgeBase onCreateKnowledgeBase={handleCreateKnowledgeBase} />;
      case 'Database':
        return <Database />;
      case 'Settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 relative overflow-hidden">
      {/* Subtle tech-inspired background */}
      <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMTAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-20"></div>
      </div>

      {/* Left Sidebar */}
      <div className={`${isMenuCollapsed ? 'w-16' : 'w-48'} flex flex-col transition-all duration-300 ease-in-out relative z-10`}>
        <div className={`flex items-center ${isMenuCollapsed ? 'justify-center px-3' : 'px-4'} py-6`}>
          {isMenuCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
              <span className="flex-shrink-0">S</span>
            </div>
          ) : (
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-transparent bg-clip-text cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={handleLogoClick}
            >
              Syntellix
            </h1>
          )}
        </div>

        <nav className={`flex-grow ${isMenuCollapsed ? 'px-1' : 'px-4'} flex flex-col justify-start pt-10`}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <button
                className={`flex items-center ${
                  isMenuCollapsed ? 'justify-center w-full' : 'w-full'
                } px-4 py-3 mb-4 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeMenu === item.name
                    ? 'bg-white bg-opacity-60 text-indigo-800 shadow-md'
                    : 'text-gray-600 hover:bg-white hover:bg-opacity-40 hover:text-indigo-700'
                }`}
                onClick={() => handleMenuChange(item.name)}
              >
                <item.icon className={`w-5 h-5 ${!isMenuCollapsed && 'mr-3'} ${activeMenu === item.name ? 'text-indigo-700' : 'text-gray-500'}`} />
                {!isMenuCollapsed && <span>{item.displayName}</span>}
              </button>
              {index === 0 && <div className={`${isMenuCollapsed ? 'w-full' : 'w-full'} border-t border-indigo-300 mb-4`}></div>}
            </React.Fragment>
          ))}
        </nav>

        {/* Updated user info section with loading effect */}
        <div className={`mt-auto ${isMenuCollapsed ? 'px-1' : 'px-4'} pb-4 relative`}>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`flex items-center justify-center w-full text-left transition-all duration-200 rounded-full ${
                isMenuCollapsed ? 'p-0' : 'p-2'
              } ${
                isHovering
                  ? 'bg-indigo-200 shadow-md'
                  : 'bg-white bg-opacity-60'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium font-tech text-xs shadow-sm transition-colors duration-200 ${
                isHovering ? 'bg-indigo-700' : 'bg-indigo-500'
              }`}>
                {isLoadingProfile ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                ) : userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  (userProfile?.name && userProfile.name.charAt(0).toUpperCase()) || 'U'
                )}
              </div>
              {!isMenuCollapsed && (
                <>
                  <span className={`ml-2 text-sm font-medium font-tech transition-colors duration-200 ${
                    isHovering ? 'text-indigo-800' : 'text-gray-700'
                  }`}>
                    {isLoadingProfile ? 'Loading...' : userProfile?.name || 'User'}
                  </span>
                  <EllipsisHorizontalIcon className={`w-4 h-4 transition-colors duration-200 ${
                    isHovering ? 'text-indigo-700' : 'text-gray-500'
                  } ml-auto`} />
                </>
              )}
            </button>
            {showMenu && (
              <div className="absolute bottom-full left-0 w-full bg-white shadow-lg rounded-lg overflow-hidden mb-2 z-20">
                <button
                  onClick={handleAccountSettings}
                  className="w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 flex items-center font-noto-sans-sc"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  设置
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 flex items-center font-noto-sans-sc disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <ArrowPathIcon className="animate-spin w-4 h-4 mr-2" />
                      登出中...
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      登出
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse/Expand button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={toggleMenu}
          className={`${
            isMenuCollapsed ? 'left-16' : 'left-48'
          } absolute p-1 rounded-full bg-white shadow-md hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center`}
          style={{ transform: 'translateX(-25%)' }}
        >
          {isMenuCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <header className="p-6 flex items-center justify-between bg-white bg-opacity-70 backdrop-filter backdrop-blur-md">
            <div className="flex items-center">
              {showCreateKnowledgeBase && (
                <button
                  onClick={handleBackToKnowledgeBase}
                  className="mr-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-bold text-indigo-700 font-noto-sans-sc">
                {showCreateKnowledgeBase ? '创建知识库' : menuItems.find(item => item.name === activeMenu)?.displayName}
              </h2>
            </div>
            {!showCreateKnowledgeBase && (
              <div className="flex items-center space-x-4">
                {/* Tag selector */}
                <div className="relative">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="pl-10 pr-8 py-2 text-sm rounded-full bg-white bg-opacity-50 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer font-noto-sans-sc text-gray-600"
                  >
                    {tags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {/* Search box */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="pl-10 pr-4 py-2 text-sm rounded-full bg-white bg-opacity-50 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 w-64 font-noto-sans-sc text-gray-600"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
          </header>

          {/* Divider */}
          <div className="mx-6 border-t border-indigo-300 opacity-20"></div>

          {/* Content area */}
          <main className="flex-1 overflow-auto p-6 bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Add this at the end of the JSX */}
      <AccountSettings 
        isOpen={isAccountSettingsOpen} 
        onClose={() => setIsAccountSettingsOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default Dashboard;