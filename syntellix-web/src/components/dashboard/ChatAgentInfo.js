import React from 'react';
import AgentAvatar from '../AgentAvatar';

function AgentInfo({ agentInfo, onKnowledgeBaseClick }) {
  if (!agentInfo) return null;

  return (
    <div className="p-4 bg-bg-primary">
      <div className="flex items-center mb-4">
        <AgentAvatar
          avatarData={agentInfo.avatar}
          agentName={agentInfo.name || '智能助手'}
          size="small"
        />
        <h1 className="text-lg font-semibold text-text-primary font-sans-sc truncate ml-3">
          {agentInfo.name || '智能助手'}
        </h1>
      </div>
      {agentInfo.description && (
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          {agentInfo.description}
        </p>
      )}
      {/* Knowledge bases */}
      {agentInfo.knowledge_bases?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-primary mb-2">关联知识库:</h4>
          <ul className="space-y-1">
            {agentInfo.knowledge_bases.map((kb) => (
              <li
                key={kb.id}
                className="flex items-center cursor-pointer text-xs text-text-secondary hover:text-primary transition-colors duration-200 py-1.5 px-2 rounded-md hover:bg-bg-secondary"
                onClick={() => onKnowledgeBaseClick(kb.id)}
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
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
