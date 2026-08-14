import React, { useState } from 'react';
import { StatsCards } from '../components/StatsCards';
import { UserTable } from '../components/UserTable';
import { RecentAuditLogs } from '../components/RecentAuditLogs';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const AdminDashboard = ({ onNavigateToAudit }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  return (
    <div className="page-container">
      {/* 4 Metric Stats Cards Matching Reference Image */}
      <StatsCards />

      {/* Main Two-Column Layout: Table (flex-1) + Recent Audit Logs (320px) */}
      <div className="dashboard-main-layout">
        <div>
          <UserTable
            onOpenCreate={() => setIsCreateOpen(true)}
            onEditUser={(user) => setEditingUser(user)}
            onDeleteUser={(user) => setDeletingUser(user)}
          />
        </div>

        <div>
          <RecentAuditLogs
            onViewAll={onNavigateToAudit}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={() => {}}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={() => {}}
      />

      <DeleteConfirmModal
        isOpen={!!deletingUser}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onDeleted={() => {}}
      />
    </div>
  );
};
