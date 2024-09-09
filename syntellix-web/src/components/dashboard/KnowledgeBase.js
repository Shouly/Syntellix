import React from 'react';
import { ChartPieIcon } from '@heroicons/react/24/solid';

function KnowledgeBase() {
  return (
    <div className="mb-4 pl-6"> {/* 添加左侧 padding */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 知识库卡片 */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-40">
          <div className="flex items-start mb-auto">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <ChartPieIcon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-base mb-1">伊莎贝尔·迈尔斯的...</h4>
              <p className="text-sm text-gray-500">文档：多语言知识-ada-002</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-400 mt-2">
            <span className="mr-3 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              1 文档
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              0 个应用
            </span>
          </div>
        </div>
        {/* 可以在这里添加更多知识库卡片 */}
      </div>
    </div>
  );
}

export default KnowledgeBase;