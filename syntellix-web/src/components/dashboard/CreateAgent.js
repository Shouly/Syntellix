import { ArrowLeftIcon, BeakerIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useState } from 'react';
import { useToast } from '../../components/Toast';

function CreateAgent({ onBack, onCreated }) {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!agentName.trim()) {
      setErrors(prev => ({ ...prev, name: '智能体名称不能为空' }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/console/api/agents', {
        name: agentName.trim(),
        description: agentDescription.trim(),
        type: agentType
      });
      showToast('智能体创建成功', 'success');
      onCreated(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrors(prev => ({ ...prev, general: error.response.data.message }));
      } else {
        showToast('创建智能体失败', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex pt-4 gap-6 px-6">
      {/* Left sidebar */}
      <div className="bg-bg-primary rounded-lg shadow-sm p-6 w-64">
        <div className="mb-10 mt-5">
          <div className="flex items-center mb-10 cursor-pointer group" onClick={onBack}>
            <div className="w-8 h-8 bg-primary bg-opacity-90 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
              <ArrowLeftIcon className="w-5 h-5 text-text-body transition-colors duration-200 group-hover:text-primary" />
            </div>
            <span className="text-base font-semibold text-text-body font-sans-sc truncate">新建智能体</span>
          </div>
        </div>
        <ol className="space-y-4 relative">
          <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-bg-secondary"></div>
          <StepItem number={1} text="基本信息" active />
          <StepItem number={2} text="选择知识库" />
          <StepItem number={3} text="设置参数" />
        </ol>
      </div>

      {/* Main content area */}
      <div className="flex-1 space-y-6 bg-bg-primary rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-text-body font-sans-sc">创建新智能体</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-text-body mb-1 font-sans-sc">
              智能体名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="请输入智能体名称"
              className="w-full p-2 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="agentDescription" className="block text-sm font-medium text-text-body mb-1 font-sans-sc">
              智能体描述
            </label>
            <textarea
              id="agentDescription"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              placeholder="请输入智能体描述"
              rows={3}
              className="w-full p-2 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="agentType" className="block text-sm font-medium text-text-body mb-1 font-sans-sc">
              智能体类型
            </label>
            <select
              id="agentType"
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              className="w-full p-2 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="general">通用智能体</option>
              <option value="customer_service">客服智能体</option>
              <option value="sales">销售智能体</option>
            </select>
          </div>

          {errors.general && (
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-lg p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-danger">创建失败</h3>
                  <div className="mt-2 text-sm text-danger text-opacity-90">
                    {errors.general}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium bg-bg-secondary text-text-body rounded-md hover:bg-bg-secondary hover:bg-opacity-70 transition-colors duration-200 font-sans-sc"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary hover:bg-opacity-80 transition-colors duration-200 font-sans-sc flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                  创建中...
                </>
              ) : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StepItem({ number, text, active = false }) {
  return (
    <li className={`flex items-center ${active ? 'text-text-body' : 'text-text-muted'}`}>
      <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${active ? 'bg-primary text-white font-semibold' : 'bg-bg-secondary'}`}>
        {number}
      </span>
      <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
    </li>
  );
}

export default CreateAgent;