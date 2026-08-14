import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const UserDashboard = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState({
    id: 'USR1001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    status: 'Active',
  });

  const [viewOpen,   setViewOpen]   = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [form, setForm] = useState({ firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' });

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setProfile(p => ({ ...p, ...form }));
      showToast('Profile updated', 'success', 'Saved');
      setUpdateOpen(false);
      setLoading(false);
    }, 400);
  };

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      showToast('Account deactivation requested', 'info', 'Done');
      setDeleteOpen(false);
      setLoading(false);
      setTimeout(logout, 1000);
    }, 500);
  };

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="user-welcome-header">
        <h1 className="user-welcome-title">
          Welcome, {profile.firstName} {profile.lastName}! 👋
        </h1>
        <p className="user-welcome-subtitle">Here's your account overview.</p>
      </div>

      {/* Two-column layout */}
      <div className="user-portal-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <h2 className="profile-card-title">My Profile</h2>

          {[
            { label: 'User ID',        value: profile.id,        mono: true },
            { label: 'First Name',     value: profile.firstName  },
            { label: 'Last Name',      value: profile.lastName   },
            { label: 'Email',          value: profile.email,     muted: true },
          ].map(({ label, value, mono, muted }) => (
            <div className="profile-field-row" key={label}>
              <span className="profile-field-label">{label}</span>
              <span className="profile-field-value" style={muted ? { color: '#64748b' } : mono ? { fontFamily: 'monospace', fontSize: '0.75rem' } : {}}>
                {value}
              </span>
            </div>
          ))}

          <div className="profile-field-row" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
            <span className="profile-field-label">Account Status</span>
            <span className="status-pill active">{profile.status}</span>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions-row">
            <button className="btn-profile-view" onClick={() => setViewOpen(true)}>
              View Profile
            </button>
            <button className="btn-profile-update" onClick={() => setUpdateOpen(true)}>
              <Edit2 size={12} /> Update Profile
            </button>
            <button className="btn-profile-delete" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={12} /> Delete Account
            </button>
          </div>
        </div>

        {/* Security Shield Card */}
        <div className="security-card">
          <div className="security-shield-wrapper">
            {/* Shield SVG matching reference */}
            <svg className="security-shield-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 8L15 23V56C15 84 30 106 50 114C70 106 85 84 85 56V23L50 8Z"
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Person silhouette inside shield */}
              <circle cx="50" cy="44" r="12" fill="#93c5fd" />
              <path d="M28 80C28 68 38 62 50 62C62 62 72 68 72 80" fill="#93c5fd" />
            </svg>

            {/* Green checkmark badge */}
            <div className="security-badge-check">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
          </div>

          <p className="security-status-text">
            You have full access to your account and resources.
          </p>
        </div>
      </div>

      {/* View Profile Modal */}
      {viewOpen && (
        <div className="modal-overlay" onClick={() => setViewOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">User Profile</div>
              <button className="modal-close-btn" onClick={() => setViewOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                  {profile.firstName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.firstName} {profile.lastName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{profile.email}</div>
                </div>
              </div>
              {[['Okta ID', profile.id], ['Status', null], ['Role', 'User']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  {k === 'Status' ? <span className="status-pill active">{profile.status}</span> : <strong>{v}</strong>}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Profile Modal */}
      {updateOpen && (
        <div className="modal-overlay" onClick={() => setUpdateOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Update Profile</div>
              <button className="modal-close-btn" onClick={() => setUpdateOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setUpdateOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteOpen && (
        <div className="modal-overlay" onClick={() => setDeleteOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={15} />
                </div>
                <div className="modal-title">Delete Account</div>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                Are you sure you want to deactivate your account ({profile.email})?
              </p>
              <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#fff1f2', borderRadius: '6px', border: '1px solid #fecdd3', fontSize: '0.75rem', color: '#9f1239' }}>
                ⚠️ This will revoke SSO access to all company apps.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setDeleteOpen(false)}>Keep Account</button>
              <button className="btn-profile-delete" style={{ padding: '0.45rem 1rem' }} onClick={handleDelete} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
