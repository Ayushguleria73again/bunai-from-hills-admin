import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastComponent from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
    };
    
    // Prevent duplicate toasts with same message
    setToasts((prevToasts) => {
      const isDuplicate = prevToasts.some(toast => toast.message === message);
      if (isDuplicate) {
        return prevToasts;
      }
      // Limit to 5 toasts maximum
      if (prevToasts.length >= 5) {
        return [...prevToasts.slice(1), newToast];
      }
      return [...prevToasts, newToast];
    });
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};