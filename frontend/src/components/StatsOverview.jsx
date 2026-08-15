import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, UserX } from 'lucide-react';

export default function StatsOverview({ users, selectedStatusFilter, onSelectFilter }) {
  const stats = React.useMemo(() => {
    const list = users || [];
    const total = list.length;
    const active = list.filter((u) => (u.status || '').toUpperCase() === 'ACTIVE').length;
    const staged = list.filter((u) => ['STAGED', 'PROVISIONED'].includes((u.status || '').toUpperCase())).length;
    const suspended = list.filter((u) => ['SUSPENDED', 'LOCKED_OUT'].includes((u.status || '').toUpperCase())).length;
    const deprovisioned = list.filter((u) => (u.status || '').toUpperCase() === 'DEPROVISIONED').length;

    return { total, active, staged, suspended, deprovisioned };
  }, [users]);

  const handleCardClick = (filterVal) => {
    if (selectedStatusFilter === filterVal) {
      onSelectFilter('ALL');
    } else {
      onSelectFilter(filterVal);
    }
  };

  return (
    <div className="stats-grid">
      {/* Total Users */}
      <div
        className={`stat-card total ${selectedStatusFilter === 'ALL' ? 'selected' : ''}`}
        onClick={() => handleCardClick('ALL')}
        title="Click to view all users"
      >
        <div className="stat-info">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-icon-wrap">
          <Users size={24} />
        </div>
      </div>

      {/* Active Users */}
      <div
        className={`stat-card active ${selectedStatusFilter === 'ACTIVE' ? 'selected' : ''}`}
        onClick={() => handleCardClick('ACTIVE')}
        title="Click to filter Active users"
      >
        <div className="stat-info">
          <span className="stat-label">Active</span>
          <span className="stat-value">{stats.active}</span>
        </div>
        <div className="stat-icon-wrap">
          <CheckCircle size={24} />
        </div>
      </div>

      {/* Staged Users */}
      <div
        className={`stat-card staged ${selectedStatusFilter === 'STAGED' ? 'selected' : ''}`}
        onClick={() => handleCardClick('STAGED')}
        title="Click to filter Staged users"
      >
        <div className="stat-info">
          <span className="stat-label">Staged / Pending</span>
          <span className="stat-value">{stats.staged}</span>
        </div>
        <div className="stat-icon-wrap">
          <Clock size={24} />
        </div>
      </div>

      {/* Suspended Users */}
      <div
        className={`stat-card suspended ${selectedStatusFilter === 'SUSPENDED' ? 'selected' : ''}`}
        onClick={() => handleCardClick('SUSPENDED')}
        title="Click to filter Suspended users"
      >
        <div className="stat-info">
          <span className="stat-label">Suspended</span>
          <span className="stat-value">{stats.suspended}</span>
        </div>
        <div className="stat-icon-wrap">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* Deprovisioned Users */}
      <div
        className={`stat-card deprovisioned ${selectedStatusFilter === 'DEPROVISIONED' ? 'selected' : ''}`}
        onClick={() => handleCardClick('DEPROVISIONED')}
        title="Click to filter Deprovisioned users"
      >
        <div className="stat-info">
          <span className="stat-label">Deprovisioned</span>
          <span className="stat-value">{stats.deprovisioned}</span>
        </div>
        <div className="stat-icon-wrap">
          <UserX size={24} />
        </div>
      </div>
    </div>
  );
}
