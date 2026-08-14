import React, { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onToggleSidebar, onSearch, searchQuery = '' }) => {
  const { currentRole, logout, loginAsAdmin, loginAsUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isAdmin = currentRole === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={16} />
        </button>
        <div className="navbar-search-wrapper">
          <Search size={13} className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder={isAdmin ? 'Search users, roles, logs...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Bell */}
        <button className="nav-icon-btn" aria-label="Notifications">
          <Bell size={15} />
          <span className="notification-badge">5</span>
        </button>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <div className="navbar-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {isAdmin ? (
              <>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Admin"
                  className="profile-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="navbar-profile-text">
                  <div className="navbar-profile-name">Administrator</div>
                  <div className="navbar-profile-subtitle">Super Admin</div>
                </div>
              </>
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: '#2563eb', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.72rem',
              }}>
                JD
              </div>
            )}
            <ChevronDown size={13} color="#94a3b8" />
          </div>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '44px',
              width: 200, backgroundColor: '#ffffff',
              borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0', padding: '0.4rem', zIndex: 60,
            }}>
              <div style={{ padding: '0.45rem 0.65rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.2rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {isAdmin ? 'Administrator' : 'John Doe'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {isAdmin ? 'admin@company.com' : 'john.doe@company.com'}
                </div>
              </div>
              <button
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#334155', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => { isAdmin ? loginAsUser({ id: 'USR1001', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com' }) : loginAsAdmin(); setDropdownOpen(false); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <RefreshCw size={13} />
                Switch to {isAdmin ? 'Normal User' : 'Administrator'}
              </button>
              <button
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => { logout(); setDropdownOpen(false); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
