import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa'; // 导入信息图标

const AIGenerateModal = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    onGenerate(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-20">
      <div className="bg-bg-primary rounded-lg p-8 w-full max-w-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-primary font-sans-sc">
            <span className="mr-2 text-primary-light">🤖</span>
            AI自动创建智能体
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors text-2xl">
            &times;
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4 font-sans-sc">请用一句话描述您想要的智能体：</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述智能体的主要职能、所需技能和预期任务。例如：创建一个专业的活动策划助理，能够制定团建方案并推荐所需物品。"
          className="w-full h-40 p-3 border border-secondary rounded-md mb-2 font-sans-sc text-text-body focus:ring-2 focus:ring-primary-light focus:border-transparent resize-none"
        />
        <div className="flex items-center text-sm text-text-muted mb-4 font-sans-sc">
          <FaInfoCircle className="mr-2 text-primary-light" />
          <p>生成结果将替换当前的配置内容</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 font-sans-sc text-sm font-medium"
          >
            自动生成
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateModal;