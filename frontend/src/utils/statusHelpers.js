// Utility helpers for Okta Lifecycle statuses and operations

export const STATUS_TYPES = {
  ACTIVE: 'ACTIVE',
  STAGED: 'STAGED',
  SUSPENDED: 'SUSPENDED',
  DEPROVISIONED: 'DEPROVISIONED',
  PROVISIONED: 'PROVISIONED',
  RECOVERY: 'RECOVERY',
  LOCKED_OUT: 'LOCKED_OUT',
};

export const getStatusBadgeClass = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'ACTIVE':
      return 'badge-active';
    case 'STAGED':
    case 'PROVISIONED':
      return 'badge-staged';
    case 'SUSPENDED':
    case 'LOCKED_OUT':
      return 'badge-suspended';
    case 'DEPROVISIONED':
      return 'badge-deprovisioned';
    default:
      return 'badge-unknown';
  }
};

export const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const getStatusDescription = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'ACTIVE':
      return 'User is fully provisioned and has active access to assigned Okta applications.';
    case 'STAGED':
      return 'User account is created but requires activation before logging in.';
    case 'SUSPENDED':
      return 'User access is temporarily disabled. Can be unsuspended at any time.';
    case 'DEPROVISIONED':
      return 'User is deactivated and cannot access any applications.';
    default:
      return 'Status unknown or custom lifecycle state.';
  }
};

export const getInitials = (firstName, lastName, email) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) return firstName.substring(0, 2).toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return 'OK';
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};
