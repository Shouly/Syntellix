import { Menu, Transition } from '@headlessui/react';
import { AdjustmentsHorizontalIcon, AdjustmentsHorizontalIcon as AdjustmentsHorizontalIconOutline, ArrowLeftIcon, Cog6ToothIcon, DocumentTextIcon, ExclamationCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/solid';
import { mdiFileDelimited, mdiFileDocumentOutline, mdiFileExcelBox, mdiFilePdfBox, mdiFileWordBox } from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios';
import React, { Fragment, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useToast } from '../../components/Toast';
import UploadFiles from './UploadFiles';

// 在表格中展示的列
const columns = [
  { header: '文档名称', key: 'name' },
  { header: '大小', key: 'size' },
  { header: '块数', key: 'chunk_num' },
  { header: '解析进度', key: 'progress' },
  { header: '解析状态', key: 'parse_status' },
  { header: '上传时间', key: 'created_at' },
];

function KnowledgeBaseDetail({ id, onBack }) {
  const { showToast } = useToast();
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const { data: documentsData, isLoading: isDocumentsLoading, error: documentsError } = useQuery(
    ['knowledgeBaseDocuments', id, currentPage, itemsPerPage, searchTerm],
    () => fetchDocuments(),
    { keepPreviousData: true }
  );

  const fetchDocuments = async () => {
    const response = await axios.get(`/console/api/knowledge-bases/${id}/documents`, {
      params: {
        page: currentPage,
        limit: itemsPerPage,
        keyword: searchTerm,
      },
    });
    return response.data;
  };

  useEffect(() => {
    fetchKnowledgeBaseDetails();
  }, [id]);

  const fetchKnowledgeBaseDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/console/api/knowledge-bases/${id}`);
      setKnowledgeBase(response.data);
    } catch (error) {
      console.error('Error fetching knowledge base details:', error);
      setError('获取知识库详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  const handleAddDocument = () => {
    setIsUploadingFiles(true);
  };

  const handleEditKnowledgeBase = () => {
    // Implement edit knowledge base functionality
    showToast('编辑知识库功能待实现', 'info');
  };

  const handleDeleteKnowledgeBase = () => {
    // Implement delete knowledge base functionality
    showToast('删除知识库功能待实现', 'info');
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const baseProps = { size: 1, className: "w-5 h-5" };

    switch (extension) {
      case 'pdf':
        return <Icon path={mdiFilePdfBox} {...baseProps} className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <Icon path={mdiFileWordBox} {...baseProps} className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <Icon path={mdiFileDocumentOutline} {...baseProps} className="w-5 h-5 text-gray-500" />;
      case 'xls':
      case 'xlsx':
        return <Icon path={mdiFileExcelBox} {...baseProps} className="w-5 h-5 text-green-500" />;
      case 'csv':
        return <Icon path={mdiFileDelimited} {...baseProps} className="w-5 h-5 text-teal-500" />;
      default:
        return <Icon path={mdiFileDocumentOutline} {...baseProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化进度百分比
  const formatProgress = (progress) => {
    return `${(progress).toFixed(2)}%`;
  };

  // 格式化解析状态
  const formatParseStatus = (status) => {
    const statusMap = {
      'pending': '待处理',
      'processing': '处理中',
      'completed': '已完成',
      'failed': '失败'
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || isDocumentsLoading) {
    return (
      <div className="flex h-full overflow-hidden">
        {/* Left sidebar skeleton */}
        <div className="w-64 bg-bg-primary p-6 overflow-y-auto border-r border-bg-tertiary">
          <div className="mb-8 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full mr-3"></div>
              <div className="h-6 bg-primary bg-opacity-20 rounded w-3/4"></div>
            </div>
          </div>
          <nav>
            <ul className="space-y-4">
              {[1, 2, 3].map((item) => (
                <li key={item} className="flex items-center py-2 px-3 rounded-lg">
                  <div className="w-5 h-5 bg-primary bg-opacity-20 rounded mr-3"></div>
                  <div className="h-4 bg-primary bg-opacity-10 rounded w-3/4"></div>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content area skeleton */}
        <div className="flex-1 overflow-y-auto bg-bg-primary p-6 px-12">
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-primary bg-opacity-20 rounded w-1/4"></div>
            <div className="h-4 bg-primary bg-opacity-10 rounded w-3/4"></div>
          </div>

          <div className="flex items-center justify-between mb-4 mt-6">
            <div className="w-64 h-9 bg-bg-secondary rounded"></div>
            <div className="w-32 h-9 bg-primary bg-opacity-20 rounded"></div>
          </div>

          <div className="bg-white bg-opacity-90 rounded-lg shadow-sm overflow-hidden mt-4" style={{ minHeight: '400px' }}>
            <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                      <th key={item} className="px-4 py-3">
                        <div className="h-4 bg-primary bg-opacity-10 rounded"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="animate-pulse">
                      {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                        <td key={cell} className="px-4 py-3">
                          <div className="h-4 bg-primary bg-opacity-5 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination skeleton */}
          <div className="mt-4 flex items-center justify-between">
            <div className="w-1/3 h-4 bg-primary bg-opacity-10 rounded"></div>
            <div className="w-1/4 h-8 bg-primary bg-opacity-10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || documentsError) {
    return (
      <div className="flex-1 px-6 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-full flex flex-col items-center justify-center h-64 bg-red-50 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl p-6">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
            <div className="text-red-600 font-semibold text-lg mb-2">获取知识库详情失败</div>
            <div className="text-red-500 text-sm mb-4">{error || documentsError}</div>
            <button
              onClick={fetchKnowledgeBaseDetails}
              className="px-4 py-2 bg-red-100 bg-opacity-50 text-red-600 rounded-md hover:bg-opacity-70 transition-colors duration-200"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isUploadingFiles) {
    return (
      <UploadFiles
        onBack={() => setIsUploadingFiles(false)}
        onUploadComplete={() => {
          setIsUploadingFiles(false);
          fetchKnowledgeBaseDetails();
        }}
        knowledgeBaseId={id}
      />
    );
  }

  const documents = documentsData?.data || [];
  const totalDocuments = documentsData?.total || 0;
  const totalPages = Math.ceil(totalDocuments / itemsPerPage);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 bg-bg-primary p-6 overflow-y-auto border-r border-bg-tertiary">
        <div className="mb-8">
          <div className="flex items-center mb-6 cursor-pointer group" onClick={onBack}>
            <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
              <ArrowLeftIcon className="w-5 h-5 text-primary transition-colors duration-200 group-hover:text-opacity-80" />
            </div>
            <span className="text-base font-semibold text-primary font-sans-sc truncate">
              {knowledgeBase?.name}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav>
          <ul className="space-y-4">
            <SidebarItem icon={DocumentTextIcon} text="文档" active />
            <SidebarItem icon={AdjustmentsHorizontalIcon} text="召回测试" />
            <SidebarItem icon={Cog6ToothIcon} text="设置" />
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto bg-bg-primary p-6 px-12">
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <h3 className="text-lg font-semibold text-text-body font-sans-sc">文档</h3>
          </div>
          <p className="text-sm text-text-secondary font-sans-sc -mt-1">
            知识库的所有文件都在这里显示，整个知识库文档都可以被AI智能体引用。
          </p>
        </div>

        {/* Search and Add Document */}
        <div className="flex items-center justify-between mb-4 mt-6">
          <div className="w-64 mr-4">
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            onClick={handleAddDocument}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-opacity-80 transition-colors duration-200 font-sans-sc flex items-center justify-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>添加文件</span>
          </button>
        </div>

        {/* Document List */}
        <div className="bg-white bg-opacity-90 rounded-lg shadow-sm overflow-hidden mt-4" style={{ minHeight: '400px' }}>
          <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.name)}
                        <span className="ml-2 text-sm text-gray-900 font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.size)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.chunk_num}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatProgress(doc.progress)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(doc.parse_status)}`}>
                        {formatParseStatus(doc.parse_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                      } group flex w-full items-center px-3 py-2 text-sm font-medium font-noto-sans-sc`}
                                  >
                                    <PencilIcon className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                                    重命名
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                      } group flex w-full items-center px-3 py-2 text-sm font-medium font-noto-sans-sc`}
                                  >
                                    <AdjustmentsHorizontalIconOutline className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
                                    分段设置
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                      } group flex w-full items-center px-3 py-2 text-sm font-medium font-noto-sans-sc`}
                                  >
                                    <TrashIcon className="mr-2 h-4 w-4 text-red-500" aria-hidden="true" />
                                    删除
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              显示第 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到第{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocuments)}</span> 条，
              共 <span className="font-medium">{totalDocuments}</span> 条结果
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">上一页</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">下一页</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, text, active = false }) {
  return (
    <li className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${active ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body hover:bg-bg-secondary'
      }`}>
      <Icon className={`w-5 h-5 mr-3 ${active ? 'text-primary' : 'text-text-muted'}`} />
      <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
    </li>
  );
}

export default KnowledgeBaseDetail;