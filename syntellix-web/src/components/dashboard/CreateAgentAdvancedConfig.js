import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

// 自定义 Slider 样式（与 TextSplitting.js 中的相同）
const CustomSlider = styled(Slider)(({ theme }) => ({
    // ... (保留与 TextSplitting.js 中相同的样式)
}));

function CreateAgentAdvancedConfig({ onBack, onComplete, initialConfig, error }) {
    const [advancedConfig, setAdvancedConfig] = useState({
        similarity_threshold: initialConfig.similarity_threshold || 0.7,
        top_n: initialConfig.top_n || 3,
        temperature: initialConfig.temperature || 0.1,
        max_tokens: initialConfig.max_tokens || 2048,
        top_p: initialConfig.top_p || 1,
        frequency_penalty: initialConfig.frequency_penalty || 0,
        presence_penalty: initialConfig.presence_penalty || 0
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfigChange = (name, value) => {
        setAdvancedConfig(prevConfig => ({
            ...prevConfig,
            [name]: value
        }));
    };

    const handleComplete = async () => {
        setIsProcessing(true);
        try {
            await onComplete(advancedConfig);
        } catch (error) {
            console.error('Error completing agent creation:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h3 className="text-xl font-semibold text-text-body font-sans-sc mb-0.5">高级配置</h3>
            <p className="text-sm text-text-secondary font-sans-sc">
                默认设置已经过优化，适合大多数情况。您可以根据具体需求随时调整这些参数。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ConfigSlider
                    label="相似度阈值"
                    value={advancedConfig.similarity_threshold}
                    onChange={(value) => handleConfigChange('similarity_threshold', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    tooltip="控制文本块的过滤。如果查询和块之间的相似度小于此阈值，该块将被过滤掉。"
                />
                <ConfigSlider
                    label="Top N"
                    value={advancedConfig.top_n}
                    onChange={(value) => handleConfigChange('top_n', value)}
                    min={1}
                    max={20}
                    step={1}
                    tooltip="控制提供给大语言模型的文本块数量。只有相似度最高的Top N个块会被使用。"
                />
                <ConfigSlider
                    label="Temperature"
                    value={advancedConfig.temperature}
                    onChange={(value) => handleConfigChange('temperature', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    tooltip="控制输出的随机性。较高的值会使输出更加多样化，较低的值会使输出更加确定和集中。"
                />
                <ConfigSlider
                    label="Max Tokens"
                    value={advancedConfig.max_tokens}
                    onChange={(value) => handleConfigChange('max_tokens', value)}
                    min={1}
                    max={4096}
                    step={1}
                    tooltip="限制智能体生成的最大标记数。"
                />
                <ConfigSlider
                    label="Top P"
                    value={advancedConfig.top_p}
                    onChange={(value) => handleConfigChange('top_p', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    tooltip="控制输出的多样性。1 表示考虑所有可能性，较低的值会限制考虑的可能性范围。"
                />
                <ConfigSlider
                    label="Frequency Penalty"
                    value={advancedConfig.frequency_penalty}
                    onChange={(value) => handleConfigChange('frequency_penalty', value)}
                    min={-2}
                    max={2}
                    step={0.1}
                    tooltip="降低模型重复使用相同词语的可能性。正值会降低重复，负值会增加重复。"
                />
                <ConfigSlider
                    label="Presence Penalty"
                    value={advancedConfig.presence_penalty}
                    onChange={(value) => handleConfigChange('presence_penalty', value)}
                    min={-2}
                    max={2}
                    step={0.1}
                    tooltip="增加模型谈论新主题的可能性。正值会鼓励新主题，负值会鼓励重复主题。"
                />
            </div>
            {error && (
                <div className="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex justify-end items-center space-x-4 mt-8">
                <button
                    onClick={onBack}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-bg-secondary hover:bg-bg-tertiary text-text-body"
                    disabled={isProcessing}
                >
                    <span className="font-noto-sans-sc">上一步</span>
                </button>
                <button
                    onClick={handleComplete}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-primary hover:bg-primary-dark text-bg-primary"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                            <span className="font-noto-sans-sc">处理中...</span>
                        </>
                    ) : (
                        <span className="font-noto-sans-sc">创建</span>
                    )}
                </button>
            </div>
        </div>
    );
}

function ConfigSlider({ label, value, onChange, min, max, step, tooltip }) {
    return (
        <div className="flex items-center space-x-4 bg-bg-secondary p-4 rounded-lg">
            <div className="w-1/4">
                <label className="block text-sm font-semibold text-text-body mb-1 font-noto-sans-sc flex items-center">
                    {label}
                    <InfoIcon tooltip={tooltip} />
                </label>
                <div className="text-sm text-text-secondary">{value}</div>
            </div>
            <div className="w-3/4">
                <CustomSlider
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    aria-labelledby={`${label}-slider`}
                    valueLabelDisplay="auto"
                    step={step}
                    marks
                    min={min}
                    max={max}
                />
            </div>
        </div>
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

export default CreateAgentAdvancedConfig;