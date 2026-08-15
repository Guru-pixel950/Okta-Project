import React, { useState } from 'react';
import {
  X,
  Layers,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStatusBadgeClass } from '../utils/statusHelpers';

export default function BulkActionModal({
  isOpen,
  onClose,
  actionType, // 'ACTIVATE' | 'DEACTIVATE'
  userIds = [],
  users = [],
  oktaApi,
  onComplete,
  showToast,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  if (!isOpen) return null;

  const isActivate = actionType === 'ACTIVATE';
  const title = isActivate ? 'Bulk User Activation' : 'Bulk User Deactivation';

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      let res;
      if (isActivate) {
        res = await oktaApi.bulkActivate(userIds);
      } else {
        res = await oktaApi.bulkDeactivate(userIds);
      }

      setResultsData(res);

      if (res.successful > 0) {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
        });
      }

      showToast({
        type: res.failed > 0 ? 'warning' : 'success',
        title: `${title} Finished`,
        message: `Processed ${res.requested} users: ${res.successful} succeeded, ${res.skipped} skipped, ${res.failed} failed.`,
      });

      onComplete();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: err.message || 'Error occurred while executing bulk action.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={resultsData ? onClose : undefined}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isActivate ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActivate ? '#10b981' : '#ef4444',
              }}
            >
              <Layers size={20} />
            </div>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!resultsData ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                You have selected <strong>{userIds.length}</strong> user{userIds.length > 1 ? 's' : ''} to{' '}
                <strong style={{ color: isActivate ? 'var(--status-active)' : 'var(--status-deprovisioned)' }}>
                  {isActivate ? 'activate' : 'deactivate'}
                </strong>.
              </p>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  padding: '14px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                }}
              >
                {userIds.map((id) => {
                  const userObj = users.find((u) => u.id === id);
                  const name = userObj
                    ? `${userObj.firstName} ${userObj.lastName}`.trim() || userObj.email
                    : id;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{name}</span>
                      <code className="user-id-mono">{id}</code>
                    </div>
                  );
                })}
              </div>

              {isActivate ? (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Activation transitions STAGED users to ACTIVE state. Users already ACTIVE or in other states will be safely skipped.
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Deactivation deprovisions accounts and removes active session tokens.
                </div>
              )}
            </div>
          ) : (
            /* Results Breakdown */
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REQUESTED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{resultsData.requested}</div>
                </div>
                <div style={{ background: 'var(--status-active-bg)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-active)' }}>SUCCESS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-active)' }}>{resultsData.successful}</div>
                </div>
                <div style={{ background: 'var(--status-suspended-bg)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-suspended)' }}>SKIPPED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-suspended)' }}>{resultsData.skipped}</div>
                </div>
                <div style={{ background: 'var(--status-deprovisioned-bg)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-deprovisioned)' }}>FAILED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-deprovisioned)' }}>{resultsData.failed}</div>
                </div>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Transition</th>
                      <th>Result</th>
                      <th>Note / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(resultsData.results || []).map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.user_name || item.user_id}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(item.previous_status)}`}>
                            {item.previous_status}
                          </span>
                          <ArrowRight size={12} style={{ margin: '0 4px', verticalAlign: 'middle' }} />
                          <span className={`badge ${getStatusBadgeClass(item.new_status)}`}>
                            {item.new_status}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                item.result === 'SUCCESS'
                                  ? 'var(--status-active)'
                                  : item.result === 'SKIPPED'
                                  ? 'var(--status-suspended)'
                                  : 'var(--status-deprovisioned)',
                            }}
                          >
                            {item.result}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!resultsData ? (
            <>
              <button className="btn btn-secondary" onClick={onClose} disabled={isRunning}>
                Cancel
              </button>
              <button
                className={`btn ${isActivate ? 'btn-primary' : 'btn-outline-danger'}`}
                style={isActivate ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : {}}
                onClick={handleExecute}
                disabled={isRunning}
                id="btn-confirm-bulk-action"
              >
                {isRunning ? (
                  <>
                    <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <span>Start Bulk {isActivate ? 'Activation' : 'Deactivation'}</span>
                )}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
