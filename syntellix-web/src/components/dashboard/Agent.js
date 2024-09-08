import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function Agent() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800">Agent</h2>
        <div className="flex space-x-2">
          <button className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors duration-300">
            <PlusIcon className="w-5 h-5 inline-block mr-1" />
            新建分组
          </button>
          <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300">
            <PlusIcon className="w-5 h-5 inline-block mr-1" />
            新建 Agent
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索Agent"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AgentCard />
      </div>
    </div>
  );
}

function AgentCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img src="/path-to-avatar.jpg" alt="Agent Avatar" className="w-12 h-12 rounded-full mr-4" />
        <div>
          <h3 className="text-lg font-semibold text-indigo-800">数据分析助手</h3>
          <p className="text-sm text-gray-500">18548921304 更新于4天前</p>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>文档: 0</span>
        <span>知识库: 0</span>
        <span>对话: 0</span>
        <span>应用: 1</span>
      </div>
    </div>
  );
}

export default Agent;
