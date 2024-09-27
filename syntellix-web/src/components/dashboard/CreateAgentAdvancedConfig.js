import React, { useState } from 'react';
import { InformationCircleIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

// 自定义 Slider 样式（与 TextSplitting.js 中的相同）
const CustomSlider = styled(Slider)(({ theme }) => ({
    // ... (保留与 TextSplitting.js 中相同的样式)
}));

function CreateAgentAdvancedConfig({ onBack, onComplete }) {
    const [advancedConfig, setAdvancedConfig] = useState({
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleConfigChange = (name, value) => {
        setAdvancedConfig(prevConfig => ({
            ...prevConfig,
            [name]: value
        }));
    };

    const handleComplete = async () => {
        setError('');
        setIsProcessing(true);
        try {
            await onComplete(advancedConfig);
        } catch (error) {
            console.error('Error completing agent creation:', error);
            setError(error.message || '保存失败，请重试。');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold text-text-body font-noto-sans-sc">高级配置</h3>
                <div className="grid grid-cols-2 gap-6">
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
                        value={advancedConfig.maxTokens}
                        onChange={(value) => handleConfigChange('maxTokens', value)}
                        min={1}
                        max={4096}
                        step={1}
                        tooltip="限制智能体生成的最大标记数。"
                    />
                    <ConfigSlider
                        label="Top P"
                        value={advancedConfig.topP}
                        onChange={(value) => handleConfigChange('topP', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        tooltip="控制输出的多样性。1 表示考虑所有可能性，较低的值会限制考虑的可能性范围。"
                    />
                    <ConfigSlider
                        label="Frequency Penalty"
                        value={advancedConfig.frequencyPenalty}
                        onChange={(value) => handleConfigChange('frequencyPenalty', value)}
                        min={-2}
                        max={2}
                        step={0.1}
                        tooltip="降低模型重复使用相同词语的可能性。正值会降低重复，负值会增加重复。"
                    />
                    <ConfigSlider
                        label="Presence Penalty"
                        value={advancedConfig.presencePenalty}
                        onChange={(value) => handleConfigChange('presencePenalty', value)}
                        min={-2}
                        max={2}
                        step={0.1}
                        tooltip="增加模型谈论新主题的可能性。正值会鼓励新主题，负值会鼓励重复主题。"
                    />
                </div>
            </div>
            {error && (
                <div className="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex items-center space-x-4">
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
                        <span className="font-noto-sans-sc">完成</span>
                    )}
                </button>
            </div>
        </div>
    );
}

function ConfigSlider({ label, value, onChange, min, max, step, tooltip }) {
    return (
        <div className="col-span-1">
            <label className="block text-sm font-semibold text-text-body mb-2 font-noto-sans-sc flex items-center">
                {label}
                <InfoIcon tooltip={tooltip} />
            </label>
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
            <div className="text-sm text-text-secondary mt-1">{value}</div>
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