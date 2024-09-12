import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const avatarOptions = [
  { id: 1, name: 'Default 1' },
  { id: 2, name: 'Default 2' },
  { id: 3, name: 'Default 3' },
  { id: 4, name: 'Default 4' },
  { id: 5, name: 'Default 5' },
  { id: 6, name: 'Default 6' },
  { id: 7, name: 'Default 7' },
  { id: 8, name: 'Default 8' },
];

function AvatarSelector({ onSelect, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar);
    onSelect(avatar);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl p-8 w-[600px] max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-indigo-800 font-noto-sans-sc">选择头像</h2>
        <div className="grid grid-cols-4 gap-4">
          {avatarOptions.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              className={`w-full aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                selectedAvatar?.id === avatar.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                <UserCircleIcon className="w-3/4 h-3/4 text-indigo-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AvatarSelector;