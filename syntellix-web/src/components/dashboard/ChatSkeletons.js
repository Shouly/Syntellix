import React from 'react';

export function AgentInfoSkeleton() {
  return (
    <div className="flex-shrink-0 p-4 animate-pulse">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-bg-tertiary mr-3"></div>
        <div className="h-5 bg-bg-tertiary rounded w-3/4"></div>
      </div>
      <div className="h-3 bg-bg-tertiary rounded w-full mb-2"></div>
      <div className="h-3 bg-bg-tertiary rounded w-5/6 mb-3"></div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto animate-pulse p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-bg-tertiary rounded-md mb-2 flex items-center px-3">
          <div className="h-3 bg-bg-secondary rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function ChatAreaSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-6 relative animate-pulse">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`mb-4 flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && (
                <div className="w-8 h-8 rounded-full bg-bg-tertiary mr-2 flex-shrink-0"></div>
              )}
              <div className={`inline-block p-3 rounded-xl ${i % 2 === 0 ? 'bg-bg-secondary' : 'bg-primary bg-opacity-10'} ${i % 2 === 0 ? 'w-[60%]' : 'w-[40%]'}`}>
                <div className="h-4 bg-bg-tertiary rounded w-full mb-2"></div>
                <div className="h-3 bg-bg-tertiary rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-bg-tertiary rounded w-1/2"></div>
              </div>
              {i % 2 !== 0 && (
                <div className="w-8 h-8 rounded-full bg-bg-tertiary ml-2 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-full blur-md"></div>
          <div className="relative flex items-center">
            <div className="absolute left-4">
              <div className="w-8 h-8 bg-bg-secondary rounded-full"></div>
            </div>
            <div className="w-full h-12 bg-bg-primary rounded-full border border-primary"></div>
            <div className="absolute right-4 w-5 h-5 bg-bg-tertiary rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MainChatSkeleton() {
  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-6 relative">
        <ChatAreaSkeleton />
      </div>
      <div className="w-16 flex flex-col bg-bg-primary overflow-hidden">
        <div className="flex-shrink-0 p-2">
          <div className="w-10 h-10 bg-bg-tertiary rounded-full mx-auto"></div>
        </div>
        <div className="flex-shrink-0 p-2">
          <div className="w-10 h-10 bg-bg-tertiary rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
