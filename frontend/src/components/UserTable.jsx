import React, { useState } from 'react';
import { Search, Plus, Download, Edit2, Power, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SAMPLE_USERS = [
  { id: 'USR1001', firstName: 'John',    lastName: 'Doe',     email: 'john.doe@company.com',    status: 'Active',   role: 'User',    createdDate: 'May 12, 2025' },
  { id: 'USR1002', firstName: 'Jane',    lastName: 'Smith',   email: 'jane.smith@company.com',  status: 'Active',   role: 'Manager', createdDate: 'May 11, 2025' },
  { id: 'USR1003', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@company.com',   status: 'Inactive', role: 'User',    createdDate: 'May 10, 2025' },
  { id: 'USR1004', firstName: 'Emily',   lastName: 'Davis',   email: 'emily.davis@company.com', status: 'Active',   role: 'Admin',   createdDate: 'May 09, 2025' },
  { id: 'USR1005', firstName: 'Chris',   lastName: 'Brown',   email: 'chris.brown@company.com', status: 'Inactive', role: 'User',    createdDate: 'May 08, 2025' },
];

export const UserTable = ({ onOpenCreate, onEditUser, onDeleteUser }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [activePage,   setActivePage]   = useState(1);

  const filtered = users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || u.firstName.toLowerCase().includes(s) || u.lastName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.id.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'ALL' || u.status.toUpperCase() === statusFilter;
    const matchRole   = roleFilter   === 'ALL' || u.role.toUpperCase()   === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const handleToggle = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    showToast(`${user.firstName} status updated`, 'success', 'Updated');
  };

  return (
    <div className="card-section">
      {/* Header */}
      <div className="card-section-header">
        <div className="card-section-title">User Management</div>
        <div className="card-header-actions">
          <button className="btn-primary" onClick={onOpenCreate}>
            <Plus size={13} /> Create User
          </button>
          <button className="btn-outline">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="table-filters-bar">
        <div className="filter-search-box">
          <Search size={12} className="navbar-search-icon" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td><span className="user-id-badge">{user.id}</span></td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td style={{ color: '#475569' }}>{user.email}</td>
                <td>
                  <span className={`status-pill ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.role}</td>
                <td style={{ color: '#64748b' }}>{user.createdDate}</td>
                <td>
                  <div className="table-actions">
                    <button className="action-icon-btn" title="Edit" onClick={() => onEditUser && onEditUser(user)}>
                      <Edit2 size={12} color="#2563eb" />
                    </button>
                    <button className="action-icon-btn" title="Toggle Active" onClick={() => handleToggle(user)}>
                      <Power size={12} color="#10b981" />
                    </button>
                    <button className="action-icon-btn" title="Suspend">
                      <Clock size={12} color="#ea580c" />
                    </button>
                    <button className="action-icon-btn" title="Delete" onClick={() => onDeleteUser && onDeleteUser(user)}>
                      <Trash2 size={12} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-pagination-footer">
        <span>Showing 1 to 5 of 1,248 users</span>
        <div className="pagination-controls">
          <button className="page-btn"><ChevronLeft size={13} /></button>
          {[1, 2, 3].map(n => (
            <button key={n} className={`page-btn ${activePage === n ? 'active' : ''}`} onClick={() => setActivePage(n)}>{n}</button>
          ))}
          <span style={{ padding: '0 2px', color: '#94a3b8', fontSize: '0.72rem' }}>...</span>
          <button className="page-btn" onClick={() => setActivePage(250)}>250</button>
          <button className="page-btn"><ChevronRight size={13} /></button>
        </div>
      </div>
    </div>
  );
};
