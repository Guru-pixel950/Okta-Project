import React from 'react';
import { User, CheckCircle, UserMinus, ShieldPlus } from 'lucide-react';

export const StatsCards = () => (
  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-icon-wrapper blue">
        <User size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-title">Total Users</div>
        <div className="stat-value">1,248</div>
        <div className="stat-meta positive">+12 this month</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon-wrapper green">
        <CheckCircle size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-title">Active Users</div>
        <div className="stat-value">1,028</div>
        <div className="stat-meta neutral">82.4% of total</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon-wrapper orange">
        <UserMinus size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-title">Inactive Users</div>
        <div className="stat-value">186</div>
        <div className="stat-meta neutral">14.9% of total</div>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon-wrapper purple">
        <ShieldPlus size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-title">Administrators</div>
        <div className="stat-value">34</div>
        <div className="stat-meta neutral">2.7% of total</div>
      </div>
    </div>
  </div>
);
