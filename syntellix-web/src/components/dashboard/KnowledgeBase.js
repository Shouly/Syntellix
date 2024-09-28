import { ChevronDownIcon, Cog6ToothIcon, ExclamationCircleIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function KnowledgeBase({ onCreateNew, onKnowledgeBaseClick }) {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [knowledgeBaseToDelete, setKnowledgeBaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tags, setTags] = useState(['全部标签']);
  const [selectedTag, setSelectedTag] = useState('全部标签');
  const navigate = useNavigate();

  const handleDeleteClick = (kb) => {
    setKnowledgeBaseToDelete(kb);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (knowledgeBaseToDelete) {
      setIsDeleting(true);
      try {
        await axios.delete(`/console/api/knowledge-bases/${knowledgeBaseToDelete.id}`);
        setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== knowledgeBaseToDelete.id));
        showToast('知识库删除成功', 'success');
      } catch (error) {
        console.error('Error deleting knowledge base:', error);
        if (error.response && error.response.status === 403) {
          showToast('您没有权限删除此知识库', 'error');
        } else if (error.response && error.response.data && error.response.data.message) {
          showToast(error.response.data.message, 'error');
        } else {
          showToast('知识库删除失败', 'error');
        }
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setKnowledgeBaseToDelete(null);
      }
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  // Add this new useEffect for error handling
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const fetchKnowledgeBases = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const response = await axios.get('/console/api/knowledge-bases');
      setKnowledgeBases(response.data.data);
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      setError('知识库获取失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKnowledgeBase = () => {
    onCreateNew();
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

  const NewKnowledgeBaseCard = () => (
    <div
      className="bg-bg-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer group"
      onClick={handleCreateKnowledgeBase}
    >
      <div className="absolute inset-0 rounded-xl bg-primary opacity-5 group-hover:opacity-10 transition-all duration-300"></div>
      <div className="absolute inset-[1px] rounded-[11px] flex items-center p-6 z-10">
        <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-opacity-20 transition-all duration-300">
          <PlusIcon className="w-10 h-10 text-primary group-hover:text-primary-dark transition-all duration-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-body font-noto-sans-sc mb-2 group-hover:text-primary transition-all duration-300">创建知识库</h3>
          <p className="text-xs text-text-secondary font-noto-sans-sc group-hover:text-text-body transition-all duration-300">
            接入您的文本数据让AI更了解您。
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
    return distance.replace(/大约 /, '') // 移除"大约"字
      .replace(/ 天/, '天')
      .replace(/ 个?小时/, '小时')
      .replace(/ 分钟/, '分钟')
      .replace(/不到 /, ''); // 移除"不到"
  };

  const handleKnowledgeBaseClick = (kb) => {
    onKnowledgeBaseClick(kb.id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <NewKnowledgeBaseCard />
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
          <div className="text-danger font-semibold text-lg mb-2">获取知识库失败</div>
          <div className="text-danger-dark text-sm mb-4">{error}</div>
          <button
            onClick={fetchKnowledgeBases}
            className="px-4 py-2 bg-danger text-bg-primary rounded-md hover:bg-danger-dark transition-colors duration-200"
          >
            重试
          </button>
        </div>
      );
    }

    return (
      <>
        <NewKnowledgeBaseCard />
        {knowledgeBases.map((kb) => (
          <div
            key={kb.id}
            className="group bg-bg-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer"
            onClick={() => handleKnowledgeBaseClick(kb)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                    <BookOpenIcon className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-body font-noto-sans-sc mb-1">{kb.name}</h3>
                    <div className="flex items-center text-xs text-text-muted font-noto-sans-sc">
                      <span>{kb.document_count} 文档</span>
                      <span className="mx-1 text-text-muted">•</span>
                      <span>{kb.app_count} 智能体</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted font-noto-sans-sc">
                  {formatRelativeTime(kb.updated_at)}前更新
                </span>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between mt-auto border-t border-bg-secondary">
              <div className="flex items-center text-xs text-text-muted space-x-2 font-noto-sans-sc">
                {kb.tags && kb.tags.map((tag, index) => (
                  <span key={index} className="bg-bg-secondary text-text-secondary px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="text-text-muted hover:text-primary transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 添加设置按钮的处理逻辑
                    console.log('Settings clicked for', kb.name);
                  }}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(kb);
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
    <div className="bg-bg-secondary min-h-screen p-3 space-y-6">
      {/* Header */}
      <header className="bg-bg-primary rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-end space-x-4">
          <h2 className="text-lg font-bold text-primary font-noto-sans-sc">知识库</h2>
        </div>
        <div className="flex items-center space-x-4">
          <TagSelector tags={tags} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
          <SearchBox />
        </div>
      </header>

      {/* Content */}
      <div className="bg-bg-primary rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderContent()}
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="知识库"
        itemName={knowledgeBaseToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default KnowledgeBase;