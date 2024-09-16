import React, { useState, useEffect } from 'react';

function ProcessingStatus({ onBackToDocuments, onPreviousStep }) {
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        // Simulate processing
        const timer = setTimeout(() => {
            setStatus('completed');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 font-noto-sans-sc">处理状态</h3>
            <div>
                {status === 'processing' ? (
                    <p className="text-blue-600">正在处理文件...</p>
                ) : (
                    <p className="text-green-600">处理完成！</p>
                )}
            </div>
            <div className="flex justify-between">
                <button
                    onClick={onPreviousStep}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    上一步
                </button>
                {status === 'completed' && (
                    <button
                        onClick={onBackToDocuments}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        回到文档
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProcessingStatus;