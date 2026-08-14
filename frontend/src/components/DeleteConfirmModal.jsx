import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { oktaApi } from '../api/oktaApi';
import { useToast } from '../context/ToastContext';

export const DeleteConfirmModal = ({ isOpen, onClose, user, onDeleted }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await oktaApi.deleteUser(user.id);
      showToast(`User ${user.firstName || ''} ${user.lastName || ''} deleted.`, 'success', 'User Deleted');
      onDeleted(user.id);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
            <div className="modal-title">Delete Okta User</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Are you sure you want to deprovision and delete user <strong style={{ color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</strong> ({user.email})?
          </p>
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3', fontSize: '0.78rem', color: '#9f1239' }}>
            ⚠️ This will deprovision the user account from Okta directory and log an entry into the audit trail.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-profile-delete"
            onClick={handleDelete}
            disabled={loading}
            style={{ padding: '0.55rem 1.1rem' }}
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
