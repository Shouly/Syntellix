import { ChatBubbleLeftRightIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AgentAvatar from '../AgentAvatar';

// Add this new component at the top of the file
const AgentSkeleton = () => (
    <div className="bg-bg-primary rounded-lg p-3 shadow-sm border border-secondary w-full animate-pulse">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-full"></div>
            <div className="flex-grow">
                <div className="h-4 bg-secondary rounded w-3/4"></div>
            </div>
            <div className="w-4 h-4 bg-secondary rounded"></div>
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
            className="bg-bg-primary hover:bg-bg-secondary rounded-lg p-3 cursor-pointer transition-all duration-200 flex items-center space-x-2 group shadow-sm hover:shadow-md border border-secondary w-full"
        >
            <AgentAvatar avatarData={agent.avatar} agentName={agent.name} size="small" />
            <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-sm text-text-body group-hover:text-primary transition-colors duration-200 truncate">{agent.name}</h3>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-text-muted group-hover:text-primary flex-shrink-0 transition-colors duration-200" />
        </div>
    );

    return (
        <div className="h-full bg-bg-primary p-6 overflow-y-auto rounded-lg">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold mb-2 text-text-body font-sans-sc">开启第一次对话</h1>
                    <p className="text-xm text-text-muted">选择一个智能体，点击开始AI对话之旅</p>
                </div>

                {isLoading ? (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold mb-4 text-text-body">推荐智能体</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[...Array(5)].map((_, index) => (
                                    <AgentSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-text-body">所有智能体</h2>
                            <div className="mb-4 relative">
                                {/* Search input placeholder */}
                                <div className="w-full h-10 bg-secondary rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[...Array(10)].map((_, index) => (
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
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold mb-4 text-text-body">推荐智能体</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {recentAgents.slice(0, 5).map(renderAgentCard)}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-text-body">所有智能体</h2>
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    placeholder="搜索智能体..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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