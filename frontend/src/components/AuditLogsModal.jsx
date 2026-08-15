import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Clock, CheckCircle, Power, Trash2, Edit2, Shield, RefreshCw } from 'lucide-react';

export default function AuditLogsModal({
  isOpen,
  onClose,
  logs = [],
  isLoading = false,
  onRefresh,
  filterUser = '',
}) {
  const [search, setSearch] = useState(filterUser);
  const [actionFilter, setActionFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          (l.user_id && l.user_id.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }
    if (actionFilter !== 'ALL') {
      result = result.filter((l) => (l.action || '').toUpperCase() === actionFilter.toUpperCase());
    }
    return result.reverse();
  }, [logs, search, actionFilter]);

  const renderIcon = (type) => {
    switch (type) {
      case 'created':
        return <div className="audit-icon-box green-soft"><CheckCircle size={16} color="#10b981" /></div>;
      case 'activated':
        return <div className="audit-icon-box green-soft"><Power size={16} color="#10b981" /></div>;
      case 'deactivated':
      case 'suspended':
        return <div className="audit-icon-box orange-soft"><Power size={16} color="#f59e0b" /></div>;
      case 'updated':
        return <div className="audit-icon-box blue-soft"><Edit2 size={16} color="#3b82f6" /></div>;
      case 'deleted':
        return <div className="audit-icon-box red-soft"><Trash2 size={16} color="#ef4444" /></div>;
      default:
        return <div className="audit-icon-box blue-soft"><Clock size={16} color="#6366f1" /></div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box">
              <FileText size={20} color="#2563eb" />
            </div>
            <div>
              <h2 className="modal-title">Okta Audit Trail & Security Logs</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Immutable historical records of user lifecycle operations</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Filter Bar */}
          <div className="table-controls-bar" style={{ marginBottom: '16px' }}>
            <div className="table-search-box">
              <Search size={16} className="search-box-icon" />
              <input
                type="text"
                className="table-search-input"
                placeholder="Search audit trail by user, reason, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns-group">
              <select
                className="clean-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">Created</option>
                <option value="ACTIVATE">Activated</option>
                <option value="DEACTIVATE">Deactivated</option>
                <option value="SUSPEND">Suspended</option>
                <option value="UPDATE">Updated</option>
                <option value="LOGIN">Sign In</option>
              </select>

              <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
                <RefreshCw size={14} className={isLoading ? 'spinner-sm' : ''} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Logs List / Table */}
          <div className="table-responsive-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="orchestrator-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>User / Subject</th>
                  <th>Result</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-table-cell">
                      No audit events matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{log.timestamp || log.formattedTime}</td>
                      <td>
                        <span className="pill-badge pill-role">{log.action}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.user_name || log.user_id}</td>
                      <td>
                        <span
                          className={`pill-badge ${(log.result || '').toUpperCase() === 'SUCCESS' ? 'pill-active' : 'pill-inactive'}`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: '#475569' }}>
                        {log.reason || log.description || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
