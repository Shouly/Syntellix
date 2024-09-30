import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

function RenameModal({ isOpen, onClose, onRename, currentName, itemType, isLoading }) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRename(newName);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bg-tertiary bg-opacity-50 backdrop-filter backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-start justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-bg-primary p-6 text-left align-middle shadow-xl transition-all mt-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-light">
                    <PencilSquareIcon className="h-5 w-5 text-primary-dark" aria-hidden="true" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-text-primary font-sans-sc"
                  >
                    重命名{itemType}
                  </Dialog.Title>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mt-2 mb-6">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border border-secondary rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-bg-primary text-text-primary"
                      placeholder={`输入新的${itemType}名称`}
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200 font-sans-sc"
                      onClick={onClose}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200 font-sans-sc"
                      disabled={isLoading}
                    >
                      {isLoading ? '重命名中...' : '确认'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default RenameModal;