import { AdjustmentsHorizontalIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { mdiFileDelimited, mdiFileDocumentOutline, mdiFileExcelBox, mdiFilePdfBox, mdiFileWordBox } from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';

function KnowledgeBaseDetail({ id, onBack }) {
  const { showToast } = useToast();
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    // Implement add document functionality
    showToast('添加文档功能待实现', 'info');
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

  if (isLoading) {
    return (
      <div className="flex pt-4">
        {/* Left sidebar skeleton */}
        <div className="w-60 pr-6 border-r border-gray-200">
          <div className="mb-10 mt-5 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-200 rounded-lg mr-3"></div>
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
        <div className="flex-1 pl-4">
          <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6">
            <div className="mb-10">
              <div className="h-6 bg-indigo-100 rounded w-1/4 mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-64 h-9 bg-indigo-50 rounded"></div>
              <div className="w-32 h-9 bg-indigo-200 rounded"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <th key={item} className="px-6 py-3">
                        <div className="h-4 bg-indigo-100 rounded"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row}>
                      {[1, 2, 3, 4, 5, 6].map((cell) => (
                        <td key={cell} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex pt-4">
      {/* Left sidebar */}
      <div className="w-60 pr-6 border-r border-gray-200">
        {/* Knowledge Base Icon and Title */}
        <div className="mb-10 mt-5">
          <div className="flex items-center">
            <FolderIcon className="w-10 h-10 text-indigo-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-800 font-noto-sans-sc truncate">
              {knowledgeBase?.name}
            </h1>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav>
          <ul className="space-y-2">
            <SidebarItem icon={DocumentTextIcon} text="文档" active />
            <SidebarItem icon={AdjustmentsHorizontalIcon} text="召回测试" />
            <SidebarItem icon={AdjustmentsHorizontalIcon} text="设置" />
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 pl-4">
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6">
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
          <div className="flex items-center justify-between mb-4">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["文件名", "字符数", "召回次数", "上传时间", "状态", "操作"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider font-noto-sans-sc">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockDocuments.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.name)}
                        <span className="ml-2 text-sm text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.characterCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.recallCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.status === '可用' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Add document-specific actions here */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, text, active = false }) {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center px-4 py-2 text-sm font-medium ${active
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
          } transition-colors duration-150`}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-noto-sans-sc">{text}</span>
      </a>
    </li>
  );
}

export default KnowledgeBaseDetail;