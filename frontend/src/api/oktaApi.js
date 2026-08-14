// API Client for Okta User Lifecycle Backend
const BASE_URL = '/api';

export const oktaApi = {
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.warn('Backend health check error:', err);
      return { status: 'offline', is_configured: false };
    }
  },

  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch users');
    }
    return data.users || [];
  },

  async getUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch user');
    }
    return data.user;
  },

  async createUser(userData) {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create user');
    }
    return data.user;
  },

  async updateUser(userId, userData) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update user');
    }
    return data.user;
  },

  async deleteUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }
    return data;
  },

  async activateUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/activate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to activate user');
    }
    return data.user;
  },

  async deactivateUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/deactivate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to deactivate user');
    }
    return data.user;
  },

  async suspendUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/suspend`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to suspend user');
    }
    return data.user;
  },

  async unsuspendUser(userId) {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}/unsuspend`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to unsuspend user');
    }
    return data.user;
  },

  async bulkActivate(userIds) {
    const res = await fetch(`${BASE_URL}/bulk/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: userIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to execute bulk activation');
    }
    return data;
  },

  async bulkDeactivate(userIds) {
    const res = await fetch(`${BASE_URL}/bulk/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: userIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to execute bulk deactivation');
    }
    return data;
  },

  async getAuditLogs() {
    const res = await fetch(`${BASE_URL}/audit`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch audit logs');
    }
    return data.logs || [];
  },

  getExportUrl() {
    return `${BASE_URL}/export`;
  }
};
