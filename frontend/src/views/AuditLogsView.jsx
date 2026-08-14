import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  CheckCircle,
  PauseCircle,
  UserPlus,
  Edit,
  Trash2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { oktaApi } from '../api/oktaApi';
import { useToast } from '../context/ToastContext';

export const AuditLogsView = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await oktaApi.getAuditLogs();
      setLogs(data);
    } catch {
      showToast('Failed to load audit logs', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      !search ||
      (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.user_id && log.user_id.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

    const matchAction =
      actionFilter === 'ALL' ||
      (log.action && log.action.toUpperCase() === actionFilter.toUpperCase());

    return matchSearch && matchAction;
  });

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act === 'CREATE') {
      return <span className="status-pill active"><UserPlus size={12} /> Created</span>;
    } else if (act === 'ACTIVATE') {
      return <span className="status-pill active"><CheckCircle size={12} /> Activated</span>;
    } else if (act === 'DEACTIVATE') {
      return <span className="status-pill inactive"><PauseCircle size={12} /> Deactivated</span>;
    } else if (act === 'UPDATE') {
      return <span className="status-pill staged"><Edit size={12} /> Updated</span>;
    } else if (act === 'DELETE') {
      return <span className="status-pill inactive"><Trash2 size={12} /> Deleted</span>;
    } else if (act === 'SUSPEND') {
      return <span className="status-pill suspended"><Clock size={12} /> Suspended</span>;
    }
    return <span className="status-pill staged">{action}</span>;
  };

  return (
    <div className="page-container">
      <div className="card-section">
        <div className="card-section-header">
          <div>
            <div className="card-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <History size={20} color="#2563eb" />
              <span>Full Audit Logs & Lifecycle Trail</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Complete chronological audit record of all Okta identity provisioning and status changes.
            </div>
          </div>

          <div className="card-header-actions">
            <button className="btn-outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw size={15} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="table-filters-bar">
          <div className="filter-search-box">
            <Search size={16} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search by user, email, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="ACTIVATE">Activate</option>
            <option value="DEACTIVATE">Deactivate</option>
            <option value="UPDATE">Update</option>
            <option value="SUSPEND">Suspend</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>

        {/* Audit Table */}
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User ID</th>
                <th>Target User</th>
                <th>Result</th>
                <th>Details / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.timestamp}
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <span className="user-id-badge">{log.user_id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.user_name}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: log.result === 'SUCCESS' ? '#16a34a' : log.result === 'SKIPPED' ? '#d97706' : '#dc2626'
                      }}>
                        {log.result}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {log.reason || `Action ${log.action} executed`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
