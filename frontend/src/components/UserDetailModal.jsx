import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Copy,
  Check,
  Play,
  Pause,
  UserX,
  Shield,
  FileText,
  Clock,
  Edit2,
  Save,
  ArrowLeft
} from 'lucide-react';
import {
  getStatusBadgeClass,
  getStatusLabel,
  getStatusDescription,
  getInitials,
} from '../utils/statusHelpers';

export default function UserDetailModal({
  user,
  isOpen,
  initialEdit = false,
  onClose,
  onActivate,
  onSuspend,
  onUnsuspend,
  onDeactivate,
  onViewUserLogs,
  onUpdateUser,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setIsEditing(!!user.editMode || !!initialEdit);
    }
  }, [user, initialEdit]);

  if (!isOpen || !user) return null;

  const status = (user.status || '').toUpperCase();
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id || !onUpdateUser) return;

    setIsSaving(true);
    try {
      await onUpdateUser(user.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header with Direct Inline Name Editing */}
        <div className="modal-header" style={{ alignItems: 'flex-start', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, paddingRight: '12px' }}>
            <div
              className="user-avatar"
              style={{
                width: '48px',
                height: '48px',
                fontSize: '1.05rem',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getInitials(user.firstName, user.lastName, user.email)}
            </div>

            <div style={{ flex: 1 }}>
              {!isEditing ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      {fullName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-edit-inline"
                      title="Edit First and Last Name in Okta"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#2563eb',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit Name</span>
                    </button>
                  </div>

                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${getStatusBadgeClass(status)}`} style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'currentColor',
                        }}
                      />
                      {getStatusLabel(status)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {user.email}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Edit User Name
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="First Name"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.88rem', height: '36px' }}
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Last Name"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.88rem', height: '36px' }}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                      style={{ padding: '5px 12px', fontSize: '0.8rem', height: '32px' }}
                    >
                      <Save size={13} />
                      <span>{isSaving ? 'Saving to Okta...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setIsEditing(false)}
                      style={{ padding: '5px 12px', fontSize: '0.8rem', height: '32px' }}
                    >
                      <X size={13} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '8px' }}>
          {/* Identity Information Details Card */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Okta User ID
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <code className="user-id-mono" style={{ fontSize: '0.84rem', background: '#ffffff', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    {user.id}
                  </code>
                  <button
                    onClick={copyUserId}
                    className="btn-action-icon"
                    style={{ width: '28px', height: '28px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    title="Copy Okta ID"
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#64748b" />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Email / Login
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#0f172a' }}>
                  <Mail size={15} color="#64748b" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, wordBreak: 'break-all' }}>{user.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle State Meaning */}
          <div
            style={{
              background: 'rgba(37, 99, 235, 0.03)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={15} color="#2563eb" />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e3a8a' }}>Lifecycle State Meaning</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
              {getStatusDescription(status)}
            </p>
          </div>

          {/* Lifecycle Action Operations */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Lifecycle Operations
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {/* Activate */}
              {(status === 'STAGED' || status === 'PROVISIONED' || status === 'DEPROVISIONED') && (
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', justifyContent: 'center' }}
                  onClick={() => {
                    onClose();
                    onActivate(user);
                  }}
                >
                  <Play size={15} />
                  <span>Activate User</span>
                </button>
              )}

              {/* Suspend */}
              {status === 'ACTIVE' && (
                <button
                  className="btn btn-secondary"
                  style={{ borderColor: '#fde68a', background: '#fffbeb', color: '#d97706', justifyContent: 'center' }}
                  onClick={() => {
                    onClose();
                    onSuspend(user);
                  }}
                >
                  <Pause size={15} />
                  <span>Suspend Access</span>
                </button>
              )}

              {/* Unsuspend */}
              {status === 'SUSPENDED' && (
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', justifyContent: 'center' }}
                  onClick={() => {
                    onClose();
                    onUnsuspend(user);
                  }}
                >
                  <Play size={15} />
                  <span>Unsuspend User</span>
                </button>
              )}

              {/* Deactivate */}
              {status !== 'DEPROVISIONED' && (
                <button
                  className="btn btn-outline-danger"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    onClose();
                    onDeactivate(user);
                  }}
                >
                  <UserX size={15} />
                  <span>Deactivate / Deprovision</span>
                </button>
              )}

              {/* View Audit Logs for this user */}
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  onClose();
                  onViewUserLogs(user);
                }}
              >
                <FileText size={15} />
                <span>View User Lifecycle Logs</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
