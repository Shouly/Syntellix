import React from 'react';
import { DocumentTextIcon, DocumentDuplicateIcon, CubeIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { PlusIcon, BookOpenIcon, ArchiveBoxIcon, DocumentIcon } from '@heroicons/react/24/solid';

function KnowledgeBase({ onCreateKnowledgeBase }) {
  const knowledgeBases = [
    { id: 1, name: '财务知识库', documents: 10, characters: 5000, apps: 2, lastUpdated: '2 天前更新' },
    { id: 2, name: '公司规章制度知识库', documents: 5, characters: 2500, apps: 1, lastUpdated: '1 天前更新' },
    { id: 3, name: '人事知识库', documents: 8, characters: 4000, apps: 3, lastUpdated: '3 天前更新' },
    { id: 4, name: '市场营销', documents: 15, characters: 7500, apps: 4, lastUpdated: '5 小时前更新' },
    // ... 其他知识库数据
  ];

  const getRandomIcon = () => {
    const icons = [BookOpenIcon, ArchiveBoxIcon, DocumentIcon];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const NewKnowledgeBaseCard = () => (
    <div 
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer"
      onClick={onCreateKnowledgeBase}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 opacity-70 group-hover:from-indigo-100 group-hover:via-purple-100 group-hover:to-blue-100 group-hover:opacity-80 transition-all duration-300"></div>
      <div className="absolute inset-[1px] rounded-[11px] flex items-center p-6 z-10">
        <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-indigo-200 transition-all duration-300">
          <PlusIcon className="w-10 h-10 text-indigo-500 group-hover:text-indigo-600 transition-all duration-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-indigo-600 font-noto-sans-sc mb-2 group-hover:text-indigo-700 transition-all duration-300">创建知识库</h3>
          <p className="text-xs text-indigo-500 font-noto-sans-sc group-hover:text-indigo-600 transition-all duration-300">
            接入您的文本数据让AI更了解您。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewKnowledgeBaseCard />
      {knowledgeBases.map((kb) => {
        const RandomIcon = getRandomIcon();
        return (
          <div key={kb.id} className="group bg-white bg-opacity-60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 opacity-40 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-blue-300 group-hover:opacity-50 transition-all duration-300"></div>
            <div className="absolute inset-[1px] bg-white bg-opacity-60 rounded-[11px] flex flex-col justify-between z-10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <RandomIcon className="w-12 h-12 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 font-noto-sans-sc mb-1">{kb.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 font-noto-sans-sc">
                        <span>{kb.documents} 文档</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span>{kb.apps} 智能体</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-noto-sans-sc">{kb.lastUpdated}</span>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs text-gray-700 space-x-2 font-noto-sans-sc">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">财务</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">标签B</span>
                </div>
                <button className="text-gray-600 hover:text-gray-700 transition-colors duration-200">
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KnowledgeBase;