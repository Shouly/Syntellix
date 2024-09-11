import React from 'react';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon, DocumentDuplicateIcon, CubeIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

function KnowledgeBase() {
  const knowledgeBases = [
    { id: 1, name: '财务知识库', documents: 10, characters: 5000, apps: 2, lastUpdated: '2 天前更新' },
    { id: 2, name: '公司规章制度知识库', documents: 5, characters: 2500, apps: 1, lastUpdated: '1 天前更新' },
    { id: 3, name: '人事知识库', documents: 8, characters: 4000, apps: 3, lastUpdated: '3 天前更新' },
    { id: 4, name: '市场营销', documents: 15, characters: 7500, apps: 4, lastUpdated: '5 小时前更新' },
    // ... 其他知识库数据
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {knowledgeBases.map((kb) => (
        <div key={kb.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 ">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpenIcon className="w-8 h-8 text-indigo-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800 font-noto-sans-sc">{kb.name}</h3>
              </div>
              <span className="text-xs text-gray-500 font-noto-sans-sc">{kb.lastUpdated}</span>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between mt-auto">
            <div className="flex items-center text-xs text-gray-600 space-x-3 font-noto-sans-sc">
              <div className="flex items-center">
                <DocumentTextIcon className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                <span>{kb.documents} 文档</span>
              </div>
              <div className="flex items-center">
                <DocumentDuplicateIcon className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                <span>{(kb.characters / 1000).toFixed(1)}k 字符</span>
              </div>
              <div className="flex items-center">
                <CubeIcon className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                <span>{kb.apps} 应用</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KnowledgeBase;