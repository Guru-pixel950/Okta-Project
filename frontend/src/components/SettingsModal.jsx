import React from 'react';
import { X, Settings, ShieldCheck, Server, Key, Lock, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box">
              <Settings size={20} color="#2563eb" />
            </div>
            <div>
              <h2 className="modal-title">Okta Tenant Settings</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Connected Okta Enterprise Identity Configuration</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-item-group">
            <div className="setting-status-badge">
              <CheckCircle2 size={16} color="#10b981" />
              <span>Okta REST API Gateway Online</span>
            </div>

            <div className="setting-row">
              <div className="setting-label-block">
                <span className="setting-name">Okta API Integration</span>
                <span className="setting-desc">Primary authn, users lifecycle, CSV exports</span>
              </div>
              <span className="pill-badge pill-active">Connected</span>
            </div>

            <div className="setting-row">
              <div className="setting-label-block">
                <span className="setting-name">Audit Logger</span>
                <span className="setting-desc">Local immutable persistence in data/audit.log</span>
              </div>
              <span className="pill-badge pill-active">Active</span>
            </div>

            <div className="setting-row">
              <div className="setting-label-block">
                <span className="setting-name">Session Token Management</span>
                <span className="setting-desc">Role-based access control (Admin & User)</span>
              </div>
              <span className="pill-badge pill-active">Enforced</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
