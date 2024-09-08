import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function Settings() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">18548921304的工作空间</h1>

            <div className="mb-6">
                <nav className="flex space-x-4">
                    <NavItem title="概览" />
                    <NavItem title="告警管理" />
                    <NavItem title="用户列表" active />
                    <NavItem title="订单管理" />
                </nav>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative flex-grow mr-4">
                    <input
                        type="text"
                        placeholder="搜索手机号、用户名称"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select className="border border-gray-300 rounded-md px-3 py-2 mr-4">
                    <option>全部角色</option>
                </select>
                <div className="text-sm text-gray-600 mr-4">
                    还可邀请用户数量：<span className="font-bold">4个</span>
                    <span className="text-indigo-600 ml-2 cursor-pointer">扩容</span>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300">
                    <PlusIcon className="w-5 h-5 inline-block mr-1" />
                    邀请用户
                </button>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="text-left py-2 px-4">用户名</th>
                        <th className="text-left py-2 px-4">账号(手机号)</th>
                        <th className="text-left py-2 px-4">角色</th>
                        <th className="text-left py-2 px-4">授权应用范围</th>
                        <th className="text-left py-2 px-4">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-2 px-4">18548921304</td>
                        <td className="py-2 px-4">18548921304</td>
                        <td className="py-2 px-4">管理员</td>
                        <td className="py-2 px-4">全部应用</td>
                        <td className="py-2 px-4">
                            <button className="text-gray-500 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
function NavItem({ title, active }) {
    return (
        <a
            href="#"
            className={`px-3 py-2 rounded-md text-sm font-medium ${active
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            {title}
        </a>
    );
}

export default Settings;
