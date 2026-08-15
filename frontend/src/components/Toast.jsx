import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <Info size={20} color="#4f46e5" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type || 'info'}`}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
