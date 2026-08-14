import React, { useState } from 'react';
import { X, UserPlus, Shield, Lock, Mail, User } from 'lucide-react';
import { oktaApi } from '../api/oktaApi';
import { useToast } from '../context/ToastContext';

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'TempPassword123!',
    role: 'User'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast('Please fill out all required fields.', 'warning', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      const created = await oktaApi.createUser(formData);
      showToast(`User ${formData.firstName} ${formData.lastName} created successfully!`, 'success', 'User Created');
      onUserCreated(created);
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: 'TempPassword123!',
        role: 'User'
      });
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} />
            </div>
            <div className="modal-title">Create Okta User</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email / Login *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534', marginTop: '0.5rem' }}>
              ℹ️ The user will be created and staged in Okta. You can activate them instantly via the action buttons or bulk lifecycle triggers.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '+ Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
