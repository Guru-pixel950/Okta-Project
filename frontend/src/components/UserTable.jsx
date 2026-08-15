import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Download,
  CheckCircle,
  Play,
  Pause,
  UserX,
  Eye,
  ArrowUpDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  getStatusBadgeClass,
  getStatusLabel,
  getInitials,
} from '../utils/statusHelpers';

export default function UserTable({
  users,
  isLoading,
  onOpenCreate,
  onOpenUserDetail,
  onActivateUser,
  onDeactivateUser,
  onSuspendUser,
  onUnsuspendUser,
  onOpenBulkAction,
  onExportCsv,
  selectedStatusFilter,
  setSelectedStatusFilter,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    let result = [...(users || [])];

    // Filter by status
    if (selectedStatusFilter && selectedStatusFilter !== 'ALL') {
      result = result.filter(
        (u) => (u.status || '').toUpperCase() === selectedStatusFilter.toUpperCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'name') {
        valA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        valB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      } else if (sortField === 'email') {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      } else if (sortField === 'status') {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      } else {
        valA = (a[sortField] || '').toString().toLowerCase();
        valB = (b[sortField] || '').toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, selectedStatusFilter, searchQuery, sortField, sortDirection]);

  // Bulk selection handling
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isAllSelected =
    filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;
  const isIndeterminate =
    selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      {/* Control Bar */}
      <div className="control-bar">
        <div className="search-filter-group">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or Okta ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-user-input"
            />
          </div>

          <select
            className="filter-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            id="status-filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="STAGED">Staged</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEPROVISIONED">Deprovisioned</option>
          </select>
        </div>

        <div className="action-buttons-group">
          <button
            className="btn btn-secondary"
            onClick={onExportCsv}
            title="Export all users to CSV file"
            id="btn-export-csv"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={onOpenCreate}
            id="btn-create-user-modal"
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </th>
              <th className="sortable" onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>User</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Email Address</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('status')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Status</span>
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th>Okta ID</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td colSpan={6} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '36px', width: '100%' }} />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Layers size={32} />
                    </div>
                    <h3>No Users Found</h3>
                    <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                      {searchQuery || selectedStatusFilter !== 'ALL'
                        ? 'Try adjusting your search query or status filter.'
                        : 'No Okta users retrieved from the directory.'}
                    </p>
                    {(searchQuery || selectedStatusFilter !== 'ALL') && (
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: '16px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedStatusFilter('ALL');
                        }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Real User Rows
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const status = (user.status || '').toUpperCase();
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';

                return (
                  <tr
                    key={user.id}
                    className={isSelected ? 'row-selected' : ''}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(user.id)}
                        aria-label={`Select ${fullName}`}
                      />
                    </td>

                    <td>
                      <div className="user-identity">
                        <div className="user-avatar">
                          {getInitials(user.firstName, user.lastName, user.email)}
                        </div>
                        <div className="user-names">
                          <span className="user-fullname">{fullName}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="user-email-text" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {user.email || '—'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'currentColor',
                          }}
                        />
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td>
                      <code className="user-id-mono">{user.id}</code>
                    </td>

                    <td>
                      <div className="action-cell">
                        {/* View Details */}
                        <button
                          className="btn-action-icon"
                          onClick={() => onOpenUserDetail(user)}
                          title="View Profile Details"
                          id={`btn-view-${user.id}`}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Activate (if STAGED or DEPROVISIONED) */}
                        {(status === 'STAGED' || status === 'PROVISIONED' || status === 'DEPROVISIONED') && (
                          <button
                            className="btn-action-icon"
                            style={{ color: 'var(--status-active)' }}
                            onClick={() => onActivateUser(user)}
                            title="Activate User"
                            id={`btn-activate-${user.id}`}
                          >
                            <Play size={16} />
                          </button>
                        )}

                        {/* Suspend (if ACTIVE) */}
                        {status === 'ACTIVE' && (
                          <button
                            className="btn-action-icon"
                            style={{ color: 'var(--status-suspended)' }}
                            onClick={() => onSuspendUser(user)}
                            title="Suspend User Access"
                            id={`btn-suspend-${user.id}`}
                          >
                            <Pause size={16} />
                          </button>
                        )}

                        {/* Unsuspend (if SUSPENDED) */}
                        {status === 'SUSPENDED' && (
                          <button
                            className="btn-action-icon"
                            style={{ color: 'var(--status-active)' }}
                            onClick={() => onUnsuspendUser(user)}
                            title="Unsuspend User Access"
                            id={`btn-unsuspend-${user.id}`}
                          >
                            <Play size={16} />
                          </button>
                        )}

                        {/* Deactivate (if not already DEPROVISIONED) */}
                        {status !== 'DEPROVISIONED' && (
                          <button
                            className="btn-action-icon danger"
                            onClick={() => onDeactivateUser(user)}
                            title="Deactivate / Deprovision User"
                            id={`btn-deactivate-${user.id}`}
                          >
                            <UserX size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedUserIds.length > 0 && (
        <div className="bulk-floating-bar">
          <span className="bulk-count">
            {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              onClick={() => onOpenBulkAction('ACTIVATE', selectedUserIds)}
              id="btn-bulk-activate-trigger"
            >
              <CheckCircle size={16} />
              <span>Bulk Activate</span>
            </button>

            <button
              className="btn btn-outline-danger"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}
              onClick={() => onOpenBulkAction('DEACTIVATE', selectedUserIds)}
              id="btn-bulk-deactivate-trigger"
            >
              <UserX size={16} />
              <span>Bulk Deactivate</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setSelectedUserIds([])}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
