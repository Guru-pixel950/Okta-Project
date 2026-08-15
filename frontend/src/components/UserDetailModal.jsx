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
  Save
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
      setIsEditing(false);
    }
  }, [user]);

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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '1rem' }}>
              {getInitials(user.firstName, user.lastName, user.email)}
            </div>
            <div>
              <h2 className="modal-title">{fullName}</h2>
              <span className={`badge ${getStatusBadgeClass(status)}`} style={{ marginTop: '4px' }}>
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
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Identity Information Grid */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Identity Profile
              </span>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={12} />
                  <span>Edit Name</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Okta User ID
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <code className="user-id-mono" style={{ fontSize: '0.85rem' }}>{user.id}</code>
                    <button
                      onClick={copyUserId}
                      className="btn-action-icon"
                      style={{ width: '26px', height: '26px' }}
                      title="Copy ID to Clipboard"
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Email / Login
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: 'var(--text-primary)' }}>
                    <Mail size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{user.email || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ marginTop: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSaving}
                >
                  <Save size={13} />
                  <span>{isSaving ? 'Saving to Okta...' : 'Save Name Changes'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Status Description Box */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Shield size={16} color="var(--accent-secondary)" />
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Lifecycle State Meaning</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              {getStatusDescription(status)}
            </p>
          </div>

          {/* Lifecycle Action Triggers */}
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Lifecycle Operations
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {/* Activate */}
              {(status === 'STAGED' || status === 'PROVISIONED' || status === 'DEPROVISIONED') && (
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  onClick={() => {
                    onClose();
                    onActivate(user);
                  }}
                >
                  <Play size={16} />
                  <span>Activate User in Okta</span>
                </button>
              )}

              {/* Suspend */}
              {status === 'ACTIVE' && (
                <button
                  className="btn btn-secondary"
                  style={{ borderColor: 'var(--status-suspended-border)', color: 'var(--status-suspended)' }}
                  onClick={() => {
                    onClose();
                    onSuspend(user);
                  }}
                >
                  <Pause size={16} />
                  <span>Suspend Access</span>
                </button>
              )}

              {/* Unsuspend */}
              {status === 'SUSPENDED' && (
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  onClick={() => {
                    onClose();
                    onUnsuspend(user);
                  }}
                >
                  <Play size={16} />
                  <span>Unsuspend User</span>
                </button>
              )}

              {/* Deactivate */}
              {status !== 'DEPROVISIONED' && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => {
                    onClose();
                    onDeactivate(user);
                  }}
                >
                  <UserX size={16} />
                  <span>Deactivate / Deprovision</span>
                </button>
              )}

              {/* View Audit Logs for this user */}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onViewUserLogs(user);
                }}
              >
                <FileText size={16} />
                <span>View User Lifecycle Logs</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
