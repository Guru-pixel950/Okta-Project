import React, { useState } from 'react';
import {
  Shield,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Layers,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [selectedDemoUser, setSelectedDemoUser] = useState('john.doe@company.com');
  const [customLoginOpen, setCustomLoginOpen] = useState(false);
  const [roleMode, setRoleMode] = useState('admin'); // 'admin' | 'user'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (roleMode === 'admin') {
      loginAsAdmin({ email: loginForm.email || 'admin@company.com' });
    } else {
      loginAsUser({
        email: loginForm.email || 'john.doe@company.com',
        firstName: loginForm.email ? loginForm.email.split('@')[0] : 'John',
        lastName: 'Doe'
      });
    }
  };

  return (
    <div className="landing-hero">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 0 18" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Okta</span>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', marginLeft: '0.4rem', fontWeight: 600 }}>Lifecycle Orchestrator</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>API Status:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
            Live Okta Gateway
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-content">
        <div className="landing-badge">
          <Sparkles size={14} />
          <span>Enterprise Identity & Access Management</span>
        </div>

        <h1 className="landing-title">
          Unified Okta User Lifecycle<br />
          Orchestration Portal
        </h1>

        <p className="landing-subtitle">
          Automate provisioning, status transitions, and audit compliance across your enterprise directory. Select your login role below to access your workspace.
        </p>

        {/* Dual Role Login Cards */}
        <div className="role-cards-container">
          {/* Administrator Role Card */}
          <div className="role-login-card">
            <span className="role-card-badge admin">Administrative Access</span>
            <h2 className="role-card-title">Administrator Portal</h2>
            <p className="role-card-desc">
              Manage complete user lifecycles, oversee directory provisioning, perform bulk actions, and inspect real-time audit logs.
            </p>

            <ul className="role-features-list">
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#c084fc" />
                <span>Full CRUD & Lifecycle Operations</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#c084fc" />
                <span>Bulk Activate & Deactivate Controls</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#c084fc" />
                <span>Real-time Compliance Audit Trail</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#c084fc" />
                <span>CSV Directory Export Hub</span>
              </li>
            </ul>

            <button
              className="role-login-btn admin"
              onClick={() => loginAsAdmin()}
            >
              <Shield size={18} />
              <span>Sign in as Administrator</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Normal User Role Card */}
          <div className="role-login-card">
            <span className="role-card-badge user">End-User Access</span>
            <h2 className="role-card-title">Normal User Portal</h2>
            <p className="role-card-desc">
              Access your personal identity profile, view security credentials, manage account details, and check resource authorizations.
            </p>

            <ul className="role-features-list">
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#60a5fa" />
                <span>Personal Account Overview</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#60a5fa" />
                <span>Self-Service Profile Updates</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#60a5fa" />
                <span>Verified Access & Security Status</span>
              </li>
              <li className="role-feature-item">
                <CheckCircle2 size={15} color="#60a5fa" />
                <span>Account Deactivation Requests</span>
              </li>
            </ul>

            <button
              className="role-login-btn user"
              onClick={() => loginAsUser({
                id: 'USR1001',
                firstName: 'John',
                lastName: 'Doe',
                email: selectedDemoUser
              })}
            >
              <User size={18} />
              <span>Sign in as Normal User</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%', maxWidth: '860px', textAlign: 'left' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Layers size={20} color="#38bdf8" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.25rem' }}>REST Lifecycle Engine</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Direct integration with Okta Users API v1 endpoints.</div>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Activity size={20} color="#34d399" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.25rem' }}>Automated Audit Logging</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Every transition is recorded with timestamp and reason.</div>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <KeyRound size={20} color="#a78bfa" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.25rem' }}>Dual Role Segregation</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tailored portals for Super Admins and End Users.</div>
          </div>
        </div>
      </main>
    </div>
  );
};
