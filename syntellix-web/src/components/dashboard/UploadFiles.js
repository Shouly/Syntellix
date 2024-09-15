import { BookOpenIcon, CloudArrowUpIcon, ExclamationCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
    mdiFile,
    mdiFileDelimited,
    mdiFileDocumentOutline,
    mdiFileExcelBox,
    mdiFilePdfBox,
    mdiFileWordBox,
    mdiLanguageHtml5,
    mdiLanguageMarkdown
} from '@mdi/js';
import Icon from '@mdi/react';
import React, { useRef, useState } from 'react';

function UploadFiles({ onUploadComplete, onBack }) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

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
            default:
                return <Icon path={mdiFile} {...baseProps} className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleDeleteFile = (indexToDelete) => {
        setFiles(files.filter((_, index) => index !== indexToDelete));
    };

    const handleUpload = async () => {
        // 实现文件上传逻辑
        // 上传完成后调用 onUploadComplete
        onUploadComplete();
    };

    return (
        <div className="flex pt-4">
            {/* 左侧菜单栏 */}
            <div className="w-58 pr-6 border-r border-gray-200">
                <div className="mb-10 mt-5">
                    <div className="flex items-center mb-10 cursor-pointer group">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 group-hover:bg-indigo-200" onClick={onBack}>
                            <ArrowLeftIcon className="w-5 h-5 text-indigo-600 transition-colors duration-200 group-hover:text-indigo-700" />
                        </div>
                        <span className="text-base font-semibold text-gray-800 font-noto-sans-sc truncate">上传文件</span>
                    </div>
                </div>
                <ol className="space-y-4 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                    <StepItem number={1} text="选取文件" active />
                    <StepItem number={2} text="文本切分" />
                    <StepItem number={3} text="处理完成" />
                </ol>
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 pl-8 space-y-6">
                <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 font-noto-sans-sc">上传文本文件</h3>
                    <div
                        className={`bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg p-8 border-2 border-dashed transition-colors duration-200 cursor-pointer ${
                            dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={handleClick}
                    >
                        <div className="text-center">
                            <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                            <p className="text-gray-600 mb-2 font-noto-sans-sc">
                                点击或拖拽文件至此区域即可上传
                            </p>
                            <p className="text-xs text-gray-500 font-noto-sans-sc">
                                支持 TXT、MARKDOWN、PDF、HTML、XLSX、XLS、DOCX、CSV，每个文件不超过 15MB
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
                            className={`text-sm font-semibold py-2.5 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                                files.length > 0
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={files.length === 0}
                            onClick={handleUpload}
                        >
                            <span className="font-noto-sans-sc">下一步</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 修改 StepItem 组件
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

export default UploadFiles;