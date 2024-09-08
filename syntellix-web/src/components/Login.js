import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/console/api/login', { email, password });
      if (response.data.result === 'success') {
        const token = response.data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true); // Add this line
        navigate('/dashboard');
      } else {
        setError(response.data.data || 'Login failed. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-300 relative overflow-hidden">
      {/* Subtle tech-inspired background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMTAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMDAwMDIwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-30"></div>
      </div>
      {/* Logo in the top-left corner */}
      <div className="absolute top-4 left-4 z-10">
        <img src="logo512.png" alt="Syntellix Logo" className="w-16 h-16" />
      </div>
      <div className="flex-grow flex">
        <div className="flex-[3] flex items-center justify-end pr-14">
          <div className="max-w-2xl w-full space-y-16">
            <div className="space-y-3">
              <h1 className="relative">
                <span className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-transparent bg-clip-text font-tech tracking-tight animate-pulse">
                  Syntellix
                </span>
                <span className="absolute bottom-0 right-5 px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 bg-opacity-50 rounded-full whitespace-nowrap">
                  /sɪnˈtelɪks/
                </span>
              </h1>
              <div className="flex items-center space-x-2">
                {['Synergy', 'Intelligence', 'Matrix'].map((word, index) => (
                  <React.Fragment key={word}>
                    {index > 0 && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>}
                    <span className={`text-lg font-medium ${
                      index === 0 ? 'text-blue-700' :
                      index === 1 ? 'text-indigo-700' : 'text-purple-700'
                    }`}>
                      {word}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="space-y-3 font-roboto">
              <p className="text-2xl font-semibold font-heading text-indigo-800">Synergizing Intelligence, Amplifying Success</p>
              <p className="text-4xl font-sans-sc text-indigo-800 mt-2">协同智能，放大成功</p>
            </div>
          </div>
        </div>
        <div className="flex-[2] flex items-center justify-start">
          <div className="max-w-md w-full space-y-8 bg-white bg-opacity-40 backdrop-filter backdrop-blur-xl p-10 rounded-2xl shadow-xl border border-indigo-300">
            <div>
              <h2 className="mt-2 text-3xl font-bold text-indigo-800 font-noto-sans-sc">
                登录账户
              </h2>
              <p className="mt-2 text-sm text-gray-700 font-noto-sans-sc">
                欢迎回来，请输入您的账户信息。
              </p>
            </div>
            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 font-noto-sans-sc">
                    邮箱
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white bg-opacity-80 transition-all duration-300"
                    placeholder="输入邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 font-noto-sans-sc">
                    密码
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 bg-white bg-opacity-80 transition-all duration-300"
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
                </div>
              </div>

              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 font-noto-sans-sc disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer className="py-4 text-center text-xs relative z-10">
        <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-transparent bg-clip-text font-medium">
          © 2024 Syntellix, Inc. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default Login;
