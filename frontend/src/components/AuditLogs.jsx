import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Shield,
} from 'lucide-react';
import { formatDate } from '../utils/statusHelpers';

export default function AuditLogs({ logs = [], isLoading, onRefresh, initialSearch = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Filter by action
    if (actionFilter !== 'ALL') {
      result = result.filter(
        (l) => (l.action || '').toUpperCase() === actionFilter.toUpperCase()
      );
    }

    // Filter by result
    if (resultFilter !== 'ALL') {
      result = result.filter(
        (l) => (l.result || '').toUpperCase() === resultFilter.toUpperCase()
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          (l.user_id && l.user_id.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          (l.timestamp && l.timestamp.toLowerCase().includes(q))
      );
    }

    // Display latest logs on top
    return result.reverse();
  }, [logs, actionFilter, resultFilter, searchQuery]);

  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map((l) => (l.action || '').toUpperCase()).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const getResultIcon = (res) => {
    switch ((res || '').toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle size={16} color="var(--status-active)" />;
      case 'SKIPPED':
        return <AlertTriangle size={16} color="var(--status-suspended)" />;
      case 'FAILED':
        return <XCircle size={16} color="var(--status-deprovisioned)" />;
      default:
        return <Shield size={16} color="var(--accent-primary)" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="#818cf8" />
            <span>Okta Lifecycle Audit Trail</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Immutable chronological record of all user provisioning and lifecycle events.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Sync Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="control-bar" style={{ marginBottom: '20px' }}>
        <div className="search-filter-group">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search audit trail by user, ID, reason, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-audit-input"
            />
          </div>

          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Success</option>
            <option value="SKIPPED">Skipped</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User Name</th>
              <th>User ID</th>
              <th>Result</th>
              <th>Details / Reason</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`log-skel-${idx}`}>
                  <td colSpan={6} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '28px', width: '100%' }} />
                  </td>
                </tr>
              ))
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText size={32} />
                    </div>
                    <h3>No Audit Events Found</h3>
                    <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                      {searchQuery || actionFilter !== 'ALL' || resultFilter !== 'ALL'
                        ? 'Try clearing filters to see more log records.'
                        : 'No lifecycle operations have been recorded yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  <td>
                    <span className="audit-action-badge">{log.action}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{log.user_name || 'System / Unnamed'}</span>
                  </td>
                  <td>
                    <code className="user-id-mono">{log.user_id}</code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getResultIcon(log.result)}
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color:
                            (log.result || '').toUpperCase() === 'SUCCESS'
                              ? 'var(--status-active)'
                              : (log.result || '').toUpperCase() === 'SKIPPED'
                              ? 'var(--status-suspended)'
                              : 'var(--status-deprovisioned)',
                        }}
                      >
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      {log.reason || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
