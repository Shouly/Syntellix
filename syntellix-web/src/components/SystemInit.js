import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SystemInit({ setIsInitialized }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
      const response = await axios.post('/console/api/sys_init', { email, name, password });
      if (response.data.result === 'success') {
        setIsInitialized(true); // Update the initialization status
        navigate('/'); // Navigate to the login page
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError('Invalid input. Please check your email, name, and password.');
        } else if (error.response.status === 409) {
          setError('System is already initialized.');
        } else {
          setError(error.response.data.message || 'An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-light to-primary-dark">
      {/* Left side - Branding and decorative elements */}
      <div className="flex-1 flex flex-col justify-center items-end pr-24">
        <div className="space-y-12 max-w-xl">
          <div className="space-y-4 pb-12">
            <div className="flex items-baseline">
              <span className="text-8xl font-thin text-white font-tech tracking-wider">SYNTELLIX</span>
              <span className="ml-4 text-xl font-light text-white opacity-80 whitespace-nowrap">/sɪnˈtelɪks/</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {['Synergy', 'Intelligence', 'Matrix'].map((word) => (
                <span key={word} className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white font-semibold text-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white font-heading leading-tight">
              Synergizing Intelligence,<br />Amplifying Success
            </h1>
            <p className="text-2xl text-white font-sans-sc">协同智能，放大成功</p>
          </div>
        </div>
      </div>

      {/* Right side - System Init form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-dark font-noto-sans-sc">
              设置系统管理员
            </h2>
            <p className="mt-2 text-sm text-text-secondary font-noto-sans-sc">
              管理员拥有最大权限，可用于组织管理、数据管理、应用管理等。
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-noto-sans-sc">
                用户名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-noto-sans-sc">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-noto-sans-sc">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 font-noto-sans-sc">密码必须包含字母和数字，且长度不小于8位</p>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition duration-150 ease-in-out"
              >
                {isLoading ? (
                  <ArrowPathIcon className="animate-spin h-5 w-5" />
                ) : (
                  '设置'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SystemInit;