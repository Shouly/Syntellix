import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ChevronDownIcon, FunnelIcon, Cog6ToothIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CircleStackIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import axios from 'axios';
import { useToast } from '../../components/Toast';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function Database() {
  const [searchTerm, setSearchTerm] = useState('');
  const [databases, setDatabases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tags, setTags] = useState(['全部标签']);
  const [selectedTag, setSelectedTag] = useState('全部标签');

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const fetchDatabases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Replace this with your actual API call
      const response = await axios.get('/console/api/databases');
      setDatabases(response.data.data);
    } catch (error) {
      console.error('Error fetching databases:', error);
      setError('数据库获取失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const distance = formatDistanceToNow(date, { locale: zhCN });
    return distance.replace(/大约 /, '')
      .replace(/ 天/, '天')
      .replace(/ 个?小时/, '小时')
      .replace(/ 分钟/, '分钟')
      .replace(/不到 /, '');
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


  const NewDatabaseCard = () => (
    <div
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer group"
      onClick={() => {/* Handle new database creation */}}
    >
      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-all duration-300 rounded-xl"></div>
      <div className="absolute inset-[1px] rounded-[11px] flex items-center p-6 z-10">
        <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-opacity-20 transition-all duration-300">
          <PlusIcon className="w-10 h-10 text-primary group-hover:text-primary-dark transition-all duration-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-primary font-noto-sans-sc mb-2 group-hover:text-primary-dark transition-all duration-300">创建数据库</h3>
          <p className="text-xs text-text-secondary font-noto-sans-sc group-hover:text-text-body transition-all duration-300">
            创建新的数据库以存储和管理您的数据。
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
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <NewDatabaseCard />
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </>
      );
    }

    if (error) {
      // ... existing error rendering
    }

    return (
      <>
        <NewDatabaseCard />
        {databases.map((db) => (
          <div
            key={db.id}
            className="group bg-gradient-to-br from-bg-primary to-bg-secondary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-48 relative cursor-pointer"
            onClick={() => {/* Handle database click */}}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-3">
                    <CircleStackIcon className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-body font-noto-sans-sc mb-1">{db.name}</h3>
                    <div className="flex items-center text-xs text-text-muted font-noto-sans-sc">
                      <span>{db.tables} 数据表</span>
                      <span className="mx-1 text-text-muted">•</span>
                      <span>{db.applications} 个关联应用</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted font-noto-sans-sc">
                  {formatRelativeTime(db.updated_at)}前更新
                </span>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between mt-auto border-t border-bg-secondary">
              <div className="flex items-center text-xs text-text-muted space-x-2 font-noto-sans-sc">
                {db.tags && db.tags.map((tag, index) => (
                  <span key={index} className="bg-bg-secondary text-text-secondary px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="text-text-muted hover:text-primary transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add settings button logic
                    console.log('Settings clicked for', db.name);
                  }}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
    <div className="h-full flex flex-col px-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-end space-x-4">
          <h2 className="text-lg font-bold text-primary font-noto-sans-sc">数据库</h2>
        </div>
        <div className="flex items-center space-x-4">
          <TagSelector tags={tags} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
          <div className="relative">
            <input
              type="text"
              placeholder="搜索数据库名称"
              className="pl-10 pr-4 py-2 text-sm bg-bg-secondary rounded-md border border-bg-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {renderContent()}
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        itemType="数据库"
        itemName={databaseToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Database;