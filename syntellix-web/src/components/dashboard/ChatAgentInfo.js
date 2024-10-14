import React from 'react';
import AgentAvatar from '../AgentAvatar';

function AgentInfo({ agentInfo, onKnowledgeBaseClick }) {
  if (!agentInfo) return null;

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <AgentAvatar
          avatarData={agentInfo.avatar}
          agentName={agentInfo.name || '智能助手'}
          size="small"
        />
        <h1 className="text-lg font-semibold text-text-primary font-sans-sc truncate ml-2">
          {agentInfo.name || '智能助手'}
        </h1>
      </div>
      {agentInfo.description && (
        <p className="text-sm text-text-secondary mt-2 mb-4">
          {agentInfo.description}
        </p>
      )}
      {/* Knowledge bases */}
      {agentInfo.knowledge_bases?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-text-secondary mb-3">关联知识库:</h4>
          <ul className="space-y-2">
            {agentInfo.knowledge_bases.map((kb) => (
              <li
                key={kb.id}
                className="flex items-center cursor-pointer text-sm text-text-primary hover:text-primary transition-colors duration-200 py-1"
                onClick={() => onKnowledgeBaseClick(kb.id)}
              >
                <span className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                <span className="truncate">{kb.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AgentInfo;
