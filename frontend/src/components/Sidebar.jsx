import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileSpreadsheet,
  History,
  Settings,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { currentRole, logout } = useAuth();
  const isAdmin = currentRole === 'admin';

  const adminNavItems = [
    { id: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
    { id: 'create-user',     label: 'Create User',     icon: UserPlus },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'export-users',    label: 'Export Users',    icon: FileSpreadsheet },
    { id: 'audit-logs',      label: 'Audit Logs',      icon: History },
    { id: 'settings',        label: 'Settings',        icon: Settings },
  ];

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile',   label: 'Profile',   icon: UserCheck },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Okta sunburst icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" strokeWidth="2.5" />
                <line x1="12" y1="2"  x2="12" y2="4.5" />
                <line x1="12" y1="19.5" x2="12" y2="22" />
                <line x1="2"  y1="12" x2="4.5" y2="12" />
                <line x1="19.5" y1="12" x2="22" y2="12" />
                <line x1="4.9" y1="4.9"  x2="6.6" y2="6.6" />
                <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
                <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
                <line x1="17.4" y1="6.6"  x2="19.1" y2="4.9" />
              </svg>
            </div>
            <div>
              <div className="sidebar-brand-title">Okta</div>
              <div className="sidebar-brand-subtitle">
                User Lifecycle Orchestrator
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth <= 768 && setIsOpen) setIsOpen(false);
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" onClick={logout} title="Sign Out">
          {/* Avatar circle */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: isAdmin ? '#1e293b' : '#1d4ed8',
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
          }}>
            {isAdmin ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            ) : 'JD'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {isAdmin ? 'Administrator' : 'John Doe'}
            </div>
            <div className="sidebar-user-role">
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              <span>{isAdmin ? 'Super Admin' : 'User'}</span>
            </div>
          </div>
          <ChevronDown size={14} color="#8099c0" />
        </div>
      </div>
    </aside>
  );
};
