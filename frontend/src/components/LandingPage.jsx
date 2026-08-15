import React from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  UserCheck,
  LogOut,
  LayoutDashboard,
  User
} from 'lucide-react';

export default function LandingPage({
  currentUser,
  currentRole,
  onOpenAuth,
  onNavigateToDashboard,
  onLogout
}) {
  const isSuperAdmin = localStorage.getItem('okta_is_super_admin') === 'true';

  const handleAdminCardClick = () => {
    if (currentUser && isSuperAdmin) {
      onNavigateToDashboard('admin_dashboard');
    } else {
      onOpenAuth('LOGIN', 'Administrator');
    }
  };

  const handleUserCardClick = () => {
    if (currentUser) {
      onNavigateToDashboard('user_portal');
    } else {
      onOpenAuth('LOGIN', 'User');
    }
  };

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="brand-logo-area">
            {/* Okta Sunburst Icon */}
            <div className="okta-sunburst-logo">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="3.5" strokeDasharray="3 3" />
                <circle cx="12" cy="12" r="4.5" fill="#2563eb" />
              </svg>
            </div>
            <div>
              <div className="brand-title-main">Okta</div>
              <div className="brand-subtitle-main">User Lifecycle Orchestrator</div>
            </div>
          </div>

          <div className="landing-auth-buttons">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {currentUser.firstName?.charAt(0) || 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                    {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: isSuperAdmin ? '#ecfdf5' : '#eff6ff', color: isSuperAdmin ? '#059669' : '#2563eb', fontWeight: 700 }}>
                    {isSuperAdmin ? 'Super Admin' : 'User'}
                  </span>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => onNavigateToDashboard(isSuperAdmin ? 'admin_dashboard' : 'user_portal')}
                  id="landing-resume-session-btn"
                >
                  <LayoutDashboard size={16} />
                  <span>Return to {isSuperAdmin ? 'Dashboard' : 'Portal'}</span>
                </button>

                <button
                  className="btn btn-outline"
                  onClick={onLogout}
                  id="landing-logout-btn"
                  title="Sign out of current session"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => onOpenAuth('LOGIN', 'Administrator')}
                  id="landing-login-btn"
                >
                  <Lock size={16} />
                  <span>Log In</span>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onOpenAuth('SIGNUP', 'User')}
                  id="landing-signup-btn"
                >
                  <Sparkles size={16} />
                  <span>Sign Up</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-blob blob-1" />
        <div className="hero-glow-blob blob-2" />

        <div className="hero-content">
          <h1 className="hero-heading" style={{ marginBottom: '36px' }}>
            Automate & Orchestrate <br />
            <span className="text-gradient">Okta User Lifecycles</span>
          </h1>

          {/* Quick Role Selection Cards */}
          <div className="role-quick-cards" id="roles">
            <div
              className="role-card admin-role-card"
              onClick={handleAdminCardClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="role-card-header">
                <div className="role-icon-badge admin-badge">
                  <Shield size={24} />
                </div>
                <span className="role-tag admin-tag">Admin Access</span>
              </div>
              <h3>Administrator Portal</h3>
              <p>
                Full administrative dashboard matching Okta orchestrator specs. Provision users, manage lifecycle stages, trigger bulk actions, and view real-time audit logs.
              </p>
              <div className="role-card-footer">
                <span>
                  {currentUser && isSuperAdmin ? 'Open Administrator Dashboard' : 'Sign In as Administrator'}
                </span>
                <ArrowRight size={16} />
              </div>
            </div>

            <div
              className="role-card user-role-card"
              onClick={handleUserCardClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="role-card-header">
                <div className="role-icon-badge user-badge">
                  <UserCheck size={24} />
                </div>
                <span className="role-tag user-tag">Self-Service</span>
              </div>
              <h3>User Portal</h3>
              <p>
                Member self-service workspace. View your Okta directory profile, review account security status, inspect recent access logs, and update credentials.
              </p>
              <div className="role-card-footer">
                <span>
                  {currentUser ? 'Open User Portal' : 'Sign In as User'}
                </span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo-area">
              <div className="okta-sunburst-logo">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="3" strokeDasharray="3 3" />
                  <circle cx="12" cy="12" r="4.5" fill="#2563eb" />
                </svg>
              </div>
              <span>Okta User Lifecycle Orchestrator</span>
            </div>
            <p>© 2026 Enterprise Okta Integration. Built for High-Assurance Identity Management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
