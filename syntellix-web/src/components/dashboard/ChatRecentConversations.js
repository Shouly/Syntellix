import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ConversationListSkeleton } from './ChatSkeletons';
import SidebarItem from './ChatSidebarItem';

function RecentConversations({
  conversationHistory,
  currentConversationId,
  isConversationListLoading,
  hasMoreConversations,
  onConversationClick,
  onRenameConversation,
  onDeleteConversation,
  onLoadMore
}) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-4 mb-3">
        最近会话
      </h3>
      {isConversationListLoading ? (
        <ConversationListSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversationHistory.map(chat => (
            <SidebarItem
              key={chat.id}
              text={chat.name}
              timestamp={chat.updated_at || chat.created_at}
              isActive={chat.id === currentConversationId}
              onClick={() => onConversationClick(chat.id)}
              onRename={(newName) => onRenameConversation(chat.id, newName)}
              onDelete={() => onDeleteConversation(chat.id)}
            />
          ))}
        </div>
      )}
      {hasMoreConversations && (
        <div
          onClick={onLoadMore}
          className="py-2 px-4 mt-2 text-primary hover:bg-primary hover:bg-opacity-10 flex items-center justify-center cursor-pointer rounded-md transition-colors duration-200"
        >
          <span className="font-sans-sc text-sm font-semibold flex items-center">
            <PlusIcon className="w-4 h-4 mr-1" />
            加载更多
          </span>
        </div>
      )}
    </div>
  );
}

export default RecentConversations;
