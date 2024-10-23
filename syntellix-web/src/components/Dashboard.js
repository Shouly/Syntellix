import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
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
import SystemLogo from '../assets/logo.svg';
import AccountSettings from './AccountSettings';
import { useUser } from './contexts/UserContext';
import Agent from './dashboard/Agent';
import Chat from './dashboard/Chat';
import ChatHomePage from './dashboard/ChatHomePage';
import CreateAgent from './dashboard/CreateAgent';
import CreateKnowledgeBase from './dashboard/CreateKnowledgeBase';
import Database from './dashboard/Database';
import KnowledgeBase from './dashboard/KnowledgeBase';
import KnowledgeBaseDetail from './dashboard/KnowledgeBaseDetail';
import Settings from './dashboard/Settings';
import UploadFiles from './dashboard/UploadFiles';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Agent');
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const { userProfile, isLoadingProfile, updateUserProfile } = useUser();
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isCreatingKnowledgeBase, setIsCreatingKnowledgeBase] = useState(false);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedAgentForChat, setSelectedAgentForChat] = useState(null);
  const [showChatHomePage, setShowChatHomePage] = useState(true);
  const [initialMessage, setInitialMessage] = useState('');
  const [initialConversation, setInitialConversation] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);

  const handleDeleteCurrentConversation = () => {
    setShowChatHomePage(true);
    setInitialMessage('');
    setInitialConversation(null);
    setIsNewChat(true);
  };

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
    updateUserProfile(updatedProfile);
  };

  const handleMenuChange = (menuName) => {
    setActiveMenu(menuName);
    if (menuName === 'Chat') {
      setShowChatHomePage(true);
    } else {
      setShowChatHomePage(false);
    }
    if (menuName === 'KnowledgeBase') {
      setIsCreatingKnowledgeBase(false);
      setSelectedKnowledgeBaseId(null);
    }
    if (menuName === 'Agent') {
      setIsCreatingAgent(false);
      setSelectedAgentId(null);
    }
  };

  const handleAgentClick = (agent) => {
    setSelectedAgentForChat(agent);
    setActiveMenu('Chat');
    setShowChatHomePage(true);
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
    setSelectedKnowledgeBaseId(selectedKnowledgeBaseId);
  };

  const handleNewChat = () => {
    setShowChatHomePage(true);
    setActiveMenu('Chat');
  };

  const handleChatStart = (agentInfo, message, conversation = null) => {
    setShowChatHomePage(false);
    setSelectedAgentForChat(agentInfo);
    setInitialMessage(message);
    setInitialConversation(conversation);
    setIsNewChat(!conversation);
    setActiveMenu('Chat');
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
        return showChatHomePage ? (
          <ChatHomePage
            onChatStart={handleChatStart}
            selectedAgentId={selectedAgentForChat?.id}
          />
        ) : (
          <Chat
            selectedAgent={selectedAgentForChat}
            initialMessage={initialMessage}
            initialConversation={initialConversation}
            isNewChat={isNewChat}
            setIsNewChat={setIsNewChat}
            onNewChat={handleNewChat}
            onDeleteCurrentConversation={handleDeleteCurrentConversation}
          />
        );
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
        className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200 hover:bg-bg-primary hover:shadow-md"
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
        <div className="absolute left-full ml-2 bottom-0 w-48 bg-bg-primary rounded-lg shadow-lg overflow-hidden z-20 border border-bg-tertiary">
          <button
            onClick={handleAccountSettings}
            className="w-full text-left py-2.5 px-4 text-sm text-text-body hover:bg-bg-secondary transition-colors duration-200 flex items-center"
          >
            <Cog6ToothIconOutline className="w-4 h-4 mr-3 text-primary" />
            设置
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left py-2.5 px-4 text-sm text-text-body hover:bg-bg-secondary transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <ArrowPathIcon className="animate-spin w-4 h-4 mr-3 text-primary" />
                登出中...
              </>
            ) : (
              <>
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-primary" />
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
      <nav className="w-16 z-10 flex flex-col items-center py-4 bg-bg-secondary">
        {/* Logo */}
        <div className="w-12 h-12 flex items-center justify-center group mb-6">
          <img
            src={SystemLogo}
            alt="System Logo"
            className="w-9 h-9 transition-all duration-300 group-hover:w-12 group-hover:h-12 group-hover:rotate-90"
          />
        </div>

        {/* Menu Items - Vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-5">
          {menuItems.map((item) => (
            <React.Fragment key={item.name}>
              <button
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg text-[11px] font-medium transition-all duration-200 relative
                  ${activeMenu === item.name
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
                  <div className="group">
                    <item.outlineIcon className="w-5 h-5 mb-1 group-hover:hidden" />
                    <item.icon className="w-5 h-5 mb-1 hidden group-hover:block" />
                  </div>
                )}
                <span className="relative z-10">{item.displayName}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* User Menu - Moved to bottom with padding */}
        <div className="mt-auto pt-6 pb-2">
          <UserMenu
            userProfile={userProfile}
            isLoadingProfile={isLoadingProfile}
            handleAccountSettings={handleAccountSettings}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </nav>

      <div className="flex-1 overflow-hidden pt-1 pb-1 pr-1 bg-bg-secondary">
        <main className="h-full flex flex-col bg-bg-primary rounded-lg shadow-md border border-[#e0e0e0]">
          {/* Content */}
          <div className="flex-1 overflow-hidden rounded-lg">
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
