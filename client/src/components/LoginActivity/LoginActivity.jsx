import React, { useState, useEffect } from 'react';
import ClearConfirmModal from '../ClearConfirmModal';
import { getVisibleLoginActivityRoles } from '../../utils/roles';
import './LoginActivity.css';

export default function LoginActivity({ db, erp, user }) {
  useEffect(() => {
    if (erp && erp.fetchLoginLogs) {
      erp.fetchLoginLogs().catch(() => {});
    }
  }, [erp]);
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const visibleRoles = getVisibleLoginActivityRoles(user);
  const normalizedVisibleRoles = visibleRoles.map((role) => String(role).toLowerCase());
  const loginLogs = (Array.isArray(db?.loginLogs) ? db.loginLogs : []).filter(
    (log) => normalizedVisibleRoles.includes(String(log.role || '').trim().toLowerCase())
  );
  const isAdmin = user?.role === 'Admin';
  const clearLabel = isAdmin ? 'Clear All' : 'Clear Staff Logs';
  const clearMessage = isAdmin
    ? 'Clear all visible login activity records permanently?'
    : 'Clear all visible staff login activity records permanently?';
  const emptyTitle = isAdmin ? 'No team activity yet' : 'No staff activity yet';
  const emptyDescription = isAdmin
    ? 'No staff or manager login records are available.'
    : 'No staff login records are available.';

  const handleDeleteLog = async (id) => {
    if (!id || deletingId === id) {
      return;
    }
    setDeletingId(id);

    try {
      await erp.deleteLoginLog(id);
    } catch (error) {
      alert(error.message || 'Failed to delete login log');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!loginLogs.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearLoginLogs({ roles: visibleRoles });
      setShowClearConfirm(false);
    } catch (error) {
      alert(error.message || 'Failed to clear login activity');
    } finally {
      setIsClearing(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') {
      return 'badge-purple';
    }

    if (role === 'Manager') {
      return 'badge-green';
    }

    return 'badge-blue';
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Login Activity</h1>
        <p className="page-description">Monitor staff access, session duration, and recent login events.</p>
      </div>

      <div className="card login-activity-page">
        <div className="flex justify-between items-center mb-4">
          <div className="section-title" style={{ marginBottom: 0 }}>Recent Logins</div>
          <button
            className="btn btn-clear-outline btn-sm"
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!loginLogs.length || isClearing}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-1px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            {isClearing ? 'Clearing...' : clearLabel}
          </button>
        </div>

      {loginLogs.length === 0 ? (
        <div className="empty-state login-activity-empty">
          <div className="icon login-activity-empty-icon">{emptyTitle}</div>
          <div>{emptyDescription}</div>
        </div>
      ) : (
        <div className="table-wrap login-activity-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Login</th><th>Logout</th><th>Duration</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loginLogs.map((log) => {
                const duration = log.logoutTime
                  ? formatDuration(log.loginTime, log.logoutTime)
                  : '-';

                return (
                  <tr key={log.id}>
                    <td><b>{log.user}</b></td>
                    <td><span className={`badge ${getRoleBadgeClass(log.role)}`}>{log.role}</span></td>
                    <td className="text-xs">{new Date(log.loginTime).toLocaleString()}</td>
                    <td className="text-xs">{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : '-'}</td>
                    <td>{duration}</td>
                    <td>{log.logoutTime ? <span className="badge badge-gray">Ended</span> : <span className="badge badge-green">Online</span>}</td>
                    <td>
                      <button
                        className="del-btn"
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingId === log.id}
                      >
                        {deletingId === log.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ClearConfirmModal
        open={showClearConfirm}
        loading={isClearing}
        title="Clear Login Activity"
        message={clearMessage}
        confirmLabel={clearLabel}
        onConfirm={handleClearLogs}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
    </>
  );
}
