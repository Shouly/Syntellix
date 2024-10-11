import { ChatBubbleLeftRightIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AgentAvatar from '../AgentAvatar';

// Add this new component at the top of the file
const AgentSkeleton = () => (
    <div className="bg-bg-secondary rounded-md p-2.5 shadow-sm border border-bg-tertiary w-full animate-pulse">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bg-tertiary rounded-full"></div>
            <div className="flex-grow">
                <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
            </div>
            <div className="w-4 h-4 bg-bg-tertiary rounded"></div>
        </div>
    </div>
);

function NewChatPrompt({ onSelectAgent, setLoading }) {
    const [recentAgents, setRecentAgents] = useState([]);
    const [allAgents, setAllAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [recentResponse, allResponse] = await Promise.all([
                axios.get('/console/api/agents/recent'),
                axios.get('/console/api/agents/list')
            ]);
            setRecentAgents(recentResponse.data);
            setAllAgents(allResponse.data.items);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setError('获取智能体失败');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAgents = allAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAgentSelect = (agentId) => {
        setLoading(true);  // Set loading to true before calling onSelectAgent
        onSelectAgent(agentId);
    };

    const renderAgentCard = (agent) => (
        <div
            key={agent.id}
            onClick={() => handleAgentSelect(agent.id)}
            className="bg-bg-secondary hover:bg-bg-tertiary rounded-md p-2.5 cursor-pointer transition-all duration-200 flex items-center space-x-2 group border border-bg-tertiary hover:border-primary"
        >
            <AgentAvatar avatarData={agent.avatar} agentName={agent.name} size="small" />
            <div className="flex-grow min-w-0">
                <h3 className="font-medium text-sm text-text-body group-hover:text-primary transition-colors duration-200 truncate">{agent.name}</h3>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-text-muted group-hover:text-primary flex-shrink-0 transition-colors duration-200" />
        </div>
    );

    return (
        <div className="h-full bg-bg-primary overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6">
                <div className="text-center mb-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h1 className="text-xl font-semibold mb-2 text-text-body font-sans-sc">开始第一次对话</h1>
                    <p className="text-sm text-text-muted">请选择一个智能体，点击后开启对话</p>
                </div>

                {isLoading ? (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-base font-semibold mb-3 text-text-body">推荐智能体</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {[...Array(4)].map((_, index) => (
                                    <AgentSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold mb-3 text-text-body">所有智能体</h2>
                            <div className="mb-3 relative max-w-md">
                                <div className="w-full h-9 bg-bg-secondary rounded-md animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {[...Array(8)].map((_, index) => (
                                    <AgentSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-danger mb-6 p-4 bg-danger-light rounded-lg font-medium text-center">{error}</div>
                ) : (
                    <>
                        {recentAgents.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-base font-semibold mb-3 text-text-body">推荐智能体</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {recentAgents.slice(0, 4).map(renderAgentCard)}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-base font-semibold mb-3 text-text-body">所有智能体</h2>
                            <div className="mb-3 relative max-w-md">
                                <input
                                    type="text"
                                    placeholder="搜索智能体..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 rounded-md border border-bg-tertiary bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                                />
                                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredAgents.map(renderAgentCard)}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default NewChatPrompt;