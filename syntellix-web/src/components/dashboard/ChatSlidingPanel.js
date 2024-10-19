import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function SlidingPanel({ isOpen, onClose, children, title }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}
      
      {/* Panel */}
      <div
        className={`fixed top-4 bottom-4 right-4 w-80 bg-bg-primary shadow-xl transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-all duration-300 ease-in-out z-50 rounded-2xl flex flex-col overflow-hidden`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% + 16px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bg-tertiary bg-bg-secondary">
          <h2 className="text-base font-semibold text-text-primary font-sans-sc">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors duration-200 p-1 rounded-full hover:bg-bg-tertiary"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          {children}
        </div>
      </div>
    </>
  );
}

export default SlidingPanel;
