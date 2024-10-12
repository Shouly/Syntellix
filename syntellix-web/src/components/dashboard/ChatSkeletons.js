import React from 'react';

export function AgentInfoSkeleton() {
  return (
    <div className="flex-shrink-0 p-4 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-bg-tertiary mr-3"></div>
        <div className="h-5 bg-bg-tertiary rounded w-3/4"></div>
      </div>
      <div className="h-3 bg-bg-tertiary rounded w-full mb-2"></div>
      <div className="h-3 bg-bg-tertiary rounded w-5/6 mb-4"></div>
      <div className="bg-bg-tertiary rounded-lg p-3 mb-4">
        <div className="h-3 bg-bg-secondary rounded w-1/2 mb-2"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-2 bg-bg-secondary rounded w-3/4"></div>
          ))}
        </div>
      </div>
      <div className="w-full h-8 bg-primary bg-opacity-20 rounded-lg"></div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto animate-pulse">
      <div className="h-4 bg-bg-tertiary rounded w-1/2 mb-2 mx-4"></div>
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-bg-tertiary rounded-lg mx-2"></div>
        ))}
      </div>
    </div>
  );
}

export function ChatAreaSkeleton() {
  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 animate-pulse">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`mb-4 flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && (
                <div className="w-8 h-8 rounded-full bg-bg-tertiary mr-2 flex-shrink-0"></div>
              )}
              <div className={`inline-block p-3 rounded-xl ${i % 2 === 0 ? 'bg-bg-tertiary' : 'bg-primary bg-opacity-10'} ${i % 2 === 0 ? 'w-[60%]' : 'w-[40%]'}`}>
                <div className="h-4 bg-bg-secondary rounded w-full mb-2"></div>
                <div className="h-3 bg-bg-secondary rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-bg-secondary rounded w-1/2"></div>
              </div>
              {i % 2 !== 0 && (
                <div className="w-8 h-8 rounded-full bg-bg-tertiary ml-2 flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="pb-6 pt-2">
        <div className="relative">
          <div className="w-full h-14 bg-bg-secondary rounded-lg border border-bg-tertiary"></div>
          <div className="absolute right-4 bottom-3 w-8 h-8 bg-bg-tertiary rounded-full"></div>
        </div>
      </div>
    </>
  );
}
