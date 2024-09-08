import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function Database() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800">数据库</h2>
        <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300">
          <PlusIcon className="w-5 h-5 inline-block mr-1" />
          新建数据库
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索数据库名称"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DatabaseCard
          name="admin"
          icon="/path-to-admin-icon.jpg"
          tables={0}
          applications={0}
        />
        <DatabaseCard
          name="数据分析助手的数据库"
          icon="/path-to-smiley-icon.jpg"
          tables={3}
          applications={1}
          description="暂无描述"
        />
      </div>
    </div>
  );
}

function DatabaseCard({ name, icon, tables, applications, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img src={icon} alt={`${name} Icon`} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <h3 className="text-lg font-semibold text-indigo-800">{name}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{tables} 数据表</span>
        <span>{applications} 个关联应用</span>
      </div>
    </div>
  );
}

export default Database;
