import React, { useState } from 'react';
import {
  User,
  LogOut,
  Edit3,
  Save,
  X
} from 'lucide-react';

export default function UserPortal({
  currentUser,
  onLogout,
  oktaApi,
  showToast,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsSaving(true);
    try {
      await oktaApi.updateUser(currentUser.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (showToast) {
        showToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your Okta directory profile was synchronized successfully.',
        });
      }

      setIsEditing(false);
    } catch (err) {
      if (showToast) {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: err.message || 'Could not update Okta profile.',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="user-portal-page">
      {/* Top Bar */}
      <header className="user-portal-navbar">
        <div className="portal-brand">
          <div className="okta-sunburst-logo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="3.5" strokeDasharray="3.5 3" />
              <circle cx="12" cy="12" r="4.5" fill="#2563eb" />
            </svg>
          </div>
          <div>
            <div className="portal-title">Okta User Portal</div>
            <div className="portal-sub">Member Self-Service</div>
          </div>
        </div>

        <div className="portal-nav-actions">
          <div className="user-status-pill">
            <span className="dot-active" />
            <span>Active Okta Session</span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onLogout} id="user-logout-btn">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="user-portal-content">
        <div className="user-welcome-card" style={{ marginBottom: '24px' }}>
          <div className="welcome-avatar">
            <User size={36} color="#2563eb" />
          </div>
          <div className="welcome-text">
            <h2>Welcome, {firstName || currentUser?.email || 'User'}</h2>
            <p>Here is your registered Okta tenant identity profile.</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card-panel user-card-info" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="panel-header-row">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>Personal Identity Information</h3>
            {!isEditing ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
                id="btn-edit-user-profile"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditing(false)}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{firstName || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{lastName || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Okta Login & Email</span>
                <span className="detail-value">{currentUser?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Okta User ID</span>
                <code className="detail-code">{currentUser?.id || '—'}</code>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
                style={{ marginTop: '12px' }}
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving to Okta...' : 'Save Changes'}</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
