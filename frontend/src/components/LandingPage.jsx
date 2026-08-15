import React from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  UserCheck,
  LogOut,
  LayoutDashboard,
  User as UserIcon
} from 'lucide-react';

export default function LandingPage({
  currentUser,
  currentRole,
  onNavigateDashboard,
  onLogout,
  onOpenAuth,
}) {
  const handleAdminCardClick = () => {
    const isSuper = localStorage.getItem('okta_is_super_admin') === 'true';
    if (currentUser && isSuper && currentRole === 'Administrator') {
      onNavigateDashboard('Administrator');
    } else {
      onOpenAuth('LOGIN', 'Administrator');
    }
  };

  const handleUserCardClick = () => {
    if (currentUser && currentRole === 'User') {
      onNavigateDashboard('User');
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

          {/* Active Session vs Guest Auth Buttons */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigateDashboard(currentRole)}
                id="landing-return-dashboard-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {currentRole === 'Administrator' ? <LayoutDashboard size={16} /> : <UserIcon size={16} />}
                <span>Return to {currentRole === 'Administrator' ? 'Admin Dashboard' : 'User Portal'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-outline"
                onClick={onLogout}
                title="Sign Out of Session"
                id="landing-header-logout-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="landing-auth-buttons">
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
            </div>
          )}
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
                  {currentUser && currentRole === 'Administrator' ? 'Open Active Admin Dashboard' : 'Sign In as Administrator'}
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
                  {currentUser && currentRole === 'User' ? 'Open Active User Portal' : 'Sign In as User'}
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
