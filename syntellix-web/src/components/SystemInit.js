import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SystemInit() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/console/api/sys_init', { email, name, password });
            navigate('/');
        } catch (error) {
            setError('Error initializing system. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-300 to-purple-400">
            <div className="flex-grow flex">
                <div className="flex-[3] flex items-center justify-end pr-4">
                    <div class="max-w-2xl w-full space-y-8 text-white">
                        <div class="space-y-4">
                            <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text font-heading">
                                Syntellix <span className="text-xl font-normal font-sans">/sɪnˈtelɪks/</span>
                            </h1>
                        </div>
                        <div className="space-y-3 font-roboto">
                            <p className="text-2xl font-bold font-inter">Synergizing Intelligence, Amplifying Success</p>
                            <p className="text-4xl">协同智能，放大成功</p>
                        </div>
                    </div>
                </div>
                <div className="flex-[2] flex items-center justify-start">
                    <div className="max-w-md w-full space-y-8 bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl p-10 rounded-xl shadow-lg">
                        <div>
                            <h2 className="mt-6 text-3xl font-bold text-gray-900">
                                设置系统管理员
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                管理员拥有的最大权限，可用于组织管理、数据管理、应用管理等。
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                                        邮箱
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm "
                                        placeholder="输入邮箱地址"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700">
                                        用户名
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="输入用户名"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                                        密码
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                                            placeholder="输入密码"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">密码必须包含字母和数字，且长度不小于8位</p>
                                </div>
                            </div>

                            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    设置
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <footer className="py-4 text-center text-xs text-white">
                © 2024 Syntellix, Inc. All rights reserved.
            </footer>
        </div>
    );
}

export default SystemInit;