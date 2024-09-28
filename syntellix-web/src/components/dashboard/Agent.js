import { ChevronDownIcon, Cog6ToothIcon, ExclamationCircleIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlusIcon,ChevronLeftIcon,ChevronRightIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Avatar } from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { MuiIcons } from '../../utils/iconMap';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

const renderAvatar = (avatarData, agentName) => {
    if (!avatarData) {
        return (
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }

    try {
        const { icon, color } = JSON.parse(avatarData);
        
        if (icon && MuiIcons[icon]) {
            // Preset icon
            const IconComponent = MuiIcons[icon];
            return (
                <Avatar sx={{ width: 80, height: 80, bgcolor: color || 'primary.main' }}>
                    <IconComponent sx={{ fontSize: 48, color: 'white' }} />
                </Avatar>
            );
        } else if (typeof icon === 'string' && icon.startsWith('data:image')) {
            console.log(2)
            // Uploaded image (base64)
            return (
                <Avatar
                    src={icon}
                    sx={{ width: 80, height: 80, bgcolor: color || 'primary.main' }}
                >
                    {agentName.charAt(0).toUpperCase()}
                </Avatar>
            );
        }

        // Fallback to default avatar
        console.warn(`Unexpected avatar data for agent ${agentName}:`, avatarData);
        return (
            <Avatar sx={{ width: 80, height: 80, bgcolor: color || 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    } catch (error) {
        console.error(`Error parsing avatar data for agent ${agentName}:`, error);
        return (
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                {agentName.charAt(0).toUpperCase()}
            </Avatar>
        );
    }
};

const PaginationCard = ({ currentPage, totalPages, onPageChange, isLoading }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center h-64 px-4">
        {isLoading ? (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        ) : (
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-primary hover:bg-primary-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <span className="text-sm text-text-secondary">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-primary hover:bg-primary-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
        )}
    </div>
);

function Agent({ onCreateNew, onAgentClick }) {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [tags, setTags] = useState(['全部标签']);
    const [selectedTag, setSelectedTag] = useState('全部标签');
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAgents = async (pageNumber = 1, newSearch = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/console/api/agents/list', {
                params: {
                    page: pageNumber,
                    page_size: 8,
                    search: search
                }
            });
            setAgents(response.data.items);
            setPage(response.data.page);
            setTotalPages(response.data.total_pages);
            setHasMore(response.data.has_next);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setError('智能体获取失败');
            showToast('智能体获取失败', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents(1, true);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchAgents(newPage);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearch = () => {
        fetchAgents(1, true);
    };

    const handleDeleteClick = (agent) => {
        setAgentToDelete(agent);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (agentToDelete) {
            setIsDeleting(true);
            try {
                await axios.delete(`/console/api/agents/${agentToDelete.id}`);
                showToast('智能体删除成功', 'success');
                // Refetch agents after successful deletion
                fetchAgents(page);
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
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 text-sm rounded-md bg-bg-primary border border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 w-48 font-noto-sans-sc text-text-body"
            />
            <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary cursor-pointer"
                onClick={handleSearch}
            />
        </div>
    );

    const NewAgentCard = () => (
        <div
            onClick={handleCreateAgent}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md flex flex-col h-64"
        >
            <div className="bg-gradient-to-r from-primary-light/30 to-secondary-light h-2/3 flex items-center justify-center">
                <PlusIcon className="w-16 h-16 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4 flex-grow flex flex-col justify-center">
                <h3 className="text-base font-semibold text-primary group-hover:text-primary-dark transition-colors duration-300">创建智能体</h3>
                <p className="text-xs text-text-secondary mt-1">开启您的新AI助手之旅</p>
            </div>
        </div>
    );

    const AgentCard = ({ agent, onAgentClick, onDeleteClick }) => {
        const [showActions, setShowActions] = useState(false);
        const avatarData = agent.avatar ? JSON.parse(agent.avatar) : null;
        const avatarBgColor = avatarData?.color || 'primary.main';
        const avatarContent = renderAvatar(agent.avatar, agent.name);

        return (
            <div
                onClick={() => onAgentClick(agent.id)}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md flex flex-col h-64 relative"
            >
                <div className="h-2/3 flex items-center justify-center bg-gradient-to-br from-primary-light/10 to-primary-light/30">
                    {avatarContent}
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                    <h3 className="text-lg font-semibold text-text-body group-hover:text-primary transition-colors duration-300 truncate">{agent.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {agent.tags && agent.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                        ))}
                        {agent.tags && agent.tags.length > 2 && (
                            <span className="text-xs text-text-secondary">+{agent.tags.length - 2}</span>
                        )}
                    </div>
                </div>
                {showActions && (
                    <div className="absolute bottom-0 left-0 right-0 bg-bg-primary bg-opacity-90 p-2 flex justify-end space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Settings clicked for', agent.name);
                            }}
                            className="text-text-muted hover:text-primary transition-colors duration-200 p-1 rounded-full hover:bg-primary-light/20"
                        >
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(agent);
                            }}
                            className="text-text-muted hover:text-danger transition-colors duration-200 p-1 rounded-full hover:bg-danger-light/20"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-64 animate-pulse">
            <div className="h-2/3 bg-primary/5 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full"></div>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div className="h-5 bg-primary/10 rounded w-3/4"></div>
                <div className="space-y-2 mt-2">
                    <div className="h-4 bg-primary/5 rounded w-full"></div>
                    <div className="h-4 bg-primary/5 rounded w-2/3"></div>
                </div>
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
        if (isLoading && agents.length === 0) {
            return (
                <>
                    <NewAgentCard onCreateNew={onCreateNew} />
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
                <NewAgentCard onCreateNew={onCreateNew} />
                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onAgentClick={onAgentClick} onDeleteClick={handleDeleteClick} />
                ))}
                {totalPages > 1 && (
                    <PaginationCard
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        isLoading={isLoading}
                    />
                )}
            </>
        );
    };

    const handleCreateAgent = () => {
        onCreateNew();
    };

    return (
        <div className="bg-bg-secondary min-h-screen p-3 space-y-6">
            {/* Header */}
            <header className="bg-bg-primary rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-end space-x-4">
                    <h2 className="text-lg font-bold text-primary font-noto-sans-sc">智能体</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <TagSelector tags={tags} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
                    <SearchBox />
                </div>
            </header>

            {/* Content */}
            <div className="bg-bg-primary rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {renderContent()}
                </div>
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

