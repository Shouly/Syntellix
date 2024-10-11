import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function Settings() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-bg-tertiary">
                <h1 className="text-xl font-semibold text-text-heading">18548921304的工作空间</h1>
            </div>

            <div className="flex-shrink-0 border-b border-bg-tertiary">
                <nav className="flex px-4 space-x-4">
                    <NavItem title="概览" />
                    <NavItem title="告警管理" />
                    <NavItem title="用户列表" active />
                    <NavItem title="订单管理" />
                </nav>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative flex-grow mr-4">
                        <input
                            type="text"
                            placeholder="搜索手机号、用户名称"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-bg-secondary rounded-md border border-bg-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    <select className="text-sm bg-bg-secondary border border-bg-tertiary rounded-md px-3 py-2 mr-4 focus:outline-none focus:ring-1 focus:ring-primary">
                        <option>全部角色</option>
                    </select>
                    <div className="text-sm text-text-body mr-4">
                        还可邀请用户数量：<span className="font-bold">4个</span>
                        <span className="text-primary ml-2 cursor-pointer hover:underline">扩容</span>
                    </div>
                    <button className="bg-primary text-bg-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors duration-300">
                        <PlusIcon className="w-5 h-5 inline-block mr-1" />
                        邀请用户
                    </button>
                </div>
                <div className="bg-bg-primary rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-bg-secondary">
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">用户名</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">账号(手机号)</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">角色</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">授权应用范围</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-bg-tertiary">
                                <td className="py-3 px-4 text-sm text-text-body">18548921304</td>
                                <td className="py-3 px-4 text-sm text-text-body">18548921304</td>
                                <td className="py-3 px-4 text-sm text-text-body">管理员</td>
                                <td className="py-3 px-4 text-sm text-text-body">全部应用</td>
                                <td className="py-3 px-4">
                                    <button className="text-text-muted hover:text-red-500 transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function NavItem({ title, active }) {
    return (
        <a
            href="#"
            className={`px-3 py-2 text-sm font-medium ${active
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-body hover:text-primary'
            }`}
        >
            {title}
        </a>
    );
}

export default Settings;
