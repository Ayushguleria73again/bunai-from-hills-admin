import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return { icon: faCheckCircle, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      case 'error':
        return { icon: faExclamationCircle, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'warning':
        return { icon: faExclamationTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
      case 'info':
      default:
        return { icon: faInfoCircle, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    }
  };

  const { icon, color, bgColor, borderColor } = getIcon();

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`flex items-start p-4 rounded-lg shadow-lg border-l-4 ${bgColor} ${borderColor} min-w-[300px] max-w-md`}
      >
        <div className="mr-3 mt-0.5">
          <FontAwesomeIcon icon={icon} className={`text-xl ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Toast;