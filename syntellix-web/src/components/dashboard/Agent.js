import { ChevronDownIcon, Cog6ToothIcon, ExclamationCircleIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function Agent({ onCreateNew, onAgentClick }) {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [tags, setTags] = useState(['全部标签']);
    const [selectedTag, setSelectedTag] = useState('全部标签');
    const navigate = useNavigate();

    // Add mock data
    const mockAgents = [
        {
            id: 1,
            name: "客服助手",
            conversation_count: 120,
            updated_at: "2023-06-01T10:00:00Z",
            tags: ["客服", "销售"]
        },
        {
            id: 2,
            name: "技术支持",
            conversation_count: 85,
            updated_at: "2023-06-02T14:30:00Z",
            tags: ["技术", "IT"]
        },
        {
            id: 3,
            name: "营销助手",
            conversation_count: 200,
            updated_at: "2023-06-03T09:15:00Z",
            tags: ["营销", "广告"]
        }
    ];

    useEffect(() => {
        // Replace API call with mock data
        setAgents(mockAgents);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (error) {
            showToast(error, 'error');
        }
    }, [error, showToast]);

    const fetchAgents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/console/api/agents');
            setAgents(response.data.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setError('智能体获取失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (agent) => {
        setAgentToDelete(agent);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (agentToDelete) {
            setIsDeleting(true);
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAgents(agents.filter(a => a.id !== agentToDelete.id));
                showToast('智能体删除成功', 'success');
            } catch (error) {
                console.error('Error deleting agent:', error);
                showToast('智能体删除失败', 'error');
            } finally {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setAgentToDelete(null);
            }
        }
    };

    const TagSelector = ({ tags, selectedTag, setSelectedTag }) => (
        <div className="relative">
            <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-2 text-sm rounded-md bg-bg-primary border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 appearance-none cursor-pointer font-noto-sans-sc text-text-body"
            >
                {tags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
        </div>
    );

    const SearchBox = () => (
        <div className="relative">
            <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 text-sm rounded-md bg-bg-primary border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 w-48 font-noto-sans-sc text-text-body"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
    );

    const NewAgentCard = () => (
        <div
            className="bg-bg-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer group"
            onClick={onCreateNew}
        >
            <div className="absolute inset-0 rounded-xl bg-primary opacity-5 group-hover:opacity-10 transition-all duration-300"></div>
            <div className="absolute inset-[1px] rounded-[11px] flex items-center p-6 z-10">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-opacity-20 transition-all duration-300">
                    <PlusIcon className="w-10 h-10 text-primary group-hover:text-primary-dark transition-all duration-300" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-text-body font-noto-sans-sc mb-2 group-hover:text-primary transition-all duration-300">创建智能体</h3>
                    <p className="text-xs text-text-secondary font-noto-sans-sc group-hover:text-text-body transition-all duration-300">
                        创建新的AI助手来帮助您完成任务。
                    </p>
                </div>
            </div>
        </div>
    );

    const SkeletonCard = () => (
        <div className="bg-bg-primary bg-opacity-30 backdrop-filter backdrop-blur-sm rounded-xl shadow-md overflow-hidden flex flex-col justify-between h-48 relative animate-pulse">
            <div className="p-6">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-lg"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-primary bg-opacity-20 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-primary bg-opacity-10 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 bg-primary bg-opacity-10">
                <div className="h-3 bg-primary bg-opacity-20 rounded w-1/4"></div>
            </div>
        </div>
    );

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const distance = formatDistanceToNow(date, { locale: zhCN });
        return distance.replace(/大约 /, '')
            .replace(/ 天/, '天')
            .replace(/ 个?小时/, '小时')
            .replace(/ 分钟/, '分钟')
            .replace(/不到 /, '');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <>
                    <NewAgentCard />
                    {[...Array(5)].map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </>
            );
        }

        if (error) {
            return (
                <div className="col-span-full flex flex-col items-center justify-center h-64 bg-danger-light bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl p-6">
                    <ExclamationCircleIcon className="w-12 h-12 text-danger mb-4" />
                    <div className="text-danger font-semibold text-lg mb-2">获取智能体失败</div>
                    <div className="text-danger-dark text-sm mb-4">{error}</div>
                    <button
                        onClick={fetchAgents}
                        className="px-4 py-2 bg-danger text-bg-primary rounded-md hover:bg-danger-dark transition-colors duration-200"
                    >
                        重试
                    </button>
                </div>
            );
        }

        return (
            <>
                <NewAgentCard />
                {agents.map((agent) => (
                    <div
                        key={agent.id}
                        className="group bg-bg-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer"
                        onClick={() => onAgentClick(agent.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-text-body font-noto-sans-sc mb-1">{agent.name}</h3>
                                        <div className="flex items-center text-xs text-text-muted font-noto-sans-sc">
                                            <span>{agent.conversation_count} 对话</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-text-muted font-noto-sans-sc">
                                    {formatRelativeTime(agent.updated_at)}前更新
                                </span>
                            </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between mt-auto border-t border-bg-secondary">
                            <div className="flex items-center text-xs text-text-muted space-x-2 font-noto-sans-sc">
                                {agent.tags && agent.tags.map((tag, index) => (
                                    <span key={index} className="bg-bg-secondary text-text-secondary px-2 py-1 rounded">{tag}</span>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    className="text-text-muted hover:text-primary transition-colors duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Settings clicked for', agent.name);
                                    }}
                                >
                                    <Cog6ToothIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(agent);
                                    }}
                                    className="text-text-muted hover:text-danger transition-colors duration-200"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="space-y-6 pt-4">
            <header className="flex items-center justify-between px-6">
                <div className="flex items-end space-x-4">
                    <h2 className="text-xl font-bold text-text-body font-noto-sans-sc">智能体</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <TagSelector tags={tags} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
                    <SearchBox />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                {renderContent()}
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemType="智能体"
                itemName={agentToDelete?.name}
                isLoading={isDeleting}
            />
        </div>
    );
}

export default Agent;

