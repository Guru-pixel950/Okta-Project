import React from 'react';
import { UserPlus, CheckCircle, Pause, Edit3, Trash2 } from 'lucide-react';

const LOGS = [
  { icon: UserPlus,    cls: 'create',     desc: 'User john.doe@company.com was created by admin',      time: 'May 12, 2025 10:30 AM' },
  { icon: CheckCircle, cls: 'activate',   desc: 'User jane.smith@company.com was activated by admin',   time: 'May 12, 2025 10:15 AM' },
  { icon: Pause,       cls: 'deactivate', desc: 'User michael.j@company.com was deactivated by admin',  time: 'May 12, 2025 09:45 AM' },
  { icon: Edit3,       cls: 'update',     desc: 'User emily.davis@company.com role updated by admin',   time: 'May 12, 2025 09:30 AM' },
  { icon: Trash2,      cls: 'delete',     desc: 'User chris.brown@company.com was deleted by admin',    time: 'May 12, 2025 09:10 AM' },
];

export const RecentAuditLogs = ({ onViewAll }) => (
  <div className="audit-panel">
    <div className="audit-panel-header">
      <div className="audit-panel-title">Recent Audit Logs</div>
      <button className="audit-panel-viewall" onClick={onViewAll}>View All</button>
    </div>

    <div className="audit-logs-list">
      {LOGS.map((log, i) => {
        const Icon = log.icon;
        return (
          <div key={i} className="audit-log-item">
            <div className={`audit-icon-box ${log.cls}`}>
              <Icon size={13} />
            </div>
            <div className="audit-log-text">
              <div className="audit-log-desc">{log.desc}</div>
              <div className="audit-log-time">{log.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
