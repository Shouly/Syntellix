import { ArrowPathIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AgentAvatar from '../AgentAvatar';

function NewChatPrompt({ onSelectAgent }) {
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

    const renderAgentCard = (agent) => (
        <div
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className="bg-bg-secondary hover:bg-bg-tertiary text-text-body rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center space-x-4 group"
        >
            <AgentAvatar avatarData={agent.avatar} agentName={agent.name} size="small" />
            <div className="flex-grow">
                <h3 className="font-semibold font-sans-sc group-hover:text-primary transition-colors duration-200">{agent.name}</h3>
                <p className="text-sm text-text-muted">{agent.description || '无描述'}</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors duration-200" />
        </div>
    );

    return (
        <div className="h-full bg-bg-primary p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-text-body font-sans-sc">开始新的对话</h2>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <ArrowPathIcon className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : error ? (
                <div className="text-danger mb-4">{error}</div>
            ) : (
                <>
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-text-body font-sans-sc">最近使用的智能体</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentAgents.slice(0, 3).map(renderAgentCard)}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-text-body font-sans-sc">所有智能体</h3>
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="搜索智能体..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAgents.map(renderAgentCard)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default NewChatPrompt;