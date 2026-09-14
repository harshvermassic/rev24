import React, { useState } from 'react';
import { Bell, CheckCheck, X, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationModal = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerCheck,
    browserPermission,
    requestBrowserPermission,
  } = useNotifications();

  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setIsTriggering(true);
    setTriggerMsg('');
    try {
      const res = await triggerCheck();
      if (res && res.success) {
        setTriggerMsg('Daily check complete! Fresh due revisions synced.');
      }
    } catch (err) {
      setTriggerMsg('Check failed');
    } finally {
      setIsTriggering(false);
      setTimeout(() => setTriggerMsg(''), 4000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h2 className="modal-title">Revision Reminders</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {browserPermission !== 'granted' && (
          <div
            style={{
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 8,
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enable browser desktop alerts for study reminders
            </div>
            <button
              id="enable-browser-push-btn"
              onClick={requestBrowserPermission}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Allow Alerts
            </button>
          </div>
        )}

        {/* Action buttons: Mark all read & Test check */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 10,
          }}
        >
          <button
            id="mark-all-read-btn"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: unreadCount === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: unreadCount === 0 ? 'default' : 'pointer',
            }}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>

          <button
            id="test-daily-cron-btn"
            onClick={handleManualCheck}
            disabled={isTriggering}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-emerald)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>{isTriggering ? 'Checking...' : 'Run Daily Check'}</span>
          </button>
        </div>

        {triggerMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              fontSize: '0.78rem',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {triggerMsg}
          </div>
        )}

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div style={{ fontSize: '2.4rem' }}>🔕</div>
              <div className="empty-title">No Notifications Yet</div>
              <div className="empty-desc">
                When spaced revisions are due, alerts and daily reminders will appear right here.
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: notif.isRead ? 'var(--bg-surface-elevated)' : 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid',
                  borderColor: notif.isRead ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: notif.isRead ? 'transparent' : 'var(--primary)',
                    marginTop: 6,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
