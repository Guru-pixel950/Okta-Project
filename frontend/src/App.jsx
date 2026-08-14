import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { AdminDashboard } from './views/AdminDashboard';
import { UserDashboard } from './views/UserDashboard';
import { AuditLogsView } from './views/AuditLogsView';
import { ExportUsersView } from './views/ExportUsersView';
import { SettingsView } from './views/SettingsView';
import './styles/globals.css';

const MainApp = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // If not authenticated, render the high-aesthetic landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // If authenticated as Normal User, render User portal
  if (currentRole === 'user') {
    return (
      <div className="app-layout">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="main-content">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onSearch={setGlobalSearch}
            searchQuery={globalSearch}
          />
          <UserDashboard />
        </div>
      </div>
    );
  }

  // If authenticated as Administrator, render Admin portal with tab routing
  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSearch={setGlobalSearch}
          searchQuery={globalSearch}
        />

        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateToAudit={() => setActiveTab('audit-logs')}
          />
        )}

        {activeTab === 'create-user' && (
          <AdminDashboard
            onNavigateToAudit={() => setActiveTab('audit-logs')}
          />
        )}

        {activeTab === 'user-management' && (
          <AdminDashboard
            onNavigateToAudit={() => setActiveTab('audit-logs')}
          />
        )}

        {activeTab === 'export-users' && <ExportUsersView />}

        {activeTab === 'audit-logs' && <AuditLogsView />}

        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
