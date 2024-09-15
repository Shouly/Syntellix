import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon, KeyIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import AvatarSelector from './AvatarSelector'; // 新增导入
import axios from 'axios';
import { useToast } from '../components/Toast'; // 导入 useToast

function AccountSettings({ isOpen, onClose, userProfile, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('account');
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const { showToast } = useToast(); // 使用 useToast hook

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setAvatar(userProfile.avatar || '');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const validateName = (name) => {
    return name.trim().length > 0;
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setErrors({});
    setNameError('');

    if (!validateName(name)) {
      setNameError('用户名不能为空');
      return;
    }

    setIsSaving(true);
    try {
      // Update name
      await axios.post('/console/api/account/name', { name });
      
      // Update avatar
      if (avatar) {
        await axios.post('/console/api/account/avatar', { avatar });
      }
      
      // Call the onProfileUpdate function to update the Dashboard
      onProfileUpdate({ name, avatar });
      
      showToast('保存成功', 'success'); // 使用 toast 显示成功消息
      onClose(); // 自动关闭弹框
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ account: error.response.data.message });
      } else {
        setErrors({ account: '保存账户信息失败，请重试。' });
      }
      console.error('Error saving account info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return password.length >= 8 && hasLetter && hasNumber;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setPasswordError('');

    if (!validatePassword(newPassword)) {
      setPasswordError('密码必须包含字母和数字，且长度不小于8位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ password: '新密码和确认密码不匹配。' });
      return;
    }

    setIsResettingPassword(true);
    try {
      await axios.post('/console/api/account/password', {
        password: oldPassword,
        new_password: newPassword,
        repeat_new_password: confirmPassword
      });
      showToast('密码重置成功', 'success'); // 使用 toast 显示成功消息
      // Clear password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose(); // 自动关闭弹框
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ password: error.response.data.message });
      } else {
        setErrors({ password: '重置密码失败，请重试。' });
      }
      console.error('Error resetting password:', error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
    setShowAvatarSelector(false);
    // 这里可能需要添加保存头像到用户配置的逻辑
  };

  const renderPasswordInput = (value, onChange, show, setShow, placeholder) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-1.5 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-[800px] shadow-lg rounded-2xl bg-white bg-opacity-90 max-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-indigo-700 font-noto-sans-sc">设置</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-grow overflow-hidden">
          {/* 左侧菜单 */}
          <div className="w-1/4 pr-6 border-r border-gray-200 overflow-y-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center w-full py-2 px-3 mb-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'account' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCircleIcon className="h-5 w-5 mr-3" />
              <span className="font-noto-sans-sc text-sm">我的账户</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center w-full py-2 px-3 rounded-lg transition-colors duration-200 ${
                activeTab === 'password' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <KeyIcon className="h-5 w-5 mr-3" />
              <span className="font-noto-sans-sc text-sm">重置密码</span>
            </button>
          </div>

          {/* 右侧内容 */}
          <div className="w-3/4 pl-6 pr-4 overflow-y-auto">
            {activeTab === 'account' && (
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-noto-sans-sc">头像</p>
                  <div 
                    className="relative w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md cursor-pointer group"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    {avatar ? (
                      <img src={avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase() || 'A'
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white text-xs font-noto-sans-sc">编辑</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-noto-sans-sc">用户名 <span className="text-red-500">*</span></p>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-1.5 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200" 
                    placeholder="输入用户名"
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {nameError}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-noto-sans-sc">邮箱</p>
                  <input 
                    type="email" 
                    value={userProfile?.email || ''} 
                    readOnly 
                    className="w-full p-1.5 text-sm bg-gray-200 border border-gray-300 rounded-md text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200" 
                  />
                </div>

                {errors.account && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{errors.account}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button 
                    type="submit" 
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200 font-noto-sans-sc flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        保存中...
                      </>
                    ) : '保存'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <h4 className="text-base font-semibold text-gray-800 font-noto-sans-sc mb-4">重置密码</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 font-noto-sans-sc">原密码 <span className="text-red-500">*</span></label>
                  {renderPasswordInput(oldPassword, (e) => setOldPassword(e.target.value), showOldPassword, setShowOldPassword, "输入原密码")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 font-noto-sans-sc">新密码 <span className="text-red-500">*</span></label>
                  {renderPasswordInput(newPassword, (e) => setNewPassword(e.target.value), showNewPassword, setShowNewPassword, "输入新密码")}
                  {passwordError && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 font-noto-sans-sc">确认密码 <span className="text-red-500">*</span></label>
                  {renderPasswordInput(confirmPassword, (e) => setConfirmPassword(e.target.value), showConfirmPassword, setShowConfirmPassword, "再次输入新密码")}
                </div>
                <p className="text-xs text-gray-500 font-noto-sans-sc">密码必须包含字母和数字，且长度不小于8位</p>

                {errors.password && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{errors.password}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => setActiveTab('account')} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors duration-200 font-noto-sans-sc">
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200 font-noto-sans-sc flex items-center"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        重置中...
                      </>
                    ) : '确认'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {showAvatarSelector && (
        <AvatarSelector onSelect={handleAvatarChange} onClose={() => setShowAvatarSelector(false)} />
      )}
    </div>
  );
}

export default AccountSettings;
