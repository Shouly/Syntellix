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
        <h1 className="text-base font-semibold text-text-body font-sans-sc truncate ml-2">
          {agentInfo.name || '智能助手'}
        </h1>
      </div>
      {agentInfo.description && (
        <p className="text-xs text-text-muted mt-2 line-clamp-2 hover:line-clamp-none transition-all duration-300">
          {agentInfo.description}
        </p>
      )}
      {/* Knowledge bases */}
      {agentInfo.knowledge_bases?.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-text-secondary mb-2">关联知识库:</h4>
          <ul className="space-y-1">
            {agentInfo.knowledge_bases.map((kb) => (
              <li
                key={kb.id}
                className="flex items-center cursor-pointer text-xs text-text-muted hover:text-primary transition-colors duration-200"
                onClick={() => onKnowledgeBaseClick(kb.id)}
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
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