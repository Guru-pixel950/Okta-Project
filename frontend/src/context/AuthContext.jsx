import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_ADMIN = {
  id: 'ADM001',
  firstName: 'Administrator',
  lastName: '',
  name: 'Administrator',
  email: 'admin@company.com',
  role: 'Super Admin',
  type: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
};

const DEFAULT_USER = {
  id: 'USR1001',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john.doe@company.com',
  role: 'User',
  type: 'user',
  status: 'Active'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('okta_orchestrator_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('okta_orchestrator_role');
    return savedRole || null; // 'admin' | 'user' | null
  });

  const loginAsAdmin = (customUser = {}) => {
    const user = { ...DEFAULT_ADMIN, ...customUser };
    setCurrentUser(user);
    setCurrentRole('admin');
    localStorage.setItem('okta_orchestrator_user', JSON.stringify(user));
    localStorage.setItem('okta_orchestrator_role', 'admin');
  };

  const loginAsUser = (customUser = {}) => {
    const user = { ...DEFAULT_USER, ...customUser };
    setCurrentUser(user);
    setCurrentRole('user');
    localStorage.setItem('okta_orchestrator_user', JSON.stringify(user));
    localStorage.setItem('okta_orchestrator_role', 'user');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('okta_orchestrator_user');
    localStorage.removeItem('okta_orchestrator_role');
  };

  const updateCurrentUserProfile = (updatedProfile) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updatedProfile,
        firstName: updatedProfile.firstName !== undefined ? updatedProfile.firstName : prev.firstName,
        lastName: updatedProfile.lastName !== undefined ? updatedProfile.lastName : prev.lastName,
        name: `${updatedProfile.firstName || prev.firstName || ''} ${updatedProfile.lastName || prev.lastName || ''}`.trim()
      };
      localStorage.setItem('okta_orchestrator_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentRole,
        loginAsAdmin,
        loginAsUser,
        logout,
        updateCurrentUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
