import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CircleStackIcon,
  Cog6ToothIcon as Cog6ToothIconOutline,
  UserCircleIcon
} from '@heroicons/react/24/outline';

import {
  BeakerIcon as BeakerIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CircleStackIcon as CircleStackIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSettings from './AccountSettings';
import Agent from './dashboard/Agent';
import Chat from './dashboard/Chat';
import Database from './dashboard/Database';
import KnowledgeBase from './dashboard/KnowledgeBase';
import Settings from './dashboard/Settings';
import CreateKnowledgeBase from './dashboard/CreateKnowledgeBase';
import KnowledgeBaseDetail from './dashboard/KnowledgeBaseDetail';
import UploadFiles from './dashboard/UploadFiles';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Agent');
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isCreatingKnowledgeBase, setIsCreatingKnowledgeBase] = useState(false);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

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
    // 当切换到知识库菜单时，确保回到知识库主页面
    if (menuName === 'KnowledgeBase') {
      setIsCreatingKnowledgeBase(false);
      setSelectedKnowledgeBaseId(null);
    }
  };

  const handleKnowledgeBaseClick = (id) => {
    setSelectedKnowledgeBaseId(id);
  };

  const handleBackToKnowledgeBase = () => {
    setSelectedKnowledgeBaseId(null);
    setIsCreatingKnowledgeBase(false);
  };

  const handleUploadComplete = (uploadedFiles) => {
    setIsUploadingFiles(false);
    // Here you can add logic to refresh the document list or update the knowledge base
    // For now, we'll just go back to the KnowledgeBaseDetail view
    setSelectedKnowledgeBaseId(selectedKnowledgeBaseId);
  };

  const menuItems = [
    { name: 'Chat', displayName: '对话', icon: ChatBubbleLeftRightIconSolid, outlineIcon: ChatBubbleLeftRightIcon },
    { name: 'Agent', displayName: '智能体', icon: BeakerIconSolid, outlineIcon: BeakerIcon },
    { name: 'KnowledgeBase', displayName: '知识库', icon: BookOpenIconSolid, outlineIcon: BookOpenIcon },
    { name: 'Database', displayName: '数据库', icon: CircleStackIconSolid, outlineIcon: CircleStackIcon },
    { name: 'Settings', displayName: '设置', icon: Cog6ToothIconSolid, outlineIcon: Cog6ToothIconOutline },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'Chat':
        return <Chat />;
      case 'Agent':
        return <Agent />;
      case 'KnowledgeBase':
        if (isCreatingKnowledgeBase) {
          return (
            <CreateKnowledgeBase
              onBack={handleBackToKnowledgeBase}
              onCreated={(newKnowledgeBase) => {
                setIsCreatingKnowledgeBase(false);
                // Add logic to update knowledge base list
              }}
            />
          );
        } else if (selectedKnowledgeBaseId) {
          return (
            <KnowledgeBaseDetail
              id={selectedKnowledgeBaseId}
              onBack={handleBackToKnowledgeBase}
              onAddDocument={() => setIsUploadingFiles(true)}
            />
          );
        } else if (isUploadingFiles) {
          return (
            <UploadFiles
              onBack={() => setIsUploadingFiles(false)}
              onUploadComplete={handleUploadComplete}
            />
          );
        } else {
          return (
            <KnowledgeBase
              onCreateNew={() => setIsCreatingKnowledgeBase(true)}
              onKnowledgeBaseClick={handleKnowledgeBaseClick}
            />
          );
        }
      case 'Database':
        return <Database />;
      case 'Settings':
        return <Settings />;
      default:
        return null;
    }
  };

  const UserMenu = ({ userProfile, isLoadingProfile, handleAccountSettings, handleLogout, isLoggingOut }) => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full py-1 px-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
          {userProfile?.name ? (
            <span className="text-xs font-semibold text-white">
              {userProfile.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserCircleIcon className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700 truncate">
          {isLoadingProfile ? '加载中' : (userProfile?.name || '用户')}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-600 ml-1" />
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-indigo-100">
          <button
            onClick={handleAccountSettings}
            className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200 flex items-center"
          >
            <Cog6ToothIconOutline className="w-4 h-4 mr-2 text-indigo-500" />
            设置
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <ArrowPathIcon className="animate-spin w-4 h-4 mr-2 text-indigo-500" />
                登出中...
              </>
            ) : (
              <>
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-indigo-500" />
                登出
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Subtle tech-inspired background */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMTAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-10"></div>
      </div> */}

      {/* Top Navigation */}
      <nav className="bg-white backdrop-filter backdrop-blur-sm p-3 z-10 shadow">
        <div className="max-w-full mx-auto flex justify-between items-center">
          {/* Logo - Left aligned */}
          <div className="flex-shrink-0">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-transparent bg-clip-text cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={handleLogoClick}
            >
              Syntellix
            </h1>
          </div>

          {/* Menu Items - Centered */}
          <div className="flex-grow flex justify-center items-center space-x-2">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.name}>
                <button
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeMenu === item.name
                      ? 'bg-indigo-200 bg-opacity-70 text-indigo-900 hover:bg-opacity-90 shadow-md'
                      : 'text-gray-600 hover:bg-indigo-50 hover:bg-opacity-50 hover:text-indigo-700'
                    }`}
                  onClick={() => handleMenuChange(item.name)}
                >
                  {activeMenu === item.name ? (
                    <item.icon className="w-5 h-5 mr-2 text-indigo-800" />
                  ) : (
                    <item.outlineIcon className="w-5 h-5 mr-2 text-gray-500" />
                  )}
                  <span>{item.displayName}</span>
                </button>
                {index === 0 && (
                  <div className="h-6 w-px bg-gray-300 mx-2 opacity-50"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* User Menu - Right aligned */}
          <div className="flex-shrink-0">
            <UserMenu
              userProfile={userProfile}
              isLoadingProfile={isLoadingProfile}
              handleAccountSettings={handleAccountSettings}
              handleLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm overflow-hidden">
        {/* Content area */}
        <main className="flex-1 overflow-auto bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm">
          <div className="px-4 sm:px-6 md:px-8 lg:px-10">
            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>

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