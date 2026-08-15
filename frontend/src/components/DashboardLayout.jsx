import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Download,
  ListOrdered,
  Menu,
  Search,
  Bell,
  ChevronDown,
  Edit2,
  Power,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  UserCheck,
  LogOut,
  RefreshCw,
  FileText,
  UserX,
  Play,
  Pause,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function DashboardLayout({
  currentUser,
  users = [],
  auditLogs = [],
  isLoadingUsers = false,
  onOpenCreateUser,
  onOpenUserDetail,
  onActivateUser,
  onDeactivateUser,
  onSuspendUser,
  onUnsuspendUser,
  onExportCsv,
  onViewAllAuditLogs,
  onLogout,
  onRefresh,
}) {
  // Sidebar Navigation State: 'dashboard' | 'user_management' | 'audit_logs'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Search & Filter State (Users)
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search & Filter State (Audit Logs Page)
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditResultFilter, setAuditResultFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = activeNav === 'dashboard' ? 5 : 8;

  // Multi-selection state for User Management
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // Dropdown States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Stats calculation directly from Okta tenant users list
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status || '').toUpperCase() === 'ACTIVE').length;
    const inactive = users.filter((u) => ['DEPROVISIONED', 'SUSPENDED', 'LOCKED_OUT', 'INACTIVE'].includes((u.status || '').toUpperCase())).length;
    const suspended = users.filter((u) => (u.status || '').toUpperCase() === 'SUSPENDED').length;

    const activePct = total > 0 ? ((active / total) * 100).toFixed(1) : '0';
    const inactivePct = total > 0 ? ((inactive / total) * 100).toFixed(1) : '0';
    const suspendedPct = total > 0 ? ((suspended / total) * 100).toFixed(1) : '0';

    return {
      totalDisplay: total.toLocaleString(),
      activeDisplay: active.toLocaleString(),
      inactiveDisplay: inactive.toLocaleString(),
      suspendedDisplay: suspended.toLocaleString(),
      activePct,
      inactivePct,
      suspendedPct,
    };
  }, [users]);

  // Filtered Users List
  const displayedUsersList = useMemo(() => {
    let list = [...users];

    // Apply Global and Table Search
    const searchFilter = (tableSearch || globalSearch).toLowerCase().trim();
    if (searchFilter) {
      list = list.filter(
        (u) =>
          `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchFilter) ||
          (u.email && u.email.toLowerCase().includes(searchFilter)) ||
          (u.displayId && u.displayId.toLowerCase().includes(searchFilter)) ||
          (u.id && u.id.toLowerCase().includes(searchFilter))
      );
    }

    // Apply Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter((u) => {
        if (statusFilter === 'ACTIVE') return (u.status || '').toUpperCase() === 'ACTIVE';
        if (statusFilter === 'INACTIVE') return ['DEPROVISIONED', 'SUSPENDED', 'LOCKED_OUT', 'INACTIVE'].includes((u.status || '').toUpperCase());
        return (u.status || '').toUpperCase() === statusFilter.toUpperCase();
      });
    }

    return list;
  }, [users, globalSearch, tableSearch, statusFilter]);

  // Paginated Users records
  const totalRecords = displayedUsersList.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedUsersList.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedUsersList, currentPage, itemsPerPage]);

  // Filtered Audit Logs List (For dedicated Audit Logs Page)
  const displayedAuditLogs = useMemo(() => {
    let list = [...auditLogs];

    // Global / Audit Search
    const q = (auditSearch || globalSearch).toLowerCase().trim();
    if (q) {
      list = list.filter(
        (l) =>
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          (l.user_id && l.user_id.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.result && l.result.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }

    // Action filter
    if (auditActionFilter !== 'ALL') {
      list = list.filter((l) => (l.action || '').toUpperCase() === auditActionFilter.toUpperCase());
    }

    // Result filter
    if (auditResultFilter !== 'ALL') {
      list = list.filter((l) => (l.result || '').toUpperCase() === auditResultFilter.toUpperCase());
    }

    return list.slice().reverse(); // Newest first
  }, [auditLogs, auditSearch, globalSearch, auditActionFilter, auditResultFilter]);

  // Paginated Audit Logs records
  const totalAuditRecords = displayedAuditLogs.length;
  const totalAuditPages = Math.max(1, Math.ceil(totalAuditRecords / 10));
  const paginatedAuditLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return displayedAuditLogs.slice(startIndex, startIndex + 10);
  }, [displayedAuditLogs, currentPage]);

  // Toggle single user selection
  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all on page
  const toggleSelectAllPage = () => {
    if (paginatedUsers.every((u) => selectedUserIds.has(u.id))) {
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        paginatedUsers.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        paginatedUsers.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  // Recent 5 logs for overview card
  const recentLogsList = useMemo(() => {
    if (auditLogs && auditLogs.length > 0) {
      return auditLogs.slice(-5).reverse();
    }
    return [];
  }, [auditLogs]);

  // Render audit log item icon
  const renderAuditIcon = (type) => {
    switch (type) {
      case 'created':
        return (
          <div className="audit-icon-box green-soft">
            <UserPlus size={16} color="#10b981" />
          </div>
        );
      case 'activated':
        return (
          <div className="audit-icon-box green-soft">
            <CheckCircle size={16} color="#10b981" />
          </div>
        );
      case 'deactivated':
      case 'suspended':
        return (
          <div className="audit-icon-box orange-soft">
            <Power size={16} color="#f59e0b" />
          </div>
        );
      case 'updated':
        return (
          <div className="audit-icon-box blue-soft">
            <Edit2 size={16} color="#3b82f6" />
          </div>
        );
      case 'deleted':
        return (
          <div className="audit-icon-box red-soft">
            <Trash2 size={16} color="#ef4444" />
          </div>
        );
      default:
        return (
          <div className="audit-icon-box blue-soft">
            <Clock size={16} color="#6366f1" />
          </div>
        );
    }
  };

  return (
    <div className="orchestrator-layout">
      {/* 1. Left Dark Sidebar */}
      <aside className={`orchestrator-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Brand */}
        <div className="sidebar-brand-wrap">
          <div className="okta-sunburst-logo">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="3" strokeDasharray="3.5 3" />
              <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="brand-text">
              <span className="brand-name">Okta</span>
              <span className="brand-product">User Lifecycle Orchestrator</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Menu (Only: Dashboard, User Management, Create User, Audit Logs) */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('dashboard');
              setCurrentPage(1);
            }}
            id="nav-sidebar-dashboard"
          >
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          <button
            className={`sidebar-nav-item ${activeNav === 'user_management' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('user_management');
              setCurrentPage(1);
            }}
            id="nav-sidebar-user-mgmt"
          >
            <Users size={18} />
            {!sidebarCollapsed && <span>User Management</span>}
          </button>

          <button
            className="sidebar-nav-item"
            onClick={onOpenCreateUser}
            id="nav-sidebar-create-user"
          >
            <UserPlus size={18} />
            {!sidebarCollapsed && <span>Create User</span>}
          </button>

          <button
            className={`sidebar-nav-item ${activeNav === 'audit_logs' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('audit_logs');
              setCurrentPage(1);
            }}
            id="nav-sidebar-audit-logs"
          >
            <ListOrdered size={18} />
            {!sidebarCollapsed && <span>Audit Logs</span>}
          </button>
        </nav>

        {/* Sidebar Bottom Profile Card */}
        <div className="sidebar-bottom-profile" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
          <div className="user-avatar-circle">
            <Shield size={16} />
          </div>
          {!sidebarCollapsed && (
            <div className="user-meta">
              <span className="user-title-bold">
                {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin'}
              </span>
              <span className="user-subtitle-gray">Okta Super Administrator</span>
            </div>
          )}
          {!sidebarCollapsed && <ChevronDown size={14} className="dropdown-chevron" />}
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="orchestrator-main">
        {/* Top Header Bar */}
        <header className="orchestrator-topbar">
          <div className="topbar-left">
            <button
              className="topbar-icon-btn menu-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="topbar-search-wrap">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="topbar-search-input"
                placeholder="Search users, actions, or logs..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                id="global-search-input"
              />
            </div>
          </div>

          <div className="topbar-right">
            {/* Sync / Refresh */}
            <button
              className="topbar-icon-btn"
              onClick={onRefresh}
              title="Sync Okta Directory"
              aria-label="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            {/* Notification Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="topbar-icon-btn notif-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Notifications"
                aria-label="Notifications"
                id="topbar-bell-btn"
              >
                <Bell size={20} />
                {recentLogsList.length > 0 && (
                  <span className="notif-badge-pill">{recentLogsList.length}</span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="notifications-dropdown-menu">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span className="badge-new">{recentLogsList.length} New</span>
                  </div>
                  <div className="dropdown-body">
                    {recentLogsList.length === 0 ? (
                      <p style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        No new lifecycle notifications.
                      </p>
                    ) : (
                      recentLogsList.map((log, idx) => (
                        <div key={idx} className="notif-item">
                          {renderAuditIcon(log.iconType)}
                          <div className="notif-text">
                            <p>{log.description}</p>
                            <span>{log.formattedTime}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill in Topbar */}
            <div className="topbar-profile-wrap" ref={profileRef}>
              <div
                className="profile-pill-trigger"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                id="topbar-profile-trigger"
              >
                <div className="profile-thumb">
                  <div className="avatar-fallback">
                    {currentUser?.firstName?.charAt(0) || 'S'}
                  </div>
                </div>

                <div className="profile-name-role">
                  <span className="name-bold">
                    {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin'}
                  </span>
                  <span className="role-sub">Super Administrator</span>
                </div>
                <ChevronDown size={14} className="dropdown-caret" />
              </div>

              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <p className="bold-user">{currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin'}</p>
                    <p className="email-muted">{currentUser?.email || 'admin@okta-tenant.local'}</p>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveNav('audit_logs');
                      setCurrentPage(1);
                    }}
                  >
                    <FileText size={16} />
                    <span>Audit Logs</span>
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button className="dropdown-item danger" onClick={onLogout} id="btn-menu-logout">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="orchestrator-content-area">
          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {activeNav === 'dashboard' && (
            <>
              {/* Top Metrics Row (4 Cards) */}
              <div className="metrics-row-grid">
                <div className="metric-card">
                  <div className="metric-icon-wrap blue-bg">
                    <Users size={22} color="#2563eb" />
                  </div>
                  <div className="metric-info">
                    <span className="metric-title">Total Users</span>
                    <span className="metric-number">{stats.totalDisplay}</span>
                    <span className="metric-trend green-text">+12 this month</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap green-bg">
                    <UserCheck size={22} color="#10b981" />
                  </div>
                  <div className="metric-info">
                    <span className="metric-title">Active Users</span>
                    <span className="metric-number">{stats.activeDisplay}</span>
                    <span className="metric-trend gray-text">{stats.activePct}% of total</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap orange-bg">
                    <Clock size={22} color="#f59e0b" />
                  </div>
                  <div className="metric-info">
                    <span className="metric-title">Inactive Users</span>
                    <span className="metric-number">{stats.inactiveDisplay}</span>
                    <span className="metric-trend gray-text">{stats.inactivePct}% of total</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap purple-bg">
                    <Shield size={22} color="#8b5cf6" />
                  </div>
                  <div className="metric-info">
                    <span className="metric-title">Suspended</span>
                    <span className="metric-number">{stats.suspendedDisplay}</span>
                    <span className="metric-trend gray-text">{stats.suspendedPct}% of total</span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Split: User Management Overview (Left) & Recent Audit Logs (Right) */}
              <div className="dashboard-columns-grid">
                {/* Left Column: User Management Card */}
                <div className="card-panel user-management-panel" id="user-mgmt-card">
                  <div className="panel-header-row">
                    <h2 className="panel-title">User Management</h2>
                    <div className="panel-actions-group">
                      <button
                        className="btn btn-primary-solid"
                        onClick={onOpenCreateUser}
                        id="btn-mgmt-create-user"
                      >
                        <span>+ Create User</span>
                      </button>

                      <button
                        className="btn btn-outline-clean"
                        onClick={onExportCsv}
                        id="btn-mgmt-export-csv"
                      >
                        <Download size={15} />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Filters Bar */}
                  <div className="table-controls-bar">
                    <div className="table-search-box">
                      <Search size={16} className="search-box-icon" />
                      <input
                        type="text"
                        className="table-search-input"
                        placeholder="Search users..."
                        value={tableSearch}
                        onChange={(e) => {
                          setTableSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        id="table-filter-search"
                      />
                    </div>

                    <div className="filter-dropdowns-group">
                      <select
                        className="clean-select"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        id="filter-select-status"
                      >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DEPROVISIONED">Deprovisioned</option>
                      </select>
                    </div>
                  </div>

                  {/* Clean Data Table */}
                  <div className="table-responsive-wrapper">
                    <table className="orchestrator-table">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingUsers ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}>
                              <td colSpan={7}>
                                <div className="row-skeleton" />
                              </td>
                            </tr>
                          ))
                        ) : paginatedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="empty-table-cell" style={{ textAlign: 'center', padding: '32px 16px' }}>
                              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                {tableSearch || globalSearch || statusFilter !== 'ALL'
                                  ? 'No Okta users matching the selected filters.'
                                  : 'No users found in the Okta tenant. Click "+ Create User" to add your first user.'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map((user) => {
                            const statusUpper = (user.status || '').toUpperCase();
                            const isActive = statusUpper === 'ACTIVE';

                            return (
                              <tr key={user.id || user.displayId}>
                                <td>
                                  <span className="id-text">{user.displayId || user.id?.substring(0, 7) || 'USR1001'}</span>
                                </td>
                                <td>{user.firstName || '—'}</td>
                                <td>{user.lastName || '—'}</td>
                                <td>
                                  <span className="email-text">{user.email || '—'}</span>
                                </td>
                                <td>
                                  <span className={`pill-badge ${isActive ? 'pill-active' : 'pill-inactive'}`}>
                                    {user.uiStatus || (isActive ? 'Active' : 'Inactive')}
                                  </span>
                                </td>
                                <td>
                                  <span className="date-text">{user.createdDate || 'Aug 14, 2026'}</span>
                                </td>
                                <td>
                                  <div className="row-actions-cell">
                                    <button
                                      className="action-word-btn edit-btn"
                                      onClick={() => onOpenUserDetail(user)}
                                      title="View / Edit Profile"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      className={`action-word-btn ${isActive ? 'suspend-btn' : 'activate-btn'}`}
                                      onClick={() => (isActive ? onSuspendUser(user) : onActivateUser(user))}
                                      title={isActive ? 'Suspend User Access in Okta' : 'Activate User in Okta'}
                                    >
                                      {isActive ? 'Suspend' : 'Activate'}
                                    </button>

                                    <button
                                      className="action-word-btn history-btn"
                                      onClick={() => onViewAllAuditLogs(user.email)}
                                      title="View User Lifecycle Logs"
                                    >
                                      Logs
                                    </button>

                                    <button
                                      className="action-word-btn delete-btn"
                                      onClick={() => onDeactivateUser(user)}
                                      title="Deactivate / Deprovision User in Okta"
                                    >
                                      Deactivate
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination Footer */}
                  <div className="table-pagination-footer">
                    <span className="pagination-count-text">
                      Showing {totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                      {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords.toLocaleString()} users
                    </span>

                    <div className="pagination-controls">
                      <button
                        className="page-nav-btn"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {totalPages > 3 && <span className="pagination-ellipsis">...</span>}
                      {totalPages > 3 && (
                        <button
                          className={`page-num-btn ${currentPage === totalPages ? 'active' : ''}`}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      )}

                      <button
                        className="page-nav-btn"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Recent Audit Logs Card */}
                <div className="card-panel audit-logs-panel">
                  <div className="panel-header-row">
                    <h2 className="panel-title">Recent Audit Logs</h2>
                    <button
                      className="view-all-link-btn"
                      onClick={() => {
                        setActiveNav('audit_logs');
                        setCurrentPage(1);
                      }}
                      id="btn-view-all-audit-logs"
                    >
                      View All
                    </button>
                  </div>

                  <div className="audit-feed-list">
                    {recentLogsList.length === 0 ? (
                      <p style={{ fontSize: '0.84rem', color: '#64748b', padding: '12px 0' }}>
                        No audit records logged yet. Operations will appear here in real time.
                      </p>
                    ) : (
                      recentLogsList.map((log, idx) => (
                        <div key={idx} className="audit-feed-item">
                          {renderAuditIcon(log.iconType)}
                          <div className="audit-feed-details">
                            <p className="audit-msg-text">{log.description}</p>
                            <span className="audit-timestamp">{log.formattedTime || log.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: DEDICATED FULL-WIDTH USER MANAGEMENT PAGE */}
          {activeNav === 'user_management' && (
            <div className="user-management-dedicated-page">
              <div className="card-panel" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Okta Directory
                      </span>
                      <span style={{ color: '#94a3b8' }}>/</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>User Management</span>
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      User Management & Directory
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      Provision, activate, suspend, edit, or deprovision member accounts in your Okta tenant.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-outline"
                      onClick={onRefresh}
                      title="Sync from Okta"
                    >
                      <RefreshCw size={15} />
                      <span>Sync Okta</span>
                    </button>

                    <button
                      className="btn btn-outline"
                      onClick={onExportCsv}
                    >
                      <Download size={15} />
                      <span>Export Directory CSV</span>
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={onOpenCreateUser}
                    >
                      <UserPlus size={16} />
                      <span>+ Provision New User</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Full-Width Directory Panel */}
              <div className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <div className="table-search-box" style={{ width: '100%', maxWidth: '380px' }}>
                      <Search size={16} className="search-box-icon" />
                      <input
                        type="text"
                        className="table-search-input"
                        placeholder="Search by first name, last name, email, or Okta ID..."
                        value={tableSearch}
                        onChange={(e) => {
                          setTableSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <select
                      className="clean-select"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ height: '38px' }}
                    >
                      <option value="ALL">All Lifecycle Statuses</option>
                      <option value="ACTIVE">Active Users</option>
                      <option value="SUSPENDED">Suspended Users</option>
                      <option value="DEPROVISIONED">Deprovisioned Users</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Total: <strong style={{ color: '#0f172a' }}>{totalRecords}</strong> Okta accounts
                  </div>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="orchestrator-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.has(u.id))}
                            onChange={toggleSelectAllPage}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th>User ID</th>
                        <th>User Name</th>
                        <th>Okta Login & Email</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'center' }}>Lifecycle Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingUsers ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={7}>
                              <div className="row-skeleton" />
                            </td>
                          </tr>
                        ))
                      ) : paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="empty-table-cell" style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <UserX size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                            <p style={{ color: '#0f172a', fontWeight: 600, margin: '4px 0' }}>No users found</p>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                              {tableSearch || statusFilter !== 'ALL'
                                ? 'Try changing your search keywords or status filter.'
                                : 'No users exist in the Okta directory. Click "+ Provision New User" to create one.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => {
                          const statusUpper = (user.status || '').toUpperCase();
                          const isActive = statusUpper === 'ACTIVE';
                          const isSelected = selectedUserIds.has(user.id);

                          return (
                            <tr key={user.id || user.displayId} style={{ background: isSelected ? 'rgba(37, 99, 235, 0.03)' : undefined }}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectUser(user.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className="id-text" style={{ fontWeight: 700 }}>{user.displayId || 'USR1001'}</span>
                                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{user.id}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                  }}>
                                    {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                  </div>
                                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                    {user.firstName || ''} {user.lastName || ''}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="email-text" style={{ color: '#0f172a' }}>{user.email || '—'}</span>
                              </td>
                              <td>
                                <span className={`pill-badge ${isActive ? 'pill-active' : 'pill-inactive'}`}>
                                  {user.uiStatus || (isActive ? 'Active' : statusUpper)}
                                </span>
                              </td>
                              <td>
                                <span className="date-text">{user.createdDate || 'Aug 15, 2026'}</span>
                              </td>
                              <td>
                                <div className="row-actions-cell" style={{ justifyContent: 'center' }}>
                                  <button
                                    className="action-word-btn edit-btn"
                                    onClick={() => onOpenUserDetail(user)}
                                    title="View & Edit Identity Details"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className={`action-word-btn ${isActive ? 'suspend-btn' : 'activate-btn'}`}
                                    onClick={() => (isActive ? onSuspendUser(user) : onActivateUser(user))}
                                    title={isActive ? 'Suspend Access in Okta' : 'Activate / Restore in Okta'}
                                  >
                                    {isActive ? 'Suspend' : 'Activate'}
                                  </button>

                                  <button
                                    className="action-word-btn history-btn"
                                    onClick={() => onViewAllAuditLogs(user.email)}
                                    title="View Audit Logs for this User"
                                  >
                                    Logs
                                  </button>

                                  <button
                                    className="action-word-btn delete-btn"
                                    onClick={() => onDeactivateUser(user)}
                                    title="Deactivate / Deprovision in Okta"
                                  >
                                    Deactivate
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-pagination-footer" style={{ marginTop: '16px' }}>
                  <span className="pagination-count-text">
                    Showing {totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords.toLocaleString()} users
                  </span>

                  <div className="pagination-controls">
                    <button
                      className="page-nav-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="pagination-ellipsis">...</span>}
                    {totalPages > 5 && (
                      <button
                        className={`page-num-btn ${currentPage === totalPages ? 'active' : ''}`}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      className="page-nav-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: DEDICATED FULL-WIDTH AUDIT LOGS PAGE */}
          {activeNav === 'audit_logs' && (
            <div className="audit-logs-dedicated-page">
              {/* Header Card */}
              <div className="card-panel" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Okta Directory
                      </span>
                      <span style={{ color: '#94a3b8' }}>/</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Audit Trail</span>
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Audit Logs & Activity Trail
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      Chronological record of all identity operations, user provisioning, authentication, and lifecycle state changes.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-outline"
                      onClick={onRefresh}
                      title="Sync latest audit logs"
                    >
                      <RefreshCw size={15} />
                      <span>Refresh Audit Logs</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Full-Width Logs Table Panel */}
              <div className="card-panel">
                {/* Search & Filter Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                    <div className="table-search-box" style={{ width: '100%', maxWidth: '340px' }}>
                      <Search size={16} className="search-box-icon" />
                      <input
                        type="text"
                        className="table-search-input"
                        placeholder="Search logs by user, action, details..."
                        value={auditSearch}
                        onChange={(e) => {
                          setAuditSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <select
                      className="clean-select"
                      value={auditActionFilter}
                      onChange={(e) => {
                        setAuditActionFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ height: '38px' }}
                    >
                      <option value="ALL">All Actions</option>
                      <option value="CREATE">CREATE</option>
                      <option value="SIGNUP">SIGNUP</option>
                      <option value="LOGIN">LOGIN</option>
                      <option value="ACTIVATE">ACTIVATE</option>
                      <option value="DEACTIVATE">DEACTIVATE</option>
                      <option value="SUSPEND">SUSPEND</option>
                      <option value="UPDATE">UPDATE</option>
                    </select>

                    <select
                      className="clean-select"
                      value={auditResultFilter}
                      onChange={(e) => {
                        setAuditResultFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ height: '38px' }}
                    >
                      <option value="ALL">All Results</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                      <option value="SKIPPED">SKIPPED</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Total: <strong style={{ color: '#0f172a' }}>{totalAuditRecords}</strong> audit entries
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="table-responsive-wrapper">
                  <table className="orchestrator-table">
                    <thead>
                      <tr>
                        <th style={{ width: '180px' }}>Timestamp</th>
                        <th>Action</th>
                        <th>User / Target</th>
                        <th>Result</th>
                        <th>Details & Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-table-cell" style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <FileText size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                            <p style={{ color: '#0f172a', fontWeight: 600, margin: '4px 0' }}>No audit records found</p>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                              {auditSearch || auditActionFilter !== 'ALL' || auditResultFilter !== 'ALL'
                                ? 'No logs match your filter criteria.'
                                : 'No activity logged yet. Perform operations like user creation or activation to view events.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedAuditLogs.map((log, idx) => {
                          const action = (log.action || 'EVENT').toUpperCase();
                          const result = (log.result || 'SUCCESS').toUpperCase();
                          const isSuccess = result === 'SUCCESS';
                          const isFailed = result === 'FAILED';

                          return (
                            <tr key={idx}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                                  <Clock size={13} color="#94a3b8" />
                                  <span>{log.timestamp || log.formattedTime || '—'}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {renderAuditIcon(log.iconType)}
                                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                                    {action}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                                    {log.user_name || 'User'}
                                  </span>
                                  {log.user_id && log.user_id !== 'UNKNOWN' && (
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                      {log.user_id}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`pill-badge ${isSuccess ? 'pill-active' : isFailed ? 'pill-inactive' : ''}`} style={{
                                  background: isSuccess ? '#ecfdf5' : isFailed ? '#fef2f2' : '#fffbeb',
                                  color: isSuccess ? '#059669' : isFailed ? '#dc2626' : '#d97706',
                                  border: `1px solid ${isSuccess ? '#a7f3d0' : isFailed ? '#fecaca' : '#fde68a'}`
                                }}>
                                  {result}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                                  {log.details || log.description || 'Operation executed'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Audit Pagination */}
                <div className="table-pagination-footer" style={{ marginTop: '16px' }}>
                  <span className="pagination-count-text">
                    Showing {totalAuditRecords > 0 ? (currentPage - 1) * 10 + 1 : 0} to{' '}
                    {Math.min(currentPage * 10, totalAuditRecords)} of {totalAuditRecords.toLocaleString()} log entries
                  </span>

                  <div className="pagination-controls">
                    <button
                      className="page-nav-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(5, totalAuditPages) }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalAuditPages > 5 && <span className="pagination-ellipsis">...</span>}
                    {totalAuditPages > 5 && (
                      <button
                        className={`page-num-btn ${currentPage === totalAuditPages ? 'active' : ''}`}
                        onClick={() => setCurrentPage(totalAuditPages)}
                      >
                        {totalAuditPages}
                      </button>
                    )}

                    <button
                      className="page-nav-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalAuditPages, p + 1))}
                      disabled={currentPage >= totalAuditPages}
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
