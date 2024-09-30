import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

function ConversationActionMenu({ onRename, onDelete }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="text-text-secondary hover:text-primary p-1.5 rounded-full hover:bg-secondary transition-colors duration-200">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </Menu.Button>
      </div>
      <Transition
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-bg-primary shadow-lg ring-1 ring-secondary focus:outline-none z-10">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-secondary-dark text-text-primary' : 'text-text-secondary'
                  } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150 font-sans`}
                  onClick={onRename}
                >
                  <PencilSquareIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  重命名
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-danger-dark text-white' : 'text-danger'
                  } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150 font-sans`}
                  onClick={onDelete}
                >
                  <TrashIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                  删除
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default ConversationActionMenu;