import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useState } from 'react';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function SidebarItem({ text, timestamp, isActive = false, onClick, onRename, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(text);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRename = () => {
        if (isEditing) {
            onRename(newName);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const distance = formatDistanceToNow(date, { locale: zhCN });
        return distance.replace(/大约 /, '') // 移除"大约"字
            .replace(/ 天/, '天')
            .replace(/ 个?小时/, '小时')
            .replace(/ 分钟/, '分钟')
            .replace(/不到 /, ''); // 移除"不到"
    };

    const formattedTimestamp = timestamp ? formatRelativeTime(timestamp) : '';

    return (
        <>
            <li
                className={`py-2.5 px-3 mx-2 transition-all duration-200 cursor-pointer rounded-md ${isActive
                    ? 'bg-bg-secondary text-primary'
                    : 'text-text-body hover:bg-bg-secondary hover:bg-opacity-50'
                    } flex items-center justify-between group`}
                onClick={isEditing ? undefined : onClick}
            >
                <div className="flex-grow mr-2 min-w-0 flex items-center">
                    {isEditing ? (
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                            className="bg-transparent border-none focus:outline-none text-sm font-sans-sc w-full"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className={`font-sans-sc text-sm ${isActive ? 'font-medium' : ''} truncate flex-shrink min-w-0`}>{text}</span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="text-text-muted hover:text-primary transition-colors duration-200"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleteModalOpen(true);
                            }}
                            className="text-text-muted hover:text-danger transition-colors duration-200"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">{formattedTimestamp}前</span>
                </div>
            </li>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemType="对话"
                itemName={text}
                isLoading={isDeleting}
            />
        </>
    );
}
export default SidebarItem;