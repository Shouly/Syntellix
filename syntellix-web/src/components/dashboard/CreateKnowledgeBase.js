import { ArrowLeftIcon, BookOpenIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArchiveBoxIcon, ArrowPathIcon, CheckCircleIcon, CloudIcon, DocumentTextIcon, ExclamationCircleIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/solid';
import {
    mdiCodeJson,
    mdiEmail,
    mdiFile,
    mdiFileDelimited,
    mdiFileDocumentOutline,
    mdiFileExcelBox,
    mdiFilePdfBox,
    mdiFilePowerpointBox,
    mdiFileWordBox,
    mdiImage,
    mdiLanguageHtml5,
    mdiLanguageMarkdown
} from '@mdi/js';
import Icon from '@mdi/react';
import axios from 'axios'; // 确保已安装 axios
import React, { useRef, useState } from 'react';
import InfoIcon from '../../components/InfoIcon';
import { useToast } from '../../components/Toast';
import TextSplitting from './TextSplitting';
import ProcessingStatus from './ProcessingStatus';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';

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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentlyUploading, setCurrentlyUploading] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFileIds, setUploadedFileIds] = useState([]);
    const [knowledgeBaseId, setKnowledgeBaseId] = useState(null);
    const [showKnowledgeBaseDetail, setShowKnowledgeBaseDetail] = useState(false);

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

    const handleFiles = async (uploadedFiles) => {
        const newValidFiles = [];
        const newErrors = [];
        const validTypes = ['txt', 'md', 'pdf', 'html', 'xlsx', 'xls', 'docx', 'csv', 'ppt', 'json', 'eml', 'jpg', 'jpeg', 'png', 'gif'];
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes

        for (let file of Array.from(uploadedFiles)) {
            const fileType = file.name.split('.').pop().toLowerCase();
            const isValidType = validTypes.includes(fileType);
            const isValidSize = file.size <= maxSize;

            if (!isValidType) {
                newErrors.push(`不支持的文件类型: ${file.name}`);
            } else if (!isValidSize) {
                newErrors.push(`文件大小超过15MB: ${file.name}`);
            } else {
                newValidFiles.push({
                    name: file.name,
                    size: formatFileSize(file.size),
                    file: file
                });
            }
        }

        setErrors(prevErrors => [...prevErrors, ...newErrors]);

        for (let file of newValidFiles) {
            setCurrentlyUploading(file.name);
            setIsUploading(true);
            try {
                const result = await uploadSingleFile(file);
                setFiles(prevFiles => [...prevFiles, { ...file, uploaded: true, result }]);
                setUploadedFileIds(prevIds => [...prevIds, result.id]);
            } catch (error) {
                setErrors(prev => [...prev, `上传文件失败 ${file.name}: ${error.response?.data?.message || error.message}`]);
                setFiles(prevFiles => [...prevFiles, { ...file, uploaded: false }]);
            }
            setCurrentlyUploading(null);
        }
        setIsUploading(false);
    };

    const uploadSingleFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file.file);

        try {
            const response = await axios.post('/console/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            console.log('File uploaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
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

    const handleDeleteFile = async (indexToDelete) => {
        const fileToDelete = files[indexToDelete];
        if (fileToDelete.result && fileToDelete.result.id) {
            try {
                await axios.delete(`/console/api/files/${fileToDelete.result.id}`);
                setFiles(files.filter((_, index) => index !== indexToDelete));
                setUploadedFileIds(prevIds => prevIds.filter(id => id !== fileToDelete.result.id));
            } catch (error) {
                console.error('Error deleting file:', error);
                setErrors(prev => [...prev, `删除文件失败 ${fileToDelete.name}: ${error.response?.data?.message || error.message}`]);
            }
        } else {
            setFiles(files.filter((_, index) => index !== indexToDelete));
        }
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

    const handleNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const handleProcessingComplete = (newKnowledgeBaseId, fileIds) => {
        setKnowledgeBaseId(newKnowledgeBaseId);
        setUploadedFileIds(fileIds);
        setCurrentStep(3);
    };

    const handleBackToDocuments = () => {
        setShowKnowledgeBaseDetail(true);
    };

    if (showKnowledgeBaseDetail) {
        return (
            <KnowledgeBaseDetail 
                id={knowledgeBaseId} 
                onBack={() => {
                    setShowKnowledgeBaseDetail(false);
                    onCreated();
                }}
            />
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left sidebar */}
            <div className="w-64 bg-bg-primary p-6 overflow-y-auto border-r border-bg-tertiary">
                <div className="mb-8">
                    <div className="flex items-center mb-6 cursor-pointer group" onClick={onBack}>
                        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                            <ArrowLeftIcon className="w-5 h-5 text-primary transition-colors duration-200 group-hover:text-opacity-80" />
                        </div>
                        <span className="text-base font-semibold text-primary font-sans-sc truncate">新建知识库</span>
                    </div>
                </div>
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-bg-tertiary"></div>
                    <StepItem number={1} text="选数据源" active={currentStep === 1} completed={currentStep > 1} />
                    <StepItem number={2} text="文本切分" active={currentStep === 2} completed={currentStep > 2} />
                    <StepItem number={3} text="处理完成" active={currentStep === 3} />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto bg-bg-primary p-6 px-12">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center mb-6">
                            <h3 className="text-lg font-semibold text-text-body font-sans-sc">选择数据源</h3>
                        </div>
                        <p className="text-sm text-text-secondary font-sans-sc -mt-1">
                            选择您要导入到知识库的数据源。
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-medium">
                            <DataSourceButton icon={DocumentTextIcon} text="导入本地文件" active />
                            <DataSourceButton icon={CloudIcon} text="同步钉钉文档" developing />
                            <DataSourceButton icon={ArchiveBoxIcon} text="同步微盘文档" developing />
                            <DataSourceButton icon={BookOpenIcon} text="同步飞书文档" developing />
                            <DataSourceButton icon={PlusIcon} text="更多数据源" />
                        </div>

                        <div
                            className={`rounded-lg p-8 border-2 border-dashed transition-colors duration-200 cursor-pointer ${dragActive ? 'border-primary bg-primary bg-opacity-5' : 'border-bg-secondary hover:border-primary'
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

                        <div className="space-y-4">
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
                                            <div className="flex items-center space-x-2">
                                                {file.uploaded ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-success" />
                                                ) : file.name === currentlyUploading ? (
                                                    <ArrowPathIcon className="w-5 h-5 text-warning animate-spin" />
                                                ) : (
                                                    <div className="w-5 h-5" />
                                                )}
                                                <XCircleIcon 
                                                    className="w-5 h-5 text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                                                    onClick={() => handleDeleteFile(index)}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {isUploading && (
                                <div className="w-full bg-bg-secondary rounded-full h-1.5">
                                    <div 
                                        className="h-1.5 rounded-full transition-all duration-500 ease-in-out bg-primary" 
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
                        </div>

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
                                    onClick={handleNextStep}
                                    className={`text-sm font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                                        files.length > 0 && files.every(file => file.uploaded)
                                            ? 'bg-primary hover:bg-opacity-80 text-white'
                                            : 'bg-bg-secondary text-text-muted cursor-not-allowed'
                                    }`}
                                    disabled={files.length === 0 || !files.every(file => file.uploaded)}
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
                    </div>
                )}
                {currentStep === 2 && (
                    <TextSplitting 
                        onNextStep={handleProcessingComplete}
                        onPreviousStep={handlePreviousStep}
                        knowledgeBaseId={knowledgeBaseId}
                        fileIds={uploadedFileIds}
                    />
                )}
                {currentStep === 3 && (
                    <ProcessingStatus 
                        onBackToDocuments={handleBackToDocuments}
                        knowledgeBaseId={knowledgeBaseId}
                        fileIds={uploadedFileIds}
                    />
                )}
            </div>

            {showEmptyKBModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative mx-auto p-8 border w-[480px] shadow-xl rounded-2xl bg-bg-primary">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-text-body font-sans-sc">创建空知识库</h3>
                            <button onClick={handleCloseModal} className="text-text-muted hover:text-text-body transition-colors duration-200">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className="text-sm text-text-secondary mb-8 font-sans-sc">
                            空知识库中还没有文档，你可以在今后任何时候上传文档至该知识库。
                        </p>
                        <form onSubmit={handleSubmitEmptyKB} className="space-y-6">
                            <div>
                                <label htmlFor="kbName" className="block text-sm font-medium text-text-body mb-2 font-sans-sc flex items-center">
                                    知识库名称 <span className="text-red-500 ml-1">*</span>
                                    <InfoIcon tooltip="为您的知识库起一个独特的名称，方便识别和管理。" className="ml-2" />
                                </label>
                                <input
                                    type="text"
                                    id="kbName"
                                    value={kbName}
                                    onChange={(e) => setKbName(e.target.value)}
                                    placeholder="请输入知识库名称"
                                    className="w-full p-3 text-sm font-tech bg-bg-secondary border border-bg-tertiary rounded-lg text-text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                                {kbNameError && (
                                    <p className="mt-2 text-sm text-red-500 flex items-center">
                                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                                        {kbNameError}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-sm font-medium bg-bg-secondary text-text-body rounded-lg hover:bg-bg-tertiary transition-colors duration-200 font-sans-sc"
                                    disabled={isLoading}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-sans-sc flex items-center justify-center"
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
    );
}

function StepItem({ number, text, active = false, completed = false }) {
    return (
        <li className={`flex items-center ${active ? 'text-primary' : completed ? 'text-primary' : 'text-text-muted'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${
                active ? 'bg-primary bg-opacity-10 text-primary font-semibold' : 
                completed ? 'bg-primary bg-opacity-10 text-primary' : 'bg-bg-secondary'
            }`}>
                {completed ? (
                    <CheckCircleIcon className="w-4 h-4" />
                ) : (
                    number
                )}
            </span>
            <span className={`font-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
        </li>
    );
}

function DataSourceButton({ icon: Icon, text, active = false, developing = false }) {
    return (
        <div className="relative">
            <button
                className={`py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 w-full ${active ? 'bg-primary bg-opacity-90 text-white' :
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

export default CreateKnowledgeBase;
