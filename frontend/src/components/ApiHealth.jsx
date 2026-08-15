import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Key,
  Globe,
  Database,
} from 'lucide-react';

export default function ApiHealth({ backendOnline, onRefresh, usersCount, auditCount }) {
  const [testingEndpoint, setTestingEndpoint] = useState(null);
  const [testResults, setTestResults] = useState({});

  const runEndpointTest = async (name, url, method = 'GET') => {
    setTestingEndpoint(name);
    const startTime = performance.now();
    try {
      const res = await fetch(url, { method });
      const duration = Math.round(performance.now() - startTime);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      let data = null;
      if (isJson) {
        data = await res.json();
      }

      setTestResults((prev) => ({
        ...prev,
        [name]: {
          success: res.ok,
          status: res.status,
          duration: `${duration}ms`,
          data: data ? JSON.stringify(data).slice(0, 100) + '...' : `Status ${res.statusText}`,
        },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          status: 'ERROR',
          duration: '0ms',
          data: err.message,
        },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const endpoints = [
    { name: 'List Users', path: '/api/users', method: 'GET', desc: 'Fetches full directory users from Okta' },
    { name: 'Audit Logs', path: '/api/audit', method: 'GET', desc: 'Reads persistent operational log file' },
    { name: 'CSV Export', path: '/api/export', method: 'GET', desc: 'Generates real-time CSV attachment' },
  ];

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={22} color="#06b6d4" />
            <span>Backend & Okta Gateway Diagnostics</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Monitor REST endpoints, server latency, and Okta tenant API gateway health.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Server size={20} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Flask Backend Server</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
            <span style={{ fontWeight: 600, color: backendOnline ? 'var(--status-active)' : 'var(--status-deprovisioned)' }}>
              {backendOnline ? 'Online (Proxy :5000)' : 'Offline / Unreachable'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            CORS-enabled REST service at <code>http://127.0.0.1:5000</code>
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Database size={20} color="#10b981" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Data Cache & Logs</span>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            <strong>{usersCount}</strong> Users Cached &bull; <strong>{auditCount}</strong> Audit Records
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Persistent storage in <code>backend/data/audit.log</code>
          </div>
        </div>
      </div>

      {/* Endpoint Live Test Suite */}
      <h3 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Live Endpoint Diagnostic Suite</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {endpoints.map((ep) => {
          const result = testResults[ep.name];
          const isTesting = testingEndpoint === ep.name;

          return (
            <div
              key={ep.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {ep.method}
                  </code>
                  <span style={{ fontWeight: 700 }}>{ep.path}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {ep.desc}
                </div>
              </div>

              {result && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: result.success ? 'var(--status-active)' : 'var(--status-deprovisioned)' }}>
                    {result.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{result.status}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>({result.duration})</span>
                </div>
              )}

              <button
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => runEndpointTest(ep.name, ep.path, ep.method)}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : 'Test Endpoint'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
