import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, CheckIcon, CloudArrowUpIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
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
import axios from 'axios';
import React, { useRef, useState } from 'react';
import TextSplitting from './TextSplitting';
import ProcessingStatus from './ProcessingStatus';

function UploadFiles({ onUploadComplete, onBack, knowledgeBaseId }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentlyUploading, setCurrentlyUploading] = useState(null);
    const [deletingFiles, setDeletingFiles] = useState({});
    const fileInputRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [uploadedFileIds, setUploadedFileIds] = useState([]);

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

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
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
            setIsUploading(false);
            setCurrentlyUploading(null);
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            const uploadedFiles = files.filter(file => file.uploaded).map(file => file.result);
            setUploadedFiles(uploadedFiles);
            setCurrentStep(2);
            setCompletedSteps([...completedSteps, 1]);
        } else if (currentStep === 2) {
            setCurrentStep(3);
            setCompletedSteps([...completedSteps, 2]);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setCompletedSteps(completedSteps.slice(0, -1));
        }
    };

    const handleBackToDocuments = () => {
        if (onUploadComplete) {
            onUploadComplete(uploadedFiles);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        setDeletingFiles(prev => ({ ...prev, [indexToDelete]: true }));
        if (fileToDelete.result && fileToDelete.result.id) {
            try {
                await axios.delete(`/console/api/files/${fileToDelete.result.id}`);
                setFiles(files.filter((_, index) => index !== indexToDelete));
                // Update uploadedFileIds
                setUploadedFileIds(prevIds => prevIds.filter(id => id !== fileToDelete.result.id));
            } catch (error) {
                console.error('Error deleting file:', error);
                setErrors(prev => [...prev, `删除文件失败 ${fileToDelete.name}: ${error.response?.data?.message || error.message}`]);
            }
        } else {
            // If the file hasn't been uploaded to the server, just remove it from the local state
            setFiles(files.filter((_, index) => index !== indexToDelete));
        }
        setDeletingFiles(prev => ({ ...prev, [indexToDelete]: false }));
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

    return (
        <div className="flex gap-4 h-full">
            {/* Left sidebar */}
            <div className="bg-bg-primary rounded-lg shadow-sm p-6 w-64">
                <div className="mb-10 mt-5">
                    <div className="flex items-center mb-10 cursor-pointer group" onClick={onBack}>
                        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-opacity-20">
                            <ArrowLeftIcon className="w-5 h-5 text-primary transition-colors duration-200 group-hover:text-primary-dark" />
                        </div>
                        <span className="text-base font-semibold text-text-body font-sans-sc truncate">上传文件</span>
                    </div>
                </div>
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-bg-secondary"></div>
                    <StepItem number={1} text="选取文件" active={currentStep === 1} completed={completedSteps.includes(1)} />
                    <StepItem number={2} text="文本切分" active={currentStep === 2} completed={completedSteps.includes(2)} />
                    <StepItem number={3} text="处理完成" active={currentStep === 3} completed={completedSteps.includes(3)} />
                </ol>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col space-y-6 bg-bg-primary rounded-lg shadow-sm p-6">
                {currentStep === 1 && (
                    <>
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-text-body font-sans-sc">上传文本文件</h3>
                        </div>
                        <div
                            className={`bg-bg-secondary bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-lg p-8 border-2 border-dashed transition-colors duration-200 cursor-pointer ${
                                dragActive ? 'border-primary bg-primary bg-opacity-5' : 'border-bg-tertiary hover:border-primary'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={handleClick}
                        >
                            <div className="text-center">
                                <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-text-muted'}`} />
                                <p className="text-sm text-text-body mb-2 font-noto-sans-sc">
                                    点击或拖拽文件至此区域即可上传
                                </p>
                                <p className="text-xs text-text-muted font-noto-sans-sc">
                                    支持 TXT、MARKDOWN、PDF、HTML、XLSX、XLS、DOCX、CSV、PPT、JSON、EML、IMAGE，每个文件不超过 15MB
                                </p>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                            multiple
                        />
                        {files.length > 0 && (
                            <ul className="space-y-2">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-center text-sm text-text-body bg-bg-secondary bg-opacity-50 backdrop-blur-sm rounded-lg p-3 shadow-sm transition-colors duration-200 group ${
                                            file.uploaded ? 'bg-success bg-opacity-10' : (file.name === currentlyUploading ? 'bg-warning bg-opacity-10' : '')
                                        }`}
                                    >
                                        {getFileIcon(file.name)}
                                        <div className="flex-1 ml-3 overflow-hidden">
                                            <div className="flex items-center">
                                                <span className="font-semibold truncate mr-2">{file.name}</span>
                                                <span className="text-text-muted text-xs whitespace-nowrap">{file.size}</span>
                                            </div>
                                        </div>
                                        {file.uploaded && <CheckCircleIcon className="w-5 h-5 text-success" />}
                                        {file.name === currentlyUploading && (
                                            <ArrowPathIcon className="w-5 h-5 text-warning animate-spin" />
                                        )}
                                        {deletingFiles[index] ? (
                                            <ArrowPathIcon className="w-5 h-5 text-danger animate-spin ml-2" />
                                        ) : (
                                            <TrashIcon 
                                                className="w-5 h-5 text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2" 
                                                onClick={() => handleDeleteFile(index)}
                                            />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isUploading && (
                            <div className="w-full bg-bg-secondary rounded-full h-1.5 mt-2">
                                <div className="h-1.5 rounded-full transition-all duration-500 ease-in-out bg-primary" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
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
                    </>
                )}
                {currentStep === 2 && (
                    <TextSplitting 
                        onNextStep={handleNextStep} 
                        onPreviousStep={handlePreviousStep}
                        knowledgeBaseId={knowledgeBaseId}
                        fileIds={uploadedFileIds}
                    />
                )}
                {currentStep === 3 && (
                    <ProcessingStatus 
                        onBackToDocuments={handleBackToDocuments} 
                        onPreviousStep={handlePreviousStep}
                        knowledgeBaseId={knowledgeBaseId}
                        fileIds={uploadedFileIds}
                    />
                )}

                {/* Navigation buttons */}
                {currentStep === 1 && (
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleNextStep}
                            className={`text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                                files.length > 0 && files.every(file => file.uploaded)
                                    ? 'bg-primary hover:bg-primary-dark text-bg-primary'
                                    : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                            }`}
                            disabled={files.length === 0 || !files.every(file => file.uploaded)}
                        >
                            <span className="font-noto-sans-sc">下一步</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Modified StepItem component
function StepItem({ number, text, active = false, completed = false }) {
    return (
        <li className={`flex items-center ${active ? 'text-primary' : completed ? 'text-primary' : 'text-text-muted'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 z-10 ${
                active ? 'bg-primary bg-opacity-10 text-primary font-semibold' : 
                completed ? 'bg-primary bg-opacity-10 text-primary' : 'bg-bg-secondary'
            }`}>
                {completed ? (
                    <CheckIcon className="w-4 h-4" />
                ) : (
                    number
                )}
            </span>
            <span className={`font-noto-sans-sc text-sm ${active ? 'font-semibold' : ''}`}>{text}</span>
        </li>
    );
}

export default UploadFiles;