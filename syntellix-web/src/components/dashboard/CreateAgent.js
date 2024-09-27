import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useState } from 'react';
import { useToast } from '../../components/Toast';

function CreateAgent({ onBack, onCreated }) {
    const [agentName, setAgentName] = useState('');
    const [agentDescription, setAgentDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showToast } = useToast();
    const [avatar, setAvatar] = useState(null);
    const [greeting, setGreeting] = useState('你好！我是你的助理，有什么可以帮到你的吗？');
    const [showIndexContent, setShowIndexContent] = useState(true);
    const [knowledgeBase, setKnowledgeBase] = useState('');
    const [emptyResponse, setEmptyResponse] = useState('我没有找到相关的信息，请问您可以换个问题吗？');

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
                avatar,
                greeting,
                showIndexContent,
                knowledgeBase,
                emptyResponse
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
        <div className="flex h-full overflow-hidden p-3 gap-6">
            {/* Left sidebar */}
            <div className="w-64 bg-bg-primary p-6 overflow-y-auto rounded-lg shadow-sm">
                <div className="mb-8">
                    <div className="flex items-center mb-6 cursor-pointer group" onClick={onBack}>
                        <div className="w-8 h-8 bg-primary bg-opacity-90 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                            <ArrowLeftIcon className="w-5 h-5 text-text-body transition-colors duration-200 group-hover:text-primary" />
                        </div>
                        <span className="text-lg font-semibold text-text-body font-sans-sc truncate">新建智能体</span>
                    </div>
                </div>
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-bg-secondary"></div>
                    <StepItem number={1} text="基础设置" active />
                    <StepItem number={2} text="高级配置" />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm p-6">
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold text-text-body font-sans-sc mb-2">创建智能体</h3>
                    <p className="text-sm text-text-secondary font-sans-sc mb-8">
                        智能体是可定制的AI助手，根据您的设置执行特定任务。请填写以下信息来创建您的专属智能体。
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-1">
                                <label htmlFor="agentName" className="block text-sm font-medium text-text-body mb-2 font-sans-sc">
                                    智能体名称 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="agentName"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="如：财务助理、医疗助理等"
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center">
                                        <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2 flex items-center">
                                <label className="block text-sm font-medium text-text-body mr-4 font-sans-sc">
                                    智能体头像
                                </label>
                                <div className="w-16 h-16 border-2 border-dashed border-bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200">
                                    {avatar ? (
                                        <img src={avatar} alt="Agent Avatar" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <span className="text-2xl text-bg-secondary">+</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatar(URL.createObjectURL(e.target.files[0]))}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label htmlFor="agentDescription" className="block text-sm font-medium text-text-body mb-2 font-sans-sc flex items-center">
                                    智能体描述
                                    <InfoIcon tooltip="描述智能体的主要功能和特点，帮助用户了解该智能体的用途。" />
                                </label>
                                <textarea
                                    id="agentDescription"
                                    value={agentDescription}
                                    onChange={(e) => setAgentDescription(e.target.value)}
                                    placeholder="一句话描述智能体的主要功能和特点，如：可查询公司财务状况、可查询医疗报告等"
                                    rows={1}
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div className="col-span-3">
                                <label htmlFor="greeting" className="block text-sm font-medium text-text-body mb-2 font-sans-sc flex items-center">
                                    设置开场白
                                    <InfoIcon tooltip="智能体与用户对话的第一句话，用于介绍自己并引导对话。" />
                                </label>
                                <textarea
                                    id="greeting"
                                    value={greeting}
                                    onChange={(e) => setGreeting(e.target.value)}
                                    rows={1}
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* New "空回复" input field */}
                            <div className="col-span-3">
                                <label htmlFor="emptyResponse" className="block text-sm font-medium text-text-body mb-2 font-sans-sc flex items-center">
                                    空回复
                                    <InfoIcon tooltip="当智能体无法找到相关信息时的回复内容。" />
                                </label>
                                <textarea
                                    id="emptyResponse"
                                    value={emptyResponse}
                                    onChange={(e) => setEmptyResponse(e.target.value)}
                                    rows={1}
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="knowledgeBase" className="block text-sm font-medium text-text-body mb-2 font-sans-sc flex items-center">
                                    知识库 <span className="text-red-500">*</span>
                                    <InfoIcon tooltip="选择智能体使用的知识库，这将决定智能体的专业领域和回答能力。" />
                                </label>
                                <select
                                    id="knowledgeBase"
                                    value={knowledgeBase}
                                    onChange={(e) => setKnowledgeBase(e.target.value)}
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">请选择</option>
                                    {/* Add your knowledge base options here */}
                                </select>
                            </div>

                            <div className="col-span-2 sm:col-span-1 flex items-center">
                                <label htmlFor="showIndexContent" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="showIndexContent"
                                            className="sr-only"
                                            checked={showIndexContent}
                                            onChange={(e) => setShowIndexContent(e.target.checked)}
                                        />
                                        <div className={`w-10 h-6 rounded-full shadow-inner transition-colors duration-200 ${showIndexContent ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-1 left-1 transition-transform duration-200 ${showIndexContent ? 'transform translate-x-full' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 text-sm font-medium text-text-body font-sans-sc flex items-center">
                                        显示引文
                                        <InfoIcon tooltip="开启后，智能体会在回答中显示信息来源，增加可信度。" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {errors.general && (
                            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-lg p-4 mt-6">
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

                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-6 py-2 text-sm font-medium bg-bg-secondary text-text-body rounded-md hover:bg-bg-secondary hover:bg-opacity-70 transition-colors duration-200 font-sans-sc"
                                disabled={isLoading}
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary hover:bg-opacity-80 transition-colors duration-200 font-sans-sc flex items-center justify-center"
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

function InfoIcon({ tooltip }) {
    return (
        <div className="group relative inline-block ml-2">
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="opacity-0 bg-black text-white text-xs rounded py-1 px-2 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 group-hover:opacity-100 transition-opacity duration-300 w-48 text-center">
                {tooltip}
                <svg className="absolute text-black h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
            </div>
        </div>
    );
}

export default CreateAgent;