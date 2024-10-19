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
  const { showToast } = useToast();
  const [localConversations, setLocalConversations] = useState(recentConversations);
  const [lastId, setLastId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setLocalConversations(recentConversations);
  }, [recentConversations]);

  const fetchConversationHistory = useCallback(async () => {
    if (!agentId) return;
    setIsLoadingMore(true);
    try {
      const response = await axios.get(`/console/api/chat/agent/${agentId}/conversation-history`, {
        params: { 
          last_id: lastId,
          limit: 10
        }
      });
      const newConversations = response.data;
      setRecentConversations(prev => [...prev, ...newConversations]);
      setHasMore(newConversations.length === 10);
      if (newConversations.length > 0) {
        setLastId(newConversations[newConversations.length - 1].id);
      }
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    } finally {
      setIsLoadingMore(false);
      setIsInitialLoading(false);
    }
  }, [agentId, lastId]);

  useEffect(() => {
    if (shouldLoadConversations && agentId) {
      setRecentConversations([]);
      setLastId(null);
      setIsInitialLoading(true);
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
      setRecentConversations(prevHistory => {
        const updatedHistory = prevHistory.filter(conv => conv.id !== conversationId);
        // 如果删除的是最后一个对话，更新 lastId
        if (updatedHistory.length > 0 && conversationId === lastId) {
          setLastId(updatedHistory[updatedHistory.length - 1].id);
        } else if (updatedHistory.length === 0) {
          // 如果删除后没有对话了，重置 lastId
          setLastId(null);
        }
        return updatedHistory;
      });
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

  const handleConversationClick = (chat) => {
    if (editingId !== chat.id) {
      onConversationClick(chat);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索对话"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-bg-secondary text-text-primary placeholder-text-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
          />
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>
      <div className="h-px bg-border-primary mx-4"></div>
      {isInitialLoading ? (
        <ConversationListSkeleton />
      ) : (
        <ul className="flex-1 overflow-y-auto py-2 space-y-1">
          {filteredConversations.map(chat => (
            <li
              key={chat.id}
              className={`mx-2 rounded-lg transition-all duration-200 ${
                chat.id === currentConversationId
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'text-text-body hover:bg-bg-secondary'
              }`}
            >
              <div 
                className="py-2.5 px-3 flex items-center justify-between group cursor-pointer"
                onClick={() => handleConversationClick(chat)}
              >
                <div className="flex-grow min-w-0 flex items-center mr-2">
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
                    <span className={`font-sans-sc text-sm ${chat.id === currentConversationId ? 'font-medium' : ''} truncate`}>
                      {chat.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
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
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatRelativeTime(chat.updated_at || chat.created_at)}前
                  </span>
                </div>
              </div>
            </li>
          ))}
          {hasMore && (
            <li className="mx-2 mt-2">
              <button
                onClick={fetchConversationHistory}
                className="w-full py-2.5 px-4 bg-bg-secondary hover:bg-bg-tertiary text-primary font-medium text-sm rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                )}
                {isLoadingMore ? '加载中...' : '加载更多'}
              </button>
            </li>
          )}
        </ul>
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
