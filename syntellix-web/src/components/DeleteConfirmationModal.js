import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemType, itemName, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20">
      <div className="relative p-8 border w-full max-w-md shadow-lg rounded-2xl bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mr-3" />
            <h3 className="text-2xl font-bold text-indigo-800 font-noto-sans-sc">删除确认</h3>
          </div>
          <p className="text-gray-600 font-noto-sans-sc text-center">
            您确定要删除{itemType} <span className="font-semibold">"{itemName}"</span> 吗？
          </p>
          <p className="text-gray-500 font-noto-sans-sc text-sm text-center mt-2">
            此操作无法撤销。
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-noto-sans-sc focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-noto-sans-sc focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                删除中...
              </>
            ) : (
              '删除'
            )}
          </button>
        </div>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={isLoading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
