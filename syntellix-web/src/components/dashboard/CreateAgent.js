import { ArrowLeftIcon, InformationCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useToast } from '../../components/Toast';
import CreateAgentAdvancedConfig from './CreateAgentAdvancedConfig';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import { debounce } from 'lodash';

function CreateAgent({ onBack, onCreated }) {
    const [agentName, setAgentName] = useState('');
    const [agentDescription, setAgentDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showToast } = useToast();
    const [avatar, setAvatar] = useState(null);
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [greeting, setGreeting] = useState('你好！我是你的助理，有什么可以帮到你的吗？');
    const [showCitation, setShowCitation] = useState(true);
    const [emptyResponse, setEmptyResponse] = useState('我没有找到相关的信息，请问您可以换个问题吗？');
    const [currentStep, setCurrentStep] = useState(1);
    const [agentData, setAgentData] = useState(null);
    const [knowledgeBases, setKnowledgeBases] = useState([]);
    const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState([]);
    const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(true);
    const [advancedConfig, setAdvancedConfig] = useState({});
    const [isNameAvailable, setIsNameAvailable] = useState(true);

    useEffect(() => {
        fetchKnowledgeBases();
    }, []);

    const fetchKnowledgeBases = async () => {
        setIsLoadingKnowledgeBases(true);
        try {
            const response = await axios.get('/console/api/knowledge-bases/base-info');
            setKnowledgeBases(response.data.map(kb => ({ value: kb.id, label: kb.name })));
        } catch (error) {
            console.error('Error fetching knowledge bases:', error);
            showToast('获取知识库列表失败', 'error');
        } finally {
            setIsLoadingKnowledgeBases(false);
        }
    };

    const generateDefaultAvatar = (name) => {
        const avatar = createAvatar(initials, {
            seed: name,
            backgroundColor: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
        });
        return avatar.toDataUri();
    };

    const checkAgentName = debounce(async (name) => {
        if (!name.trim()) {
            setIsNameAvailable(true);
            return;
        }
        try {
            const response = await axios.get(`/console/api/agents/name-exists?name=${encodeURIComponent(name)}`);
            setIsNameAvailable(!response.data.exists);
        } catch (error) {
            console.error('Error checking agent name:', error);
        }
    }, 300);

    const handleAgentNameChange = (e) => {
        const newName = e.target.value;
        setAgentName(newName);
        checkAgentName(newName);

        // 清除名称相关的错误
        if (newName.trim()) {
            setErrors(prevErrors => ({ ...prevErrors, name: null }));
        }
    };

    const handleNextStep = async () => {
        // Validation
        const errors = {};
        if (!agentName.trim()) errors.name = "智能体名称不能为空";
        if (!isNameAvailable) errors.name = "智能体名称已存在";
        if (selectedKnowledgeBases.length === 0) errors.knowledgeBase = "请选择至少一个知识库";
        
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        let finalAvatar = avatarBase64;
        if (!finalAvatar) {
            const defaultAvatarUri = await generateDefaultAvatar(agentName);
            finalAvatar = defaultAvatarUri.split(',')[1]; // Remove the "data:image/svg+xml;base64," prefix
        }

        // Save basic settings data
        setAgentData({
            name: agentName,
            description: agentDescription,
            avatar: finalAvatar,
            greeting_message: greeting,
            empty_response: emptyResponse,
            knowledge_base_ids: selectedKnowledgeBases.map(kb => kb.value),
            show_citation: showCitation
        });

        setCurrentStep(2);
    };

    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    const handleComplete = async (advancedConfigData) => {
        setIsLoading(true);
        try {
            const completeAgentData = {
                ...agentData,
                advanced_config: advancedConfigData
            };

            const response = await axios.post('/console/api/agents', completeAgentData);
            showToast('智能体创建成功', 'success');
            onCreated(response.data);
        } catch (error) {
            console.error('Error creating agent:', error);
            const backendErrors = error.response?.data?.errors || {};
            setErrors(prevErrors => ({
                ...prevErrors,
                ...backendErrors,
                general: backendErrors.general || error.response?.data?.message || '创建智能体失败，请重试。'
            }));
            showToast('创建失败', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKnowledgeBaseChange = (selected) => {
        setSelectedKnowledgeBases(selected);
        // Clear the error message for knowledgeBase when a valid selection is made
        if (selected && selected.length > 0) {
            setErrors(prevErrors => ({ ...prevErrors, knowledgeBase: null }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setAvatarBase64(base64String);
                setAvatar(URL.createObjectURL(file));
            };
            reader.readAsDataURL(file);
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'bg-bg-secondary',
            borderColor: 'bg-bg-secondary',
            boxShadow: state.isFocused ? '0 0 0 2px text-primary' : 'none',
            '&:hover': {
                borderColor: 'text-primary',
            },
            transition: 'all 0.2s ease',
            fontFamily: 'Montserrat, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'bg-primary' : state.isFocused ? 'bg-bg-secondary' : 'bg-white',
            color: state.isSelected ? 'text-white' : 'text-text-body',
            fontFamily: 'Montserrat, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        singleValue: (provided) => ({
            ...provided,
            fontFamily: 'Montserrat, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        placeholder: (provided) => ({
            ...provided,
            fontFamily: 'Inter, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 10000,
            fontFamily: 'Inter, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        menuList: (provided) => ({
            ...provided,
            fontFamily: 'Inter, "Noto Sans SC", sans-serif', // 添加字体样式
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 10001,
        }),
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
                    <StepItem number={1} text="基础设置" active={currentStep === 1} completed={currentStep > 1} />
                    <StepItem number={2} text="高级配" active={currentStep === 2} completed={currentStep > 2} />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm p-3">
                {currentStep === 1 ? (
                    // 基础设置表单
                    <div className="p-6 space-y-6">
                        <h3 className="text-xl font-semibold text-text-body font-sans-sc mb-1">创建智能体</h3>
                        <p className="text-sm text-text-secondary font-sans-sc -mt-1">
                            智能体是可定制的AI助手，根据您的设置执行特定任务。
                        </p>
                        
                        <form className="space-y-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-1">
                                    <label htmlFor="agentName" className="block text-sm font-medium text-text-body mb-2 font-sans-sc">
                                        智能体名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="agentName"
                                        value={agentName}
                                        onChange={handleAgentNameChange}
                                        placeholder="如：财务助理、医疗助理等"
                                        className={`w-full p-3 text-sm font-tech bg-bg-secondary border ${errors.name || !isNameAvailable ? 'border-red-500' : 'border-bg-secondary'} rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
                                    />
                                    {(errors.name || !isNameAvailable) && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                                            {errors.name || (isNameAvailable ? '' : '该名称已被使用')}
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
                                            onChange={handleAvatarChange}
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
                                        <InfoIcon tooltip="当智能体无法从知识库中找到答案时的回复内容。" />
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
                                        <InfoIcon tooltip="选择智能体使用的知识库，这将决定智能体的专业领域和回答能力。可以选择多个知识库。" />
                                    </label>
                                    <div className="relative z-[9999]">
                                        <Select
                                            options={knowledgeBases}
                                            value={selectedKnowledgeBases}
                                            onChange={handleKnowledgeBaseChange}
                                            placeholder={isLoadingKnowledgeBases ? "加载中..." : "请选择知识库"}
                                            isDisabled={isLoadingKnowledgeBases}
                                            isMulti={true}
                                            isClearable={true}
                                            isSearchable={true}
                                            styles={customStyles}
                                            className="text-sm font-tech"
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            menuPortalTarget={document.body}
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                    {errors.knowledgeBase && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                                            {errors.knowledgeBase}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 sm:col-span-1 flex items-center">
                                    <label htmlFor="showCitation" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="showCitation"
                                                className="sr-only"
                                                checked={showCitation}
                                                onChange={(e) => setShowCitation(e.target.checked)}
                                            />
                                            <div className={`w-10 h-6 rounded-full shadow-inner transition-colors duration-200 ${showCitation ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                            <div className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-1 left-1 transition-transform duration-200 ${showCitation ? 'transform translate-x-full' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-sm font-medium text-text-body font-sans-sc flex items-center">
                                            显示引文
                                            <InfoIcon tooltip="开启后，智能体会在回答中展示引用的知识库内容。" />
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

                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary hover:bg-opacity-80 transition-colors duration-200 font-sans-sc flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    下一步
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // 高级配置
                    <CreateAgentAdvancedConfig
                        onBack={handlePreviousStep}
                        onComplete={handleComplete}
                        initialConfig={advancedConfig}
                    />
                )}
            </div>
        </div>
    );
}

function StepItem({ number, text, active = false, completed = false }) {
    return (
        <li className={`flex items-center ${active ? 'text-text-body' : 'text-text-muted'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${completed ? 'bg-primary text-white' : active ? 'bg-primary text-white font-semibold' : 'bg-bg-secondary'}`}>
                {completed ? <CheckIcon className="w-4 h-4" /> : number}
            </span>
            <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
        </li>
    );
}

function InfoIcon({ tooltip }) {
    return (
        <div className="group relative inline-block ml-2">
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="opacity-0 bg-black text-white text-xs rounded py-1 px-2 absolute z-[10002] bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 group-hover:opacity-100 transition-opacity duration-300 w-48 text-center pointer-events-none">
                {tooltip}
                <svg className="absolute text-black h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
            </div>
        </div>
    );
}

export default CreateAgent;