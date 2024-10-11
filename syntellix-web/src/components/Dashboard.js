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
import CreateAgent from './dashboard/CreateAgent';
import syntellixLogo from '../assets/syntellix_logo.png';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedAgentForChat, setSelectedAgentForChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (menuName === 'Agent') {
      setIsCreatingAgent(false);
      setSelectedAgentId(null);
    }
  };

  const handleAgentClick = (id) => {
    setSelectedAgentForChat(id);
    setActiveMenu('Chat');
  };

  const handleBackToAgent = () => {
    setSelectedAgentId(null);
    setIsCreatingAgent(false);
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
        return <Chat selectedAgentId={selectedAgentForChat} />;
      case 'Agent':
        if (isCreatingAgent) {
          return (
            <CreateAgent
              onBack={handleBackToAgent}
              onCreated={(newAgent) => {
                setIsCreatingAgent(false);
                // Add logic to update agent list
              }}
            />
          );
        } else if (selectedAgentId) {
          // Add logic for displaying agent details
          return null;
        } else {
          return (
            <Agent
              onCreateNew={() => setIsCreatingAgent(true)}
              onAgentClick={handleAgentClick}
            />
          );
        }
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
        className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {userProfile?.name ? (
          <span className="text-xs font-semibold text-primary">
            {userProfile.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <UserCircleIcon className="w-5 h-5 text-primary" />
        )}
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-lg shadow-lg overflow-hidden z-20 border border-bg-tertiary">
          <button
            onClick={handleAccountSettings}
            className="w-full text-left py-2 px-4 text-sm text-text-body hover:bg-bg-secondary transition-colors duration-200 flex items-center"
          >
            <Cog6ToothIconOutline className="w-4 h-4 mr-2 text-primary" />
            设置
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left py-2 px-4 text-sm text-text-body hover:bg-bg-secondary transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <ArrowPathIcon className="animate-spin w-4 h-4 mr-2 text-primary" />
                登出中...
              </>
            ) : (
              <>
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-primary" />
                登出
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-bg-secondary">
      {/* Left Sidebar Navigation */}
      <nav className="w-16 z-10 flex flex-col items-center py-4 border-r border-bg-tertiary">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xl font-bold text-bg-primary">S</span>
        </div>

        {/* Menu Items - Vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <button
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg text-[11px] font-medium transition-all duration-200 relative
                  ${
                    activeMenu === item.name
                      ? 'text-primary bg-bg-secondary'
                      : 'text-text-body hover:text-primary'
                  }`}
                onClick={() => handleMenuChange(item.name)}
              >
                {activeMenu === item.name && (
                  <div className="absolute inset-0 bg-primary opacity-10 rounded-lg"></div>
                )}
                {activeMenu === item.name ? (
                  <item.icon className="w-5 h-5 mb-1 relative z-10" />
                ) : (
                  <item.outlineIcon className="w-5 h-5 mb-1" />
                )}
                <span className="relative z-10">{item.displayName}</span>
              </button>
              {index === 0 && (
                <div className="w-8 h-px bg-bg-tertiary my-2"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom placeholder to match the size of the logo */}
        <div className="w-10 h-10"></div>
      </nav>

      {/* Main content area with reduced padding */}
      <div className="flex-1 overflow-hidden p-1">
        <main className="h-full overflow-hidden bg-bg-primary rounded-lg shadow-lg flex flex-col">
          {/* Search bar */}
          <div className="p-2 border-b border-bg-tertiary flex items-center justify-between">
            <div className="w-16"></div> {/* Spacer */}
            <div className="relative w-1/2 max-w-md">
              <input
                type="text"
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-8 pr-3 text-sm bg-bg-secondary rounded-md border border-bg-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            <UserMenu
              userProfile={userProfile}
              isLoadingProfile={isLoadingProfile}
              handleAccountSettings={handleAccountSettings}
              handleLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
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