import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Key, Globe, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { oktaApi } from '../api/oktaApi';
import { useToast } from '../context/ToastContext';

export const SettingsView = () => {
  const { showToast } = useToast();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await oktaApi.getHealth();
      setHealth(data);
      showToast('Connected to Flask Backend API successfully.', 'success', 'Backend Online');
    } catch {
      showToast('Could not reach backend API', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="page-container">
      <div className="card-section" style={{ maxWidth: '840px', margin: '0 auto' }}>
        <div className="card-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} />
            </div>
            <div>
              <div className="card-section-title">Okta Gateway & API Settings</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connection status and directory synchronizer configuration</div>
            </div>
          </div>

          <button className="btn-outline" onClick={checkHealth} disabled={loading}>
            <RefreshCw size={15} />
            <span>Test Gateway</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          {/* Status Indicator Banner */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '1rem' }}>
                Backend REST Gateway: Operational
              </div>
              <div style={{ fontSize: '0.825rem', color: '#15803d', marginTop: '2px' }}>
                Flask API server connected at http://127.0.0.1:5000. All lifecycle routes are active.
              </div>
            </div>
          </div>

          {/* Config Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={15} />
                <span>Okta Organization Domain</span>
              </label>
              <input
                type="text"
                className="form-input"
                readOnly
                value={health?.okta_domain || 'https://integrator-7972368.okta.com'}
                style={{ backgroundColor: '#f8fafc', color: 'var(--text-secondary)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={15} />
                <span>SSWS API Token Authentication</span>
              </label>
              <input
                type="password"
                className="form-input"
                readOnly
                value="••••••••••••••••••••••••••••••••••••••••"
                style={{ backgroundColor: '#f8fafc', color: 'var(--text-secondary)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Token configured in backend <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: 4 }}>.env</code> file.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Server size={15} />
                <span>Active Operation Mode</span>
              </label>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                {health?.is_configured ? (
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>🟢 Live Okta Production API Sync</span>
                ) : (
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>🔵 Instant Full Demo Dataset with Okta REST Engine</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
