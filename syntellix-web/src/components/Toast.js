import React, { createContext, useContext, useState, useCallback } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => closeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ message, type, onClose }) {
  const config = {
    success: { icon: CheckCircleIcon, bgColor: 'bg-success-DEFAULT', textColor: 'text-white' },
    error: { icon: ExclamationCircleIcon, bgColor: 'bg-danger-DEFAULT', textColor: 'text-white' },
    info: { icon: InformationCircleIcon, bgColor: 'bg-info-DEFAULT', textColor: 'text-primary' },
    warning: { icon: ExclamationCircleIcon, bgColor: 'bg-warning-DEFAULT', textColor: 'text-primary' },
  }[type] || { icon: InformationCircleIcon, bgColor: 'bg-secondary-DEFAULT', textColor: 'text-text-primary' };

  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.textColor} px-4 py-3 rounded-2xl shadow-lg flex items-center max-w-md backdrop-filter backdrop-blur-lg bg-opacity-90 transition-all duration-300 transform hover:scale-105`}>
      <Icon className="h-5 w-5 mr-3" />
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 focus:outline-none hover:opacity-75 transition-opacity duration-200">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
