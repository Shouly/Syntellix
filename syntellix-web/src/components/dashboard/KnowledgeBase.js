import { Cog6ToothIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArchiveBoxIcon, BookOpenIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function KnowledgeBase({ onCreateKnowledgeBase }) {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [knowledgeBaseToDelete, setKnowledgeBaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Remove this function as it's no longer needed
  // const getRandomIcon = () => {
  //   const icons = [BookOpenIcon, ArchiveBoxIcon, DocumentTextIcon];
  //   return icons[Math.floor(Math.random() * icons.length)];
  // };

  const NewKnowledgeBaseCard = () => (
    <div
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer"
      onClick={onCreateKnowledgeBase}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 opacity-70 group-hover:from-indigo-100 group-hover:via-purple-100 group-hover:to-blue-100 group-hover:opacity-80 transition-all duration-300"></div>
      <div className="absolute inset-[1px] rounded-[11px] flex items-center p-6 z-10">
        <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-indigo-200 transition-all duration-300">
          <PlusIcon className="w-10 h-10 text-indigo-500 group-hover:text-indigo-600 transition-all duration-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-indigo-600 font-noto-sans-sc mb-2 group-hover:text-indigo-700 transition-all duration-300">创建知识库</h3>
          <p className="text-xs text-indigo-500 font-noto-sans-sc group-hover:text-indigo-600 transition-all duration-300">
            接入您的文本数据让AI更了解您。
          </p>
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white bg-opacity-60 rounded-xl shadow-md overflow-hidden flex flex-col justify-between h-48 relative animate-pulse">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-indigo-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-indigo-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-indigo-50">
        <div className="h-3 bg-indigo-100 rounded w-1/4"></div>
      </div>
    </div>
  );

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const distance = formatDistanceToNow(date, { locale: zhCN });
    return distance.replace(/约 /, '') // 移除"约"字
                   .replace(/ 天/, '天')
                   .replace(/ 个?小时/, '小时')
                   .replace(/ 分钟/, '分钟')
                   .replace(/不到 /, ''); // 移除"不到"
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
        <div className="col-span-full flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl p-6">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
          <div className="text-red-600 font-semibold text-lg mb-2">获取知识库失败</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={fetchKnowledgeBases}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200"
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
          <div key={kb.id} className="group bg-white bg-opacity-60 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 opacity-40 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-blue-300 group-hover:opacity-50 transition-all duration-300"></div>
            <div className="absolute inset-[1px] bg-white bg-opacity-60 rounded-[11px] flex flex-col justify-between z-10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <BookOpenIcon className="w-12 h-12 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 font-noto-sans-sc mb-1">{kb.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 font-noto-sans-sc">
                        <span>{kb.document_count} 文档</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span>{kb.app_count} 智能体</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-noto-sans-sc">
                    {formatRelativeTime(kb.updated_at)}前更新
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs text-gray-700 space-x-2 font-noto-sans-sc">
                  {kb.tags && kb.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="text-gray-400 hover:text-indigo-500 transition-colors duration-200">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(kb)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {renderContent()}
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