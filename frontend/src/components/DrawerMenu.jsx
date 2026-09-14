import React from 'react';
import { Home, BookOpen, CheckSquare, Bell, User, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const DrawerMenu = ({ isOpen, onClose, currentView, onSelectView }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  if (!isOpen) return null;

  const navItems = [
    { id: 'home', label: "Home (Today's Revision)", icon: Home },
    { id: 'learning', label: 'Learning History (Date-wise)', icon: BookOpen },
    { id: 'history', label: 'Todo History & Retention', icon: CheckSquare },
    { id: 'notifications', label: 'Notifications & Reminders', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-pane">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>{user?.avatar || '🎓'}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {user?.name || 'Guest Student'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Streak: {user?.streakCount || 0} days 🔥
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="drawer-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`drawer-link-${item.id}`}
                className={`drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
              >
                <Icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      background: 'var(--accent-rose)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Spaced repetition tip */}
        <div
          style={{
            marginTop: 'auto',
            padding: 14,
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
            💡 Forgetting Curve Rule:
          </strong>
          Reviewing on Day 1, 3, 7, 14, and 30 converts short-term knowledge into permanent recall!
        </div>

        {user && (
          <button
            id="drawer-logout-btn"
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 10,
              border: 'none',
              background: 'transparent',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </div>
    </>
  );
};
