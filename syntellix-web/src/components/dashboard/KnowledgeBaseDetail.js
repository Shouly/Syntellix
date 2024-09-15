import { Menu, Transition } from '@headlessui/react';
import { AdjustmentsHorizontalIcon, AdjustmentsHorizontalIcon as AdjustmentsHorizontalIconOutline, ArrowLeftIcon, Cog6ToothIcon, DocumentTextIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/solid';
import { mdiFileDelimited, mdiFileDocumentOutline, mdiFileExcelBox, mdiFilePdfBox, mdiFileWordBox } from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios';
import React, { Fragment, useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import UploadFiles from './UploadFiles';

function KnowledgeBaseDetail({ id, onBack }) {
  const { showToast } = useToast();
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Mock data for documents
  const mockDocuments = [
    { name: '产品说明书.pdf', characterCount: 15000, recallCount: 23, uploadTime: '2023-05-15 14:30', status: '可用' },
    { name: '用户反馈汇总.xlsx', characterCount: 8000, recallCount: 12, uploadTime: '2023-05-16 09:45', status: '可用' },
  ];

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
      showToast('获取知识库详情失败', 'error');
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mockDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(mockDocuments.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex pt-4 h-full">
        {/* Left sidebar skeleton */}
        <div className="w-58 pr-6 border-r border-gray-200">
          <div className="mb-10 mt-5 animate-pulse">
            <div className="flex items-center mb-10">
              <div className="w-8 h-8 bg-indigo-100 rounded-full mr-3"></div>
              <div className="h-6 bg-indigo-100 rounded w-3/4"></div>
            </div>
          </div>
          <nav>
            <ul className="space-y-2">
              {[1, 2, 3].map((item) => (
                <li key={item} className="flex items-center px-4 py-2">
                  <div className="w-5 h-5 bg-indigo-100 rounded mr-3"></div>
                  <div className="h-4 bg-indigo-50 rounded w-3/4"></div>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content area skeleton */}
        <div className="flex-1 pl-4 flex flex-col h-full">
          <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 flex flex-col h-full">
            <div className="mb-10">
              <div className="h-6 bg-indigo-100 rounded w-1/4 mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-64 h-9 bg-indigo-50 rounded"></div>
              <div className="w-32 h-9 bg-indigo-200 rounded"></div>
            </div>
            <div className="overflow-x-auto flex-grow" style={{ minHeight: '400px' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <th key={item} className="px-4 py-3">
                        <div className="h-4 bg-indigo-100 rounded"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row}>
                      {[1, 2, 3, 4, 5, 6].map((cell) => (
                        <td key={cell} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination skeleton */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="w-1/3 h-4 bg-gray-100 rounded"></div>
                <div className="w-1/4 h-8 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (isUploadingFiles) {
    return (
      <UploadFiles
        onBack={() => setIsUploadingFiles(false)}
        onUploadComplete={() => {
          setIsUploadingFiles(false);
          fetchKnowledgeBaseDetails();
        }}
      />
    );
  }

  return (
    <div className="flex pt-4 h-full">
      {/* Left sidebar */}
      <div className="w-58 pr-6 border-r border-gray-200">
        {/* Knowledge Base Icon and Title */}
        <div className="mb-10 mt-5">
          <div className="flex items-center mb-10 cursor-pointer group" onClick={handleBack}>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-indigo-200">
              <ArrowLeftIcon className="w-5 h-5 text-indigo-600 transition-colors duration-200 group-hover:text-indigo-700" />
            </div>
            <h1 className="text-base font-semibold text-gray-800 font-noto-sans-sc truncate">
              {knowledgeBase?.name}
            </h1>
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
      <div className="flex-1 pl-4 flex flex-col h-full">
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 flex flex-col h-full">
          {/* Breadcrumb navigation and description */}
          <div className="mb-10">
            <nav className="text-lg font-semibold text-gray-800 font-noto-sans-sc mb-1">
              <span>文档</span>
            </nav>
            <p className="text-xs text-gray-500 font-noto-sans-sc">
              知识库的所有文件都在这里显示，整个知识库文档都可以被AI智能体引用。
            </p>
          </div>

          {/* Search and Add Document */}
          <div className="flex items-center justify-between m b-4">
            <div className="w-64 mr-4">
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={handleAddDocument}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors duration-200 text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              <span className="font-noto-sans-sc">添加文件</span>
            </button>
          </div>

          {/* Document List */}
          <div className="overflow-x-auto flex-grow" style={{ minHeight: '400px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {["文件名", "字符数", "召回次数", "上传时间", "状态", "操作"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-noto-sans-sc">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.name)}
                        <span className="ml-2 text-sm text-gray-900 font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.characterCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.recallCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.uploadTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.status === '可用' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {doc.status}
                      </span>
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

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{indexOfFirstItem + 1}</span> 到第{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, mockDocuments.length)}</span> 条，
                  共 <span className="font-medium">{mockDocuments.length}</span> 条结果
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">上一页</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {/* Add page numbers here if needed */}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">下一页</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, text, active = false }) {
  return (
    <li className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
      }`}>
      <Icon className={`w-5 h-5 mr-3 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
      <span className={`font-noto-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
    </li>
  );
}

export default KnowledgeBaseDetail;