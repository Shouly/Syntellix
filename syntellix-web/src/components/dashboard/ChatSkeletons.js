import React from 'react';

export function AgentInfoSkeleton() {
  return (
    <div className="p-6 flex-shrink-0 animate-pulse">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-secondary mr-3"></div>
          <div className="h-6 bg-secondary rounded w-3/4"></div>
        </div>
        <div className="h-4 bg-secondary rounded w-full mb-2"></div>
        <div className="h-4 bg-secondary rounded w-5/6 mb-4"></div>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-secondary rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-10 bg-primary rounded-lg mb-6"></div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <nav className="flex-1 overflow-y-auto px-6 pb-6 animate-pulse">
      <div>
        <div className="h-5 bg-secondary rounded w-1/2 mb-2"></div>
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-bg-secondary rounded-lg"></div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function ChatAreaSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden rounded-lg shadow-sm relative animate-pulse">
      <div className="flex items-center justify-between p-3 flex-shrink-0 border-b border-secondary">
        <div className="h-6 bg-secondary rounded w-1/3"></div>
        <div className="flex items-center">
          <div className="w-7 h-7 bg-secondary rounded-full"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && (
                <div className="w-8 h-8 rounded-full bg-secondary mr-2 flex-shrink-0"></div>
              )}
              <div className={`inline-block p-3 rounded-xl ${i % 2 === 0 ? 'bg-bg-tertiary' : 'bg-primary bg-opacity-10'} ${i % 2 === 0 ? 'w-[50%]' : 'w-[50%]'}`}>
                <div className="h-4 bg-secondary rounded w-full"></div>
              </div>
              {i % 2 !== 0 && (
                <div className="w-8 h-8 rounded-full bg-secondary ml-2 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
        <div className="h-14 bg-white rounded-lg w-full border border-secondary"></div>
      </div>
    </div>
  );
}

// Remove ChatHeaderSkeleton, ChatMessagesSkeleton, and ChatInputSkeleton