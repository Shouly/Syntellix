import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ConversationListSkeleton } from './ChatSkeletons';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import RenameModal from '../RenameModal';
import axios from 'axios';
import { useToast } from '../Toast';

function RecentConversations({
  agentId,
  currentConversationId,
  onConversationClick,
  onConversationUpdate,
  onConversationDelete,
  recentConversations,
  setRecentConversations,
  shouldLoadConversations,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const [localConversations, setLocalConversations] = useState(recentConversations);

  useEffect(() => {
    setLocalConversations(recentConversations);
  }, [recentConversations]);

  const fetchConversationHistory = useCallback(async () => {
    if (!agentId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/console/api/chat/agent/${agentId}/conversation-history`, {
        params: { limit: 10, page }
      });
      setRecentConversations(prev => [...prev, ...response.data]);
      setHasMore(response.data.length === 10);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, page, setRecentConversations]);

  useEffect(() => {
    if (shouldLoadConversations && agentId) {
      setRecentConversations([]);
      setPage(1);
      fetchConversationHistory();
    }
  }, [agentId, shouldLoadConversations, setRecentConversations]);

  const filteredConversations = useMemo(() => {
    return localConversations.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localConversations, searchTerm]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const distance = formatDistanceToNow(date, { locale: zhCN });
    return distance.replace(/大约 /, '')
      .replace(/ 天/, '天')
      .replace(/ 个?小时/, '小时')
      .replace(/ 分钟/, '分钟')
      .replace(/不到 /, '');
  };

  const handleRename = (id) => {
    if (editingId === id) {
      onConversationUpdate(id, newName);
      setEditingId(null);
    } else {
      setEditingId(id);
      setNewName(localConversations.find(chat => chat.id === id).name);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    setIsDeleting(true);
    try {
      await axios.delete('/console/api/chat/conversations', {
        data: { conversation_id: conversationId }
      });
      setRecentConversations(prevHistory => 
        prevHistory.filter(conv => conv.id !== conversationId)
      );
      onConversationDelete(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast('删除对话失败', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleRenameConversation = async (conversationId, newName) => {
    setIsRenaming(true);
    try {
      const response = await axios.put('/console/api/chat/conversations', {
        conversation_id: conversationId,
        new_name: newName
      });
      setRecentConversations(prevHistory => 
        prevHistory.map(conv => 
          conv.id === conversationId ? { ...conv, name: response.data.name } : conv
        )
      );
      onConversationUpdate(response.data);
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      showToast('重命名对话失败', 'error');
    } finally {
      setIsRenaming(false);
      setEditingId(null);
    }
  };

  const handleConversationClick = (chatId) => {
    if (editingId !== chatId) {
      onConversationClick(chatId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="px-4 py-3 border-b border-border-primary">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索对话"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
        </div>
      </div>
      {isLoading && page === 1 ? (
        <ConversationListSkeleton />
      ) : (
        <ul className="flex-1 overflow-y-auto py-2 space-y-1">
          {filteredConversations.map(chat => (
            <li
              key={chat.id}
              className={`mx-2 rounded-md transition-all duration-200 ${
                chat.id === currentConversationId
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'text-text-body hover:bg-bg-secondary'
              }`}
            >
              <div 
                className="py-2.5 px-3 flex items-center justify-between group cursor-pointer"
                onClick={() => handleConversationClick(chat.id)}
              >
                <div className="flex-grow mr-2 min-w-0 flex items-center">
                  {editingId === chat.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(chat.id);
                        }
                      }}
                      className="bg-transparent border-none focus:outline-none text-sm font-sans-sc w-full"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className={`font-sans-sc text-sm ${chat.id === currentConversationId ? 'font-medium' : ''} truncate flex-shrink min-w-0`}>
                      {chat.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(chat.id);
                      }}
                      className="text-text-muted hover:text-primary transition-colors duration-200 p-1 rounded-full hover:bg-bg-tertiary"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalOpen(true);
                        setDeletingId(chat.id);
                      }}
                      className="text-text-muted hover:text-danger transition-colors duration-200 p-1 rounded-full hover:bg-bg-tertiary"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {formatRelativeTime(chat.updated_at || chat.created_at)}前
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <div className="px-4 py-3 border-t border-border-primary">
          <button
            onClick={fetchConversationHistory}
            className="w-full py-2 px-4 bg-bg-secondary hover:bg-bg-tertiary text-primary font-medium text-sm rounded-md transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowPathIcon className="w-4 h-4 mr-2" />
            )}
            {isLoading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => handleDeleteConversation(deletingId)}
        itemType="对话"
        itemName={deletingId ? localConversations.find(chat => chat.id === deletingId)?.name : ''}
        isLoading={isDeleting}
      />
      <RenameModal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        onRename={(newName) => handleRenameConversation(editingId, newName)}
        currentName={localConversations.find(chat => chat.id === editingId)?.name || ''}
        itemType="对话"
        isLoading={isRenaming}
      />
    </div>
  );
}

export default RecentConversations;
