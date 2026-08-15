import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/DashboardLayout';
import UserPortal from './components/UserPortal';
import CreateUserModal from './components/CreateUserModal';
import UserDetailModal from './components/UserDetailModal';
import AuditLogsModal from './components/AuditLogsModal';
import SettingsModal from './components/SettingsModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { oktaApi } from './api/oktaApi';

export default function App() {
  // Navigation View: 'landing' | 'admin_dashboard' | 'user_portal'
  const [currentView, setCurrentView] = useState(() => {
    const savedRole = localStorage.getItem('okta_role');
    const savedUser = localStorage.getItem('okta_user');
    const isSuperAdmin = localStorage.getItem('okta_is_super_admin') === 'true';

    // Only allow admin_dashboard if isSuperAdmin is explicitly true
    if (savedUser && savedRole === 'Administrator' && isSuperAdmin) {
      return 'admin_dashboard';
    }
    if (savedUser) {
      return 'user_portal';
    }
    return 'landing';
  });

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('okta_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const isSuperAdmin = localStorage.getItem('okta_is_super_admin') === 'true';
    const role = localStorage.getItem('okta_role');
    return isSuperAdmin && role === 'Administrator' ? 'Administrator' : 'User';
  });

  // Data State
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Modals State
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    mode: 'LOGIN',
    role: 'Administrator',
  });

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [auditModalConfig, setAuditModalConfig] = useState({ isOpen: false, filterUser: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDangerous: false,
    onConfirm: null,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title = '', message = '' }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Users from Okta API
  const fetchUsers = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingUsers(true);
    try {
      const data = await oktaApi.getUsers();
      if (data && data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      if (!quiet) {
        addToast({
          type: 'error',
          title: 'Failed to Fetch Okta Users',
          message: err.message,
        });
      }
    } finally {
      if (!quiet) setIsLoadingUsers(false);
    }
  }, [addToast]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingLogs(true);
    try {
      const data = await oktaApi.getAuditLogs();
      if (data && data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      if (!quiet) {
        addToast({
          type: 'error',
          title: 'Failed to Fetch Audit Logs',
          message: err.message,
        });
      }
    } finally {
      if (!quiet) setIsLoadingLogs(false);
    }
  }, [addToast]);

  // Initial Load
  useEffect(() => {
    fetchUsers(true);
    fetchAuditLogs(true);
  }, [fetchUsers, fetchAuditLogs]);

  // Auth Handlers
  const handleOpenAuth = (mode = 'LOGIN', role = 'Administrator') => {
    setAuthModalConfig({
      isOpen: true,
      mode,
      role,
    });
  };

  const handleAuthSuccess = ({ user, role, isSuperAdmin }) => {
    // Strictly verify Super Admin privilege before granting Administrator Dashboard
    const effectiveRole = isSuperAdmin && role === 'Administrator' ? 'Administrator' : 'User';
    setCurrentUser(user);
    setCurrentRole(effectiveRole);
    localStorage.setItem('okta_user', JSON.stringify(user));
    localStorage.setItem('okta_role', effectiveRole);
    localStorage.setItem('okta_is_super_admin', isSuperAdmin ? 'true' : 'false');

    if (effectiveRole === 'Administrator') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('user_portal');
    }

    fetchUsers(true);
    fetchAuditLogs(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('okta_user');
    localStorage.removeItem('okta_role');
    localStorage.removeItem('okta_is_super_admin');
    setCurrentUser(null);
    setCurrentView('landing');
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out of Okta.',
    });
  };

  // Lifecycle Operations
  const handleActivateUser = async (user) => {
    try {
      await oktaApi.activateUser(user.id);
      addToast({
        type: 'success',
        title: 'User Activated',
        message: `${user.firstName || ''} ${user.lastName || ''} (${user.email}) is now active in Okta.`,
      });
      fetchUsers(true);
      fetchAuditLogs(true);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Activation Failed',
        message: err.message,
      });
    }
  };

  const handleDeactivateUser = (user) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Deprovision Okta User',
      message: `Are you sure you want to deprovision ${user.firstName || ''} ${user.lastName || ''} (${user.email})? This user will lose access to all Okta applications.`,
      confirmText: 'Deprovision User',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await oktaApi.deactivateUser(user.id);
          addToast({
            type: 'success',
            title: 'User Deprovisioned',
            message: `${user.firstName || ''} ${user.lastName || ''} (${user.email}) has been deprovisioned in Okta.`,
          });
          fetchUsers(true);
          fetchAuditLogs(true);
        } catch (err) {
          addToast({
            type: 'error',
            title: 'Deprovision Failed',
            message: err.message,
          });
        }
      },
    });
  };

  const handleSuspendUser = (user) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Suspend Okta User',
      message: `Are you sure you want to suspend access for ${user.firstName || ''} ${user.lastName || ''} (${user.email})?`,
      confirmText: 'Suspend Access',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          await oktaApi.suspendUser(user.id);
          addToast({
            type: 'warning',
            title: 'User Suspended',
            message: `Access for ${user.firstName || ''} ${user.lastName || ''} has been temporarily suspended in Okta.`,
          });
          fetchUsers(true);
          fetchAuditLogs(true);
        } catch (err) {
          addToast({
            type: 'error',
            title: 'Suspension Failed',
            message: err.message,
          });
        }
      },
    });
  };

  const handleUnsuspendUser = async (user) => {
    try {
      await oktaApi.unsuspendUser(user.id);
      addToast({
        type: 'success',
        title: 'User Unsuspended',
        message: `Access for ${user.firstName || ''} ${user.lastName || ''} has been restored.`,
      });
      fetchUsers(true);
      fetchAuditLogs(true);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Unsuspend Failed',
        message: err.message,
      });
    }
  };

  const handleExportCsv = () => {
    if (!users || users.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Data',
        message: 'No user records available to export.',
      });
      return;
    }

    const headers = ['Okta ID', 'First Name', 'Last Name', 'Email', 'Status', 'Created Date'];
    const rows = users.map((u) => [
      u.id,
      `"${u.firstName || ''}"`,
      `"${u.lastName || ''}"`,
      `"${u.email || ''}"`,
      u.status || 'UNKNOWN',
      u.createdDate || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `okta_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${users.length} user records to CSV successfully.`,
    });
  };

  const handleRefreshAll = async () => {
    await Promise.all([fetchUsers(true), fetchAuditLogs(true)]);
    addToast({
      type: 'info',
      title: 'Synchronized',
      message: 'Okta directory and audit logs synchronized with tenant.',
    });
  };

  const handleUpdateUserProfile = async (userId, payload) => {
    try {
      const res = await oktaApi.updateUser(userId, payload);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'User name and profile updated successfully in Okta.',
      });
      fetchUsers(true);
      fetchAuditLogs(true);
      return res;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      });
      throw err;
    }
  };

  return (
    <div className="app-root-container">
      {/* 1. Landing Page View */}
      {currentView === 'landing' && (
        <LandingPage
          currentUser={currentUser}
          currentRole={currentRole}
          onOpenAuth={handleOpenAuth}
          onNavigateToDashboard={(view) => {
            setCurrentView(view);
            if (view === 'admin_dashboard') {
              fetchUsers(true);
              fetchAuditLogs(true);
            }
          }}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Admin Dashboard View (Strictly for Okta Super Administrators) */}
      {currentView === 'admin_dashboard' && (
        <DashboardLayout
          currentUser={currentUser}
          users={users}
          auditLogs={auditLogs}
          isLoadingUsers={isLoadingUsers}
          onOpenCreateUser={() => setIsCreateUserOpen(true)}
          onOpenUserDetail={(user, editMode = false) => setSelectedUserDetail({ ...user, editMode })}
          onActivateUser={handleActivateUser}
          onDeactivateUser={handleDeactivateUser}
          onSuspendUser={handleSuspendUser}
          onUnsuspendUser={handleUnsuspendUser}
          onExportCsv={handleExportCsv}
          onViewAllAuditLogs={(filterUser = '') =>
            setAuditModalConfig({ isOpen: true, filterUser })
          }
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          onBackToLanding={handleBackToLanding}
          onRefresh={handleRefreshAll}
        />
      )}

      {/* 3. User Portal View (For Regular Users) */}
      {currentView === 'user_portal' && (
        <UserPortal
          currentUser={currentUser}
          onLogout={handleLogout}
          onBackToLanding={handleBackToLanding}
          oktaApi={oktaApi}
          showToast={addToast}
        />
      )}

      {/* Auth Modal (Role Selection, Login & Sign Up) */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        initialMode={authModalConfig.mode}
        initialRole={authModalConfig.role}
        onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={handleAuthSuccess}
        oktaApi={oktaApi}
        showToast={addToast}
      />

      {/* Create User Modal (Administrator User Provisioning Workflow) */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSuccess={() => {
          fetchUsers(true);
          fetchAuditLogs(true);
        }}
        oktaApi={oktaApi}
        showToast={addToast}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUserDetail}
        isOpen={!!selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        onActivate={handleActivateUser}
        onSuspend={handleSuspendUser}
        onUnsuspend={handleUnsuspendUser}
        onDeactivate={handleDeactivateUser}
        onUpdateUser={handleUpdateUser}
        onViewUserLogs={(u) =>
          setAuditModalConfig({ isOpen: true, filterUser: u.email || u.id })
        }
      />


      {/* Audit Logs Modal */}
      <AuditLogsModal
        isOpen={auditModalConfig.isOpen}
        onClose={() => setAuditModalConfig((prev) => ({ ...prev, isOpen: false }))}
        logs={auditLogs}
        isLoading={isLoadingLogs}
        onRefresh={() => fetchAuditLogs(false)}
        filterUser={auditModalConfig.filterUser}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        isDangerous={confirmModalConfig.isDangerous}
      />

      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
