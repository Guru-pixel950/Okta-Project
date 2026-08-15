import React from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Activity,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  backendOnline,
  isRefreshing,
  onRefresh,
  theme,
  setTheme,
  userCount,
  auditCount,
}) {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-wrap">
          <ShieldCheck size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">Okta Lifecycle</span>
            <span className="brand-badge">Enterprise</span>
          </div>
        </div>
      </div>

      <nav className="nav-center-tabs">
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          id="nav-tab-users"
        >
          <Users size={18} />
          <span>Users</span>
          {userCount !== undefined && (
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.15)',
                padding: '2px 7px',
                borderRadius: '99px',
              }}
            >
              {userCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          id="nav-tab-audit"
        >
          <FileText size={18} />
          <span>Audit Logs</span>
          {auditCount !== undefined && (
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.15)',
                padding: '2px 7px',
                borderRadius: '99px',
              }}
            >
              {auditCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
          id="nav-tab-health"
        >
          <Activity size={18} />
          <span>API Health</span>
        </button>
      </nav>

      <div className="nav-actions">
        <div className="backend-status-pill" title={backendOnline ? 'Connected to Flask Backend API' : 'Backend API Unreachable'}>
          <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
          <span>{backendOnline ? 'API Connected' : 'API Offline'}</span>
        </div>

        <button
          className="btn btn-secondary btn-icon-only"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          id="btn-refresh-data"
        >
          <RefreshCw size={18} className={isRefreshing ? 'skeleton' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        <button
          className="btn btn-secondary btn-icon-only"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
