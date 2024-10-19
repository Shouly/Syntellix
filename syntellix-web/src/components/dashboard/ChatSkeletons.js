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

export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between py-2 px-3 bg-bg-primary border-b border-border-primary animate-pulse">
      <div className="flex-1 flex items-center">
        <div className="w-4 h-4 bg-bg-tertiary rounded-full mr-1"></div>
        <div className="w-20 h-4 bg-bg-tertiary rounded"></div>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="w-32 h-5 bg-bg-tertiary rounded"></div>
      </div>
      <div className="flex-1 flex items-center justify-end space-x-3">
        <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
        <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
        <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
      </div>
    </header>
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
    </div>
  );
}

export function ChatInputSkeleton() {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-6 animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-full blur-md"></div>
        <div className="relative flex items-center">
          <div className="w-full h-12 bg-bg-primary rounded-full border border-primary"></div>
          <div className="absolute right-3 w-8 h-8 bg-bg-tertiary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function NewChatSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-primary animate-pulse">
      <div className="w-full max-w-3xl px-6">
        <div className="h-10 bg-bg-tertiary rounded-full w-3/4 mx-auto mb-8"></div>
        <div className="relative">
          <div className="w-full h-32 bg-bg-primary rounded-xl border border-primary"></div>
          <div className="absolute right-3 bottom-3 w-10 h-10 bg-bg-tertiary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingMoreSkeleton() {
  return (
    <div className="flex justify-center items-center py-3 animate-pulse">
      <div className="bg-bg-secondary rounded-full px-4 py-2 flex items-center shadow-sm">
        <div className="w-4 h-4 bg-bg-tertiary rounded-full mr-2"></div>
        <div className="w-32 h-4 bg-bg-tertiary rounded"></div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <HeaderSkeleton />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden px-6 relative">
          <ChatAreaSkeleton />
          <ChatInputSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ChatHomePageSkeleton() {
  return (
    <div className="flex flex-col h-full bg-bg-primary animate-pulse">
      {/* Header */}
      <header className="flex items-center justify-end py-2 px-3 bg-bg-primary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
          <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-32">
        <div className="w-full max-w-3xl">
          {/* Greeting */}
          <div className="h-10 bg-bg-tertiary rounded w-3/4 mx-auto mb-10"></div>

          {/* Input area */}
          <div className="relative mb-8">
            <div className="w-full h-32 bg-bg-primary rounded-xl border border-primary"></div>
            <div className="absolute right-2 bottom-3 w-10 h-10 bg-bg-tertiary rounded-full"></div>
          </div>

          {/* Recommended questions */}
          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center p-3 bg-bg-primary border border-border-primary rounded-lg">
                  <div className="w-5 h-5 mr-3 bg-bg-tertiary rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-bg-tertiary rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
