import React, { useState } from 'react';

function TextSplitting({ onNextStep, onPreviousStep }) {
    const [splitConfig, setSplitConfig] = useState({
        method: 'General',
        chunkSize: 128,
        separator: '\\n!?。；！？',
        layoutAware: true
    });

    const handleConfigChange = (e) => {
        setSplitConfig({
            ...splitConfig,
            [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 font-noto-sans-sc">文本切分配置</h3>
                <div className="flex">
                    <div className="w-1/2 pr-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">解析方法</label>
                                <select
                                    name="method"
                                    value={splitConfig.method}
                                    onChange={handleConfigChange}
                                    className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="General">General</option>
                                    {/* Add more options if needed */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">块Token数</label>
                                <input
                                    type="number"
                                    name="chunkSize"
                                    value={splitConfig.chunkSize}
                                    onChange={handleConfigChange}
                                    className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">分段标识符</label>
                                <input
                                    type="text"
                                    name="separator"
                                    value={splitConfig.separator}
                                    onChange={handleConfigChange}
                                    className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="layoutAware"
                                        checked={splitConfig.layoutAware}
                                        onChange={handleConfigChange}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">布局识别</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 pl-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">配置说明</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><strong>解析方法：</strong>选择文本切分的算法。General 适用于大多数场景。</li>
                            <li><strong>块Token数：</strong>设置每个文本块的最大 Token 数量。较小的值会产生更多、更小的块。</li>
                            <li><strong>分段标识符：</strong>指定用于分割文本的标点符号或字符。系统会优先在这些字符处进行分割。</li>
                            <li><strong>布局识别：</strong>启用后，系统会尝试识别文档的布局结构，如段落、标题等，以更智能地进行文本分割。</li>
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
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <span className="font-noto-sans-sc">保存配置</span>
                </button>
            </div>
        </div>
    );
}

export default TextSplitting;