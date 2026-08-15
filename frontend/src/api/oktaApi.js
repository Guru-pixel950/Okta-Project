// Okta Lifecycle Management API Client - Direct Integration with Flask Backend

const BASE_URL = 'http://127.0.0.1:5000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Backend server is offline or unreachable at ' + url);
    }
    throw error;
  }
}

export const oktaApi = {
  // Authentication & Session
  login: async (credentials) => {
    // Collects { username, password, role } and sends to backend POST /api/auth/login
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (userData) => {
    // Collects { firstName, lastName, email, password, role, department, mobilePhone } and sends to POST /api/auth/signup
    return await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return await request('/api/auth/me');
  },

  // Check API connectivity
  checkHealth: async () => {
    try {
      const res = await request('/api/users');
      return { online: true, data: res };
    } catch (err) {
      return { online: false, error: err.message };
    }
  },

  // Users CRUD & Lifecycle
  getUsers: async () => {
    // GET /api/users -> returns real Okta users
    return await request('/api/users');
  },

  getUser: async (userId) => {
    // GET /api/users/<user_id>
    return await request(`/api/users/${userId}`);
  },

  createUser: async (userData) => {
    // Workflow: Collect input -> POST /api/users -> modules/create_user.py -> okta_client.py -> Okta /api/v1/users
    return await request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (userId, updateData) => {
    // PUT /api/users/<user_id> -> modules/update_user.py -> Okta API
    return await request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  activateUser: async (userId) => {
    // POST /api/users/<user_id>/activate -> modules/activate_user.py -> Okta API
    return await request(`/api/users/${userId}/activate`, {
      method: 'POST',
    });
  },

  deactivateUser: async (userId) => {
    // POST /api/users/<user_id>/deactivate -> modules/deactivate_user.py -> Okta API
    return await request(`/api/users/${userId}/deactivate`, {
      method: 'POST',
    });
  },

  suspendUser: async (userId) => {
    // POST /api/users/<user_id>/suspend -> modules/suspend_user.py -> Okta API
    return await request(`/api/users/${userId}/suspend`, {
      method: 'POST',
    });
  },

  unsuspendUser: async (userId) => {
    // POST /api/users/<user_id>/unsuspend -> modules/unsuspend_user.py -> Okta API
    return await request(`/api/users/${userId}/unsuspend`, {
      method: 'POST',
    });
  },

  // Bulk Operations
  bulkActivate: async (userIds) => {
    return await request('/api/bulk/activate', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  },

  bulkDeactivate: async (userIds) => {
    return await request('/api/bulk/deactivate', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  },

  // Audit Logs
  getAuditLogs: async () => {
    // GET /api/audit -> returns real logs from data/audit.log
    return await request('/api/audit');
  },

  // Export CSV download trigger
  exportUsersCsvUrl: () => `${BASE_URL}/api/export`,

  downloadExportCsv: async () => {
    const response = await fetch(`${BASE_URL}/api/export`);
    if (!response.ok) {
      throw new Error('Failed to export CSV: ' + response.statusText);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `okta_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },
};
