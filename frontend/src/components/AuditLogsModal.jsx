import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Power,
  Trash2,
  Edit2,
  RefreshCw,
  User,
  ShieldAlert
} from 'lucide-react';

export default function AuditLogsModal({
  isOpen,
  onClose,
  logs = [],
  isLoading = false,
  onRefresh,
  filterUser = '',
}) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Synchronize filter when modal opens or filterUser prop changes
  useEffect(() => {
    if (isOpen) {
      setSearch(filterUser || '');
      setActionFilter('ALL');
    }
  }, [isOpen, filterUser]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.user_name && l.user_name.toLowerCase().includes(q)) ||
          (l.user_id && l.user_id.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q))
      );
    }
    if (actionFilter !== 'ALL') {
      result = result.filter((l) => (l.action || '').toUpperCase() === actionFilter.toUpperCase());
    }
    return result.slice().reverse(); // Newest first
  }, [logs, search, actionFilter]);

  if (!isOpen) return null;

  const renderIcon = (type) => {
    switch (type) {
      case 'created':
        return <div className="audit-icon-box green-soft"><CheckCircle size={15} color="#10b981" /></div>;
      case 'activated':
        return <div className="audit-icon-box green-soft"><Power size={15} color="#10b981" /></div>;
      case 'deactivated':
      case 'suspended':
        return <div className="audit-icon-box orange-soft"><Power size={15} color="#f59e0b" /></div>;
      case 'updated':
        return <div className="audit-icon-box blue-soft"><Edit2 size={15} color="#3b82f6" /></div>;
      case 'deleted':
        return <div className="audit-icon-box red-soft"><Trash2 size={15} color="#ef4444" /></div>;
      default:
        return <div className="audit-icon-box blue-soft"><Clock size={15} color="#6366f1" /></div>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Top Header with Prominent Close Button */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}
            >
              <FileText size={20} color="#2563eb" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 className="modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  {filterUser ? `Audit Logs for ${filterUser}` : 'Okta Audit Trail & Security Logs'}
                </h2>
                {filterUser && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    User Filter Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Chronological security and lifecycle records from the Okta tenant
              </p>
            </div>
          </div>

          {/* Top Close Button */}
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <div className="table-search-box" style={{ width: '100%', maxWidth: '320px' }}>
                <Search size={15} className="search-box-icon" />
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Filter logs by user, reason, action..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: '36px', fontSize: '0.85rem' }}
                />
              </div>

              <select
                className="clean-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ height: '36px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="SIGNUP">SIGNUP</option>
                <option value="LOGIN">LOGIN</option>
                <option value="ACTIVATE">ACTIVATE</option>
                <option value="DEACTIVATE">DEACTIVATE</option>
                <option value="SUSPEND">SUSPEND</option>
                <option value="UPDATE">UPDATE</option>
              </select>
            </div>

            <button
              className="btn btn-outline btn-sm"
              onClick={onRefresh}
              title="Refresh audit logs"
              style={{ height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spinner-sm' : ''} />
              <span>Sync Logs</span>
            </button>
          </div>

          {/* Table of Filtered Logs */}
          <div className="table-responsive-wrapper" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table className="orchestrator-table" style={{ margin: 0 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '150px' }}>Time</th>
                  <th>Action</th>
                  <th>User / Target</th>
                  <th>Status</th>
                  <th>Details & Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-table-cell" style={{ textAlign: 'center', padding: '36px 16px' }}>
                      <FileText size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                      <p style={{ margin: '4px 0', fontWeight: 600, color: '#0f172a' }}>No matching audit logs</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        {search ? `No operations found for "${search}".` : 'No lifecycle operations recorded.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const resultUpper = (log.result || 'SUCCESS').toUpperCase();
                    const isSuccess = resultUpper === 'SUCCESS';
                    const isFailed = resultUpper === 'FAILED';

                    return (
                      <tr key={idx}>
                        <td style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {log.timestamp || log.formattedTime || '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {renderIcon(log.iconType)}
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                              {log.action || 'EVENT'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                              {log.user_name || 'User'}
                            </span>
                            {log.user_id && log.user_id !== 'UNKNOWN' && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                {log.user_id}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className="pill-badge"
                            style={{
                              background: isSuccess ? '#ecfdf5' : isFailed ? '#fef2f2' : '#fffbeb',
                              color: isSuccess ? '#059669' : isFailed ? '#dc2626' : '#d97706',
                              border: `1px solid ${isSuccess ? '#a7f3d0' : isFailed ? '#fecaca' : '#fde68a'}`,
                              fontSize: '0.75rem',
                              padding: '2px 8px'
                            }}
                          >
                            {resultUpper}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {log.details || log.reason || log.description || 'Operation logged'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer with Close Button */}
        <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing <strong>{filteredLogs.length}</strong> log events
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
