import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

const RecommendedQuestions = ({ questions, onQuestionClick }) => {
  return (
    <div className="w-full max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="flex items-center p-3 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary rounded-lg text-left transition-all duration-200 group"
          >
            <LightBulbIcon className="w-5 h-5 mr-3 text-primary group-hover:text-primary-dark flex-shrink-0" />
            <span className="text-sm text-text-primary group-hover:text-primary line-clamp-2">{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedQuestions;
