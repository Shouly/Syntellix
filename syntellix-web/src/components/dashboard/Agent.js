import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

function Agent() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AgentCard />
            {/* Add more AgentCard components as needed */}
        </div>
    );
}

function AgentCard() {
    return (
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                    <img src="/path-to-avatar.jpg" alt="Agent Avatar" className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-indigo-800">数据分析助手</h3>
                    <p className="text-sm text-gray-500">更新于4天前</p>
                </div>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">11</div>
            <div className="flex items-center text-sm text-gray-600 mb-4">
                <PlusIcon className="w-4 h-4 mr-1" />
                <span>添加标签</span>
            </div>
            <div className="mt-auto">
                <button className="w-full py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    <span>新建对话</span>
                </button>
            </div>
        </div>
    );
}

export default Agent;

