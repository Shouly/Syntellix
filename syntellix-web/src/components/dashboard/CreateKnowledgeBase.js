import { CloudArrowUpIcon, CodeBracketIcon, PhotoIcon, TableCellsIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArchiveBoxIcon, ArrowPathIcon, BookOpenIcon, CloudIcon, DocumentTextIcon, ExclamationCircleIcon, PlusIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (uploadedFiles) => {
        const newValidFiles = [];
        const newErrors = [];
        const validTypes = ['txt', 'md', 'pdf', 'html', 'xlsx', 'xls', 'docx', 'csv'];
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

    const openFileSelector = () => {
        fileInputRef.current.click();
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
            case 'doc':
            case 'docx':
                return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            case 'txt':
                return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
            case 'xls':
            case 'xlsx':
                return <TableCellsIcon className="w-5 h-5 text-green-500" />;
            case 'csv':
                return <TableCellsIcon className="w-5 h-5 text-teal-500" />;
            case 'html':
                return <CodeBracketIcon className="w-5 h-5 text-orange-500" />;
            case 'md':
                return <CodeBracketIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <PhotoIcon className="w-5 h-5 text-gray-500" />;
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
            setKbNameError('知识库名称不能为空');
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

    const handleBack = () => {
        onBack();
    };

    return (
        <div className="flex pt-4">
            {/* Redesigned left sidebar */}
            <div className="w-55 pr-6 border-r border-gray-200">
                <button
                    onClick={handleBack}
                    className="mb-10 text-gray-800 transition-colors duration-200 flex items-center group"
                >
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full mr-3 group-hover:bg-indigo-200 transition-colors duration-200">
                        <ArrowLeftIcon className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    </span>
                    <span className="font-noto-sans-sc text-lg font-semibold">知识库列表</span>
                </button>
                
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                    <StepItem number={1} text="选数据源" active />
                    <StepItem number={2} text="文本切分" />
                    <StepItem number={3} text="处理完成" />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 pl-8 space-y-6">
                <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm rounded-xl shadow-md p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700 font-noto-sans-sc">选择数据源</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-medium">
                        <DataSourceButton icon={DocumentTextIcon} text="导入本地文件" active />
                        <DataSourceButton icon={CloudIcon} text="同步钉钉文档" developing />
                        <DataSourceButton icon={ArchiveBoxIcon} text="同步微盘文档" developing />
                        <DataSourceButton icon={BookOpenIcon} text="同步飞书文档" developing />
                        <DataSourceButton icon={PlusIcon} text="更多数据源" />
                    </div>
                </div>

                <div
                    className={`bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm rounded-xl shadow-md p-8 border-2 border-dashed transition-colors duration-200 ${dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <p className="text-gray-600 mb-2 font-noto-sans-sc">
                            拖拽文件至此，或者 <span className="text-indigo-600 cursor-pointer hover:underline" onClick={openFileSelector}>选择文件</span>
                        </p>
                        <p className="text-xs text-gray-500 font-noto-sans-sc">
                            支持 TXT、MARKDOWN、PDF、HTML、XLSX、XLS、DOCX、CSV，每个文件不超过 15MB
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
                                className="flex items-center text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:bg-white/80 transition-colors duration-200 group"
                            >
                                {getFileIcon(file.name)}
                                <div className="flex-1 ml-3 overflow-hidden">
                                    <div className="flex items-center">
                                        <span className="font-semibold truncate mr-2">{file.name}</span>
                                        <span className="text-gray-600 text-xs whitespace-nowrap">{file.size}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteFile(index)}
                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <div className="flex">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">上传出现以下问题：</h3>
                                <div className="mt-2 text-sm text-red-700">
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
                            className={`font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${files.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            disabled={files.length === 0}
                        >
                            <span className="font-noto-sans-sc">下一步</span>
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-200"
                            onClick={handleCreateEmptyKB}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            <span className="font-noto-sans-sc">创建一个空知识库</span>
                        </button>
                    </div>
                </div>

                {showEmptyKBModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-2xl bg-white bg-opacity-90">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-indigo-700 font-noto-sans-sc">创建空知识库</h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-8 font-noto-sans-sc">
                                空知识库中还没有文档，你可以在今后任何时候上传文档至该知识库。
                            </p>
                            <form onSubmit={handleSubmitEmptyKB} className="space-y-6">
                                <div>
                                    <label htmlFor="kbName" className="block text-sm font-medium text-gray-700 mb-1 font-noto-sans-sc">知识库名称 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="kbName"
                                        value={kbName}
                                        onChange={(e) => setKbName(e.target.value)}
                                        placeholder="请输入知识库名称"
                                        className="w-full p-2 font-tech bg-gray-100 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                    />
                                    {kbNameError && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center">
                                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                            {kbNameError}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-8 py-2 font-base bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 font-noto-sans-sc"
                                        disabled={isLoading}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2 font-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-noto-sans-sc flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
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
                className={`py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 w-full ${active ? 'bg-indigo-50 text-indigo-700' :
                    developing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                disabled={developing}
            >
                <Icon className="w-6 h-6 mr-2" />
                <span className="font-noto-sans-sc text-sm">{text}</span>
            </button>
            {developing && (
                <span className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full transform translate-x-1/3 -translate-y-1/3">
                    待开发
                </span>
            )}
        </div>
    );
}

function StepItem({ number, text, active = false }) {
    return (
        <li className={`flex items-center ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${active ? 'bg-indigo-100 text-indigo-600 font-semibold' : 'bg-gray-100'}`}>
                {number}
            </span>
            <span className={`font-noto-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
        </li>
    );
}

export default CreateKnowledgeBase;
