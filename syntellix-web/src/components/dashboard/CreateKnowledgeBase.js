import { ArrowLeftIcon, BookOpenIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArchiveBoxIcon, ArrowPathIcon, CloudIcon, DocumentTextIcon, ExclamationCircleIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/solid';
import {
    mdiFile,
    mdiFileDelimited,
    mdiFileDocumentOutline,
    mdiFileExcelBox,
    mdiFilePdfBox,
    mdiFileWordBox,
    mdiLanguageHtml5,
    mdiLanguageMarkdown,
    mdiFilePowerpointBox,
    mdiCodeJson,
    mdiEmail,
    mdiImage
} from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios'; // 确保已安装 axios
import React, { useRef, useState } from 'react';
import { useToast } from '../../components/Toast';

function CreateKnowledgeBase({ onBack, onCreated }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);
    const [showEmptyKBModal, setShowEmptyKBModal] = useState(false);
    const [kbName, setKbName] = useState('');
    const [kbNameError, setKbNameError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFiles = (uploadedFiles) => {
        const newValidFiles = [];
        const newErrors = [];
        const validTypes = ['txt', 'md', 'pdf', 'html', 'xlsx', 'xls', 'docx', 'csv', 'ppt', 'json', 'eml', 'jpg', 'jpeg', 'png', 'gif'];
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes

        Array.from(uploadedFiles).forEach(file => {
            const fileType = file.name.split('.').pop().toLowerCase();
            const isValidType = validTypes.includes(fileType);
            const isValidSize = file.size <= maxSize;

            if (!isValidType) {
                newErrors.push(`不支持的文件类型: ${file.name}`);
            } else if (!isValidSize) {
                newErrors.push(`文件大小超过15MB: ${file.name}`);
            } else {
                newValidFiles.push(file);
            }
        });

        setFiles(prevFiles => [
            ...prevFiles,
            ...newValidFiles.map(file => ({
                name: file.name,
                size: formatFileSize(file.size),
                file: file
            }))
        ]);
        setErrors(prevErrors => [...prevErrors, ...newErrors]);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
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
            case 'html':
                return <Icon path={mdiLanguageHtml5} {...baseProps} className="w-5 h-5 text-orange-500" />;
            case 'md':
                return <Icon path={mdiLanguageMarkdown} {...baseProps} className="w-5 h-5 text-purple-500" />;
            case 'ppt':
                return <Icon path={mdiFilePowerpointBox} {...baseProps} className="w-5 h-5 text-orange-500" />;
            case 'json':
                return <Icon path={mdiCodeJson} {...baseProps} className="w-5 h-5 text-yellow-500" />;
            case 'eml':
                return <Icon path={mdiEmail} {...baseProps} className="w-5 h-5 text-blue-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Icon path={mdiImage} {...baseProps} className="w-5 h-5 text-pink-500" />;
            default:
                return <Icon path={mdiFile} {...baseProps} className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleDeleteFile = (indexToDelete) => {
        setFiles(files.filter((_, index) => index !== indexToDelete));
    };

    const handleCreateEmptyKB = () => {
        setShowEmptyKBModal(true);
    };

    const handleCloseModal = () => {
        setShowEmptyKBModal(false);
        setKbName('');
        setKbNameError('');
    };

    const handleSubmitEmptyKB = async (e) => {
        e.preventDefault();
        if (!kbName.trim()) {
            setKbNameError('知库名称不能为空');
            return;
        }
        setIsLoading(true);
        setKbNameError(''); // Clear any previous errors
        try {
            const response = await axios.post('/console/api/knowledge-bases', { name: kbName.trim() });
            showToast('创建成功', 'success');
            onCreated(response.data);
            handleCloseModal();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setKbNameError(error.response.data.message);
            } else {
                showToast('创建知识库失败', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex pt-4 gap-6 px-6">
            {/* Left sidebar with consistent background */}
            <div className="bg-bg-primary rounded-lg shadow-sm p-6 w-64">
                <div className="mb-10 mt-5">
                    <div className="flex items-center mb-10 cursor-pointer group" onClick={onBack}>
                        <div className="w-8 h-8 bg-primary bg-opacity-90 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                            <ArrowLeftIcon className="w-5 h-5 text-text-body transition-colors duration-200 group-hover:text-primary" />
                        </div>
                        <span className="text-base font-semibold text-text-body font-sans-sc truncate">新建知识库</span>
                    </div>
                </div>
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-bg-secondary"></div>
                    <StepItem number={1} text="选数据源" active />
                    <StepItem number={2} text="文本切分" />
                    <StepItem number={3} text="处理完成" />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 space-y-6 bg-bg-primary rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-text-body font-sans-sc">选择数据源</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-medium">
                        <DataSourceButton icon={DocumentTextIcon} text="导入本地文件" active />
                        <DataSourceButton icon={CloudIcon} text="同步钉钉文档" developing />
                        <DataSourceButton icon={ArchiveBoxIcon} text="同步微盘文档" developing />
                        <DataSourceButton icon={BookOpenIcon} text="同步飞书文档" developing />
                        <DataSourceButton icon={PlusIcon} text="更多数据源" />
                    </div>
                </div>

                <div
                    className={`rounded-lg p-8 border-2 border-dashed transition-colors duration-200 cursor-pointer ${
                        dragActive ? 'border-primary bg-primary bg-opacity-5' : 'border-bg-secondary hover:border-primary'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <div className="text-center">
                        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-text-muted'}`} />
                        <p className="text-sm text-text-body mb-2 font-sans-sc">
                            点击或拖拽文件至此区域即可上传
                        </p>
                        <p className="text-xs text-text-muted font-sans-sc">
                            支持 TXT、MARKDOWN、PDF、HTML、XLSX、XLS、DOCX、CSV、PPT、JSON、EML、IMAGE，每个文件不超过 15MB
                        </p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                        multiple
                    />
                </div>

                {files.length > 0 && (
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="flex items-center text-sm text-text-body bg-bg-secondary bg-opacity-50 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:bg-bg-secondary hover:bg-opacity-70 transition-colors duration-200 group"
                            >
                                {getFileIcon(file.name)}
                                <div className="flex-1 ml-3 overflow-hidden">
                                    <div className="flex items-center">
                                        <span className="font-semibold truncate mr-2">{file.name}</span>
                                        <span className="text-text-muted text-xs whitespace-nowrap">{file.size}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteFile(index)}
                                    className="ml-2 text-text-muted hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {errors.length > 0 && (
                    <div className="bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-lg p-4 mt-4">
                        <div className="flex">
                            <ExclamationCircleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-danger">上传出现以下问题：</h3>
                                <div className="mt-2 text-sm text-danger text-opacity-90">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <button
                            className={`text-sm font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                                files.length > 0
                                    ? 'bg-primary hover:bg-primary-dark text-white'
                                    : 'bg-bg-secondary text-text-muted cursor-not-allowed'
                            }`}
                            disabled={files.length === 0}
                        >
                            <span className="font-sans-sc">下一步</span>
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <button
                            className="text-sm bg-white border border-primary text-text-body hover:bg-primary hover:bg-opacity-10 font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center transition-colors duration-200"
                            onClick={handleCreateEmptyKB}
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            <span className="font-sans-sc">创建一个空知识库</span>
                        </button>
                    </div>
                </div>

                {showEmptyKBModal && (
                    <div className="fixed inset-0 bg-text-secondary bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-6 border w-[450px] shadow-lg rounded-2xl bg-bg-primary bg-opacity-90">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-text-body font-sans-sc">创建空知识库</h3>
                                <button onClick={handleCloseModal} className="text-text-muted hover:text-text-secondary transition-colors duration-200">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-text-body mb-6 font-sans-sc">
                                空知识库中还没有文档，你可以在今后任何时候上传文档至该知识库。
                            </p>
                            <form onSubmit={handleSubmitEmptyKB} className="space-y-4">
                                <div>
                                    <label htmlFor="kbName" className="block text-sm font-medium text-text-body mb-1 font-sans-sc">知识库名称 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="kbName"
                                        value={kbName}
                                        onChange={(e) => setKbName(e.target.value)}
                                        placeholder="请输入知识库名称"
                                        className="w-full p-2 text-sm font-tech bg-bg-secondary border border-bg-secondary rounded-md text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    />
                                    {kbNameError && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                                            {kbNameError}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium bg-bg-secondary text-text-body rounded-md hover:bg-bg-secondary hover:bg-opacity-70 transition-colors duration-200 font-sans-sc"
                                        disabled={isLoading}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary hover:bg-opacity-80 transition-colors duration-200 font-sans-sc flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                                                创建中...
                                            </>
                                        ) : '创建'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DataSourceButton({ icon: Icon, text, active = false, developing = false }) {
    return (
        <div className="relative">
            <button
                className={`py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 w-full ${
                    active ? 'bg-primary bg-opacity-90 text-white' :
                    developing ? 'bg-bg-secondary text-text-muted cursor-not-allowed' :
                    'bg-bg-secondary text-text-body hover:bg-bg-tertiary'
                }`}
                disabled={developing}
            >
                <Icon className="w-6 h-6 mr-2" />
                <span className="font-sans-sc text-sm">{text}</span>
            </button>
            {developing && (
                <span className="absolute top-0 right-0 bg-info bg-opacity-20 text-info text-xs px-2 py-1 rounded-full transform translate-x-1/3 -translate-y-1/3">
                    待开发
                </span>
            )}
        </div>
    );
}

function StepItem({ number, text, active = false }) {
    return (
        <li className={`flex items-center ${active ? 'text-text-body' : 'text-text-muted'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${active ? 'bg-primary text-white font-semibold' : 'bg-bg-secondary'}`}>
                {number}
            </span>
            <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
        </li>
    );
}

export default CreateKnowledgeBase;
