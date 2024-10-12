import React from 'react';

export function AgentInfoSkeleton() {
  return (
    <div className="flex-shrink-0 p-4 animate-pulse">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-bg-tertiary mr-3"></div>
        <div className="h-5 bg-bg-tertiary rounded w-3/4"></div>
      </div>
      <div className="h-3 bg-bg-tertiary rounded w-full mb-2"></div>
      <div className="h-3 bg-bg-tertiary rounded w-5/6 mb-3"></div>
      <div className="mt-3">
        <div className="h-3 bg-bg-tertiary rounded w-1/3 mb-2"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-bg-tertiary mr-2"></div>
              <div className="h-2 bg-bg-tertiary rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto animate-pulse">
      <div className="flex items-center px-4 mb-3">
        <div className="w-4 h-4 bg-bg-tertiary rounded mr-2"></div>
        <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
      </div>
      <div className="space-y-1 px-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-bg-tertiary rounded-md mx-2 flex items-center justify-between px-3">
            <div className="h-3 bg-bg-secondary rounded w-1/2"></div>
            <div className="h-2 bg-bg-secondary rounded w-1/4"></div>
          </div>
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
                <div className="w-6 h-6 rounded-full bg-bg-tertiary mr-2 flex-shrink-0"></div>
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
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[700px]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-full blur-md"></div>
          <div className="relative flex items-center">
            <div className="absolute left-4">
              <div className="w-8 h-8 bg-bg-secondary rounded-full"></div>
            </div>
            <div className="w-full h-14 bg-bg-primary rounded-full border border-primary"></div>
            <div className="absolute right-4 w-5 h-5 bg-bg-tertiary rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
}
