import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { mdiFileDelimited, mdiFileDocumentOutline, mdiFileExcelBox, mdiFilePdfBox, mdiFileWordBox } from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

function ProcessingStatus({ onBackToDocuments, knowledgeBaseId, fileIds }) {
    const [documents, setDocuments] = useState([]);
    const [isAllCompleted, setIsAllCompleted] = useState(false);
    const [hasFailures, setHasFailures] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let intervalId;

        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/console/api/knowledge-bases/${knowledgeBaseId}/documents/progress`, {
                    params: { file_ids: JSON.stringify(fileIds) }
                });
                setDocuments(response.data.documents);
                const allCompleted = response.data.documents.every(doc => 
                    doc.parse_status === 'completed' || doc.parse_status === 'failed'
                );
                const anyFailed = response.data.documents.some(doc => doc.parse_status === 'failed');
                setIsAllCompleted(allCompleted);
                setHasFailures(anyFailed);

                if (allCompleted) {
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
                setError('获取处理进度失败');
                clearInterval(intervalId);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAllCompleted && !error) {
            intervalId = setInterval(fetchProgress, 2000);
        }
        return () => clearInterval(intervalId);
    }, [knowledgeBaseId, fileIds, isAllCompleted, error]);

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const baseProps = { size: 1, className: "w-5 h-5 mr-2" };

        switch (extension) {
            case 'pdf':
                return <Icon path={mdiFilePdfBox} {...baseProps} className="w-5 h-5 mr-2 text-red-500" />;
            case 'doc':
            case 'docx':
                return <Icon path={mdiFileWordBox} {...baseProps} className="w-5 h-5 mr-2 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <Icon path={mdiFileExcelBox} {...baseProps} className="w-5 h-5 mr-2 text-green-500" />;
            case 'csv':
                return <Icon path={mdiFileDelimited} {...baseProps} className="w-5 h-5 mr-2 text-teal-500" />;
            default:
                return <Icon path={mdiFileDocumentOutline} {...baseProps} className="w-5 h-5 mr-2 text-gray-500" />;
        }
    };

    const getProgressColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-500';
            case 'processing':
                return 'bg-indigo-500';
            case 'completed':
                return 'bg-green-600';
            case 'failed':
                return 'bg-red-600';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading && documents.length === 0) {
        return (
            <div className="flex flex-col space-y-6 p-6 bg-white rounded-lg shadow">
                <div className="flex items-center space-x-2">
                    <Icon path={mdiFileDocumentOutline} size={1} className="text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-800">文档处理进度</h2>
                </div>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 p-6 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-2">
                <Icon path={mdiFileDocumentOutline} size={1} className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">文档处理进度</h2>
            </div>

            <p className="text-sm text-gray-600">
                处理完成后，您可以在知识库的文档列表中找到它们。
            </p>

            <div className="space-y-4">
                {documents.map((doc, index) => (
                    <div key={index} className={`p-4 rounded-lg ${getStatusBackgroundColor(doc.parse_status)} border ${getStatusBorderColor(doc.parse_status)}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2 flex items-center">
                                {getFileIcon(doc.name)}
                                {doc.name}
                            </span>
                            <span className={`text-sm font-semibold text-${getStatusTextColor(doc.parse_status)} whitespace-nowrap flex items-center`}>
                                {getStatusIcon(doc.parse_status)}
                                <span className="ml-1">{getStatusText(doc)}</span>
                            </span>
                        </div>
                        <div className="flex items-center mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 flex-grow mr-2">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${getProgressColor(doc.parse_status)} ${doc.parse_status === 'processing' ? 'animate-pulse' : ''}`}
                                    style={{ width: `${doc.parse_status === 'completed' ? 100 : doc.progress || 0}%` }} // Ensure 100% width for completed status
                                ></div>
                            </div>
                            <span className={`text-xs font-medium text-${getStatusTextColor(doc.parse_status)}`}>
                                {doc.parse_status === 'completed' ? 100 : doc.progress || 0}%
                            </span>
                        </div>
                        {doc.message && (
                            <div className="mt-2 text-xs">
                                <p className="text-gray-600">{doc.message}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {hasFailures && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">处理失败</h3>
                    <p className="text-sm text-yellow-700">
                        文档处理失败。请查看上方列表中每个文档的具体状态。
                        对于失败的文档，您可以：
                        1. 检查文件格式及内容是否正确
                        2. 尝试重新上传
                        3. 如果问题持续，请联系技术支持
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">处理出错</h3>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="flex justify-start mt-6">
                <button
                    onClick={onBackToDocuments}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    // Remove the disabled condition
                >
                    <span>前往文档</span>
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

// 获取背景颜色
function getStatusBackgroundColor(status) {
    switch (status) {
        case 'pending':
            return 'bg-gray-50';
        case 'processing':
            return 'bg-gray-100';
        case 'completed':
            return 'bg-green-50';
        case 'failed':
            return 'bg-red-50';
        default:
            return 'bg-gray-50';
    }
}

// 获取边框颜色
function getStatusBorderColor(status) {
    switch (status) {
        case 'pending':
            return 'border-gray-200';
        case 'processing':
            return 'border-indigo-200';
        case 'completed':
            return 'border-green-200';
        case 'failed':
            return 'border-red-200';
        default:
            return 'border-gray-200';
    }
}

// 获取图标
function getStatusIcon(status) {
    switch (status) {
        case 'pending':
            return <ExclamationCircleIcon className="h-4 w-4 text-gray-500 mr-1" />;
        case 'processing':
            return <ExclamationCircleIcon className="h-4 w-4 text-indigo-500 mr-1" />;
        case 'completed':
            return <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />;
        case 'failed':
            return <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-1" />;
        default:
            return <ExclamationCircleIcon className="h-4 w-4 text-gray-500 mr-1" />;
    }
}

// 修改 getStatusText 函数
function getStatusText(doc) {
    switch (doc.parse_status) {
        case 'pending':
            return '待处理';
        case 'processing':
            return '处理中';
        case 'completed':
            return '处理成功';
        case 'failed':
            return '处理失败';
        default:
            return doc.parse_status;
    }
}

// Add this new function
function getStatusTextColor(status) {
    switch (status) {
        case 'pending':
            return 'gray-500';
        case 'processing':
            return 'indigo-600';
        case 'completed':
            return 'green-600';
        case 'failed':
            return 'red-600';
        default:
            return 'gray-500';
    }
}

export default ProcessingStatus;