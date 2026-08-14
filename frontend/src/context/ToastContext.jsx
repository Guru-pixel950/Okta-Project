import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          let Icon = Info;
          let defaultTitle = 'Notification';
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            defaultTitle = 'Success';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            defaultTitle = 'Error';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            defaultTitle = 'Notice';
          }

          return (
            <div key={toast.id} className={`toast-item ${toast.type}`}>
              <Icon size={20} color={
                toast.type === 'success' ? '#10b981' :
                toast.type === 'error' ? '#ef4444' :
                toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
              } />
              <div className="toast-content">
                <div className="toast-title">{toast.title || defaultTitle}</div>
                <div className="toast-msg">{toast.message}</div>
              </div>
              <button className="modal-close-btn" onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
