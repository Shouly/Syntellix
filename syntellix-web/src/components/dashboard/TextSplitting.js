import React, { useState } from 'react';
import { Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { QuestionMarkCircleIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

// 自定义 Slider 样式
const CustomSlider = styled(Slider)(({ theme }) => ({
  color: '#4f46e5', // indigo-600
  height: 4,
  padding: '13px 0',
  '& .MuiSlider-track': {
    height: 4,
    backgroundColor: '#4f46e5', // indigo-600
  },
  '& .MuiSlider-rail': {
    height: 4,
    opacity: 0.5,
    backgroundColor: '#bfbfbf',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: 'inherit',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#4f46e5', // indigo-600
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

function TextSplitting({ onNextStep, onPreviousStep }) {
    const [splitConfig, setSplitConfig] = useState({
        method: 'General',
        chunkSize: 512,
        separator: '\\n!?。；！？',
        layoutAware: true
    });
    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);

    const handleConfigChange = (name, value) => {
        setSplitConfig(prevConfig => ({
            ...prevConfig,
            [name]: value
        }));
    };

    const methods = [
        'General', 'Q&A', 'Resume', 'Manual', 'Table', 'Paper', 'Book', 'Laws'
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 font-noto-sans-sc">文本分段配置</h3>
                <div className="flex space-x-8">
                    <div className="w-1/3 pr-8 pl-8 border-r border-gray-300">
                        <div className="space-y-6 pr-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 font-noto-sans-sc">解析方法</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <span className="block truncate">{splitConfig.method}</span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </button>
                                    {isMethodDropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                            {methods.map((method) => (
                                                <div
                                                    key={method}
                                                    className={`${
                                                        method === splitConfig.method ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                                    } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50`}
                                                    onClick={() => {
                                                        handleConfigChange('method', method);
                                                        setIsMethodDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className={`${method === splitConfig.method ? 'font-semibold' : 'font-normal'} block truncate`}>
                                                        {method}
                                                    </span>
                                                    {method === splitConfig.method && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 font-noto-sans-sc">块Token数</label>
                                <div className="flex items-center space-x-4">
                                    <CustomSlider
                                        value={splitConfig.chunkSize}
                                        onChange={(_, newValue) => handleConfigChange('chunkSize', newValue)}
                                        aria-labelledby="chunk-size-slider"
                                        valueLabelDisplay="auto"
                                        step={1}
                                        marks
                                        min={0}
                                        max={2048}
                                    />
                                    <input
                                        type="number"
                                        name="chunkSize"
                                        value={splitConfig.chunkSize}
                                        onChange={(e) => handleConfigChange('chunkSize', e.target.value)}
                                        className="w-20 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm font-noto-sans-sc"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 font-noto-sans-sc">分段标识符</label>
                                <input
                                    type="text"
                                    name="separator"
                                    value={splitConfig.separator}
                                    onChange={(e) => handleConfigChange('separator', e.target.value)}
                                    className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm font-noto-sans-sc"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700 font-noto-sans-sc flex items-center">
                                        布局识别
                                        <div className="relative group ml-1">
                                            <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 cursor-help" aria-hidden="true" />
                                            <div className="absolute z-10 w-64 p-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-gray-600 left-1/2 -translate-x-1/2 top-6">
                                                启用此选项可以更好地保留文档的原始布局结构
                                            </div>
                                        </div>
                                    </span>
                                </div>
                                <label className="flex items-center space-x-3 cursor-pointer mb-2">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="layoutAware"
                                            checked={splitConfig.layoutAware}
                                            onChange={(e) => handleConfigChange('layoutAware', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                            splitConfig.layoutAware ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                                            splitConfig.layoutAware ? 'transform translate-x-4' : ''
                                        }`}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 font-noto-sans-sc">
                                        {splitConfig.layoutAware ? '已启用' : '未启用'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="w-2/3 pl-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 font-noto-sans-sc"><span className="font-tech font-semibold">General</span> 分块方法说明</h4>
                        <p className="text-sm text-gray-700 mb-4 font-noto-sans-sc">
                            支持的文件格式：<span className="font-bold font-tech">DOCX、EXCEL、PPT、IMAGE、PDF、TXT、MD、JSON、EML、HTML</span>
                        </p>
                        <p className="text-sm text-gray-700 mb-4 font-noto-sans-sc">
                            此方法采用以下步骤处理文件：
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 font-noto-sans-sc">
                            <li>使用视觉检测模型将文本智能分割为多个语义片段。</li>
                            <li>将这些片段合并成不超过设定"Token数"的连续块。</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={onPreviousStep}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                    <span className="font-noto-sans-sc">上一步</span>
                </button>
                <button
                    onClick={onNextStep}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <span className="font-noto-sans-sc">保存配置</span>
                </button>
            </div>
        </div>
    );
}

export default TextSplitting;