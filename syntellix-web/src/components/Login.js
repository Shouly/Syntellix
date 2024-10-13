import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoWithName from '../assets/logo_with_name.svg';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const validateForm = () => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError('邮箱不能为空');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('请输入有效的邮箱地址');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('密码不能为空');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('密码长度至少为8个字符');
      isValid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      setPasswordError('密码必须包含至少一个字母和一个数字');
      isValid = false;
    } else {
      setPasswordError('');
    }

    setIsFormValid(isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
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
    <div className="min-h-screen flex bg-gradient-to-br from-primary-light to-primary-dark overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-primary-dark"></div>
      </div>

      {/* 更新的 Logo */}
      <div className="absolute top-2 left-3 z-10">
        <img
          src={logoWithName}
          alt="Syntellix"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* 左侧内容 */}
      <div className="flex-1 flex flex-col justify-center items-end pr-24 relative z-10">
        <div className="space-y-16 max-w-xl">
          <div className="space-y-8">
            <div className="flex items-baseline space-x-4">
              <h1 className="text-7xl text-white font-tech tracking-wider">Syntellix</h1>
              <span className="text-xl font-light text-white opacity-80">/sɪnˈtelɪks/</span>
            </div>
            <div className="flex items-center space-x-3">
              {['Synergy', 'Intelligence', 'Matrix'].map((word, index, array) => (
                <React.Fragment key={word}>
                  <span className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white border-opacity-20 shadow-sm transition-all duration-300 hover:bg-opacity-20 hover:shadow-md">
                    {word}
                  </span>
                  {index < array.length - 1 && (
                    <span className="text-white text-xl font-light mx-2">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white font-heading leading-tight">
              Synergizing Intelligence,<br />Amplifying Success
            </h2>
            <p className="text-2xl text-white font-sans-sc opacity-75">协同智能，放大成功</p>
          </div>
        </div>
      </div>

      {/* 右侧 - 登录表单 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-bg-primary bg-opacity-95 p-12 rounded-3xl shadow-2xl w-full max-w-md space-y-8 backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-bold text-primary-dark font-noto-sans-sc">
              登录
            </h2>
            <p className="mt-2 text-sm text-text-secondary font-noto-sans-sc">
              请输入您的邮箱和密码，登录以继续。
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary font-noto-sans-sc">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`mt-1 block w-full px-3 py-2 border ${emailError ? 'border-danger' : 'border-bg-tertiary'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light bg-bg-secondary text-text-primary`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="mt-1 text-sm text-danger">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary font-noto-sans-sc">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`mt-1 block w-full px-3 py-2 border ${passwordError ? 'border-danger' : 'border-bg-tertiary'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light bg-bg-secondary text-text-primary pr-10`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm text-danger">{passwordError}</p>}
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid ? 'bg-primary hover:bg-primary-dark' : 'bg-text-muted cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition duration-150 ease-in-out`}
              >
                {isLoading ? (
                  <ArrowPathIcon className="animate-spin h-5 w-5" />
                ) : (
                  '登录'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
