import React from 'react';
import { BookOpenIcon, DocumentIcon, UserIcon } from '@heroicons/react/24/outline';

function KnowledgeBase() {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-indigo-800 font-noto-sans-sc">知识库</h3>
          <p className="text-sm text-gray-700 font-noto-sans-sc">剩余容量: 44.0MB 扩容</p>
        </div>
        <div className="space-x-2">
          <button className="bg-white bg-opacity-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-opacity-70 transition-all duration-300 font-noto-sans-sc">
            + 新建分组
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 font-noto-sans-sc">
            + 新建知识库
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example knowledge base card */}
        <div className="bg-white bg-opacity-50 rounded-lg shadow-md p-4 border border-white border-opacity-30 transition-all duration-300 hover:shadow-lg hover:bg-opacity-70">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-indigo-800 text-lg font-noto-sans-sc">BetterYeah 知识百科</h4>
          </div>
          <p className="text-sm text-indigo-600 mb-2 font-noto-sans-sc">文档 · 多语言知识-ada-002</p>
          <div className="flex items-center text-sm text-indigo-600 font-noto-sans-sc">
            <DocumentIcon className="w-4 h-4 mr-1" />
            <span>1 文档</span>
            <UserIcon className="w-4 h-4 ml-3 mr-1" />
            <span>0 个应用</span>
          </div>
        </div>
        {/* Add more knowledge base cards as needed */}
      </div>
    </div>
  );
}

export default KnowledgeBase;