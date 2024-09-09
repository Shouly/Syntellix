import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function Agent() {
  return (
    <div className="p-4">
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
