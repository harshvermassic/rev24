import React from 'react';
import { Menu, Sun, Moon, Bell, Maximize2, Minimize2, Home, BookOpen, CheckSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  onOpenDrawer,
  onOpenNotifications,
  onOpenProfile,
  isWideMode,
  onToggleWideMode,
  currentView,
  onSelectView,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <header className="top-nav">
      <div className="nav-left">
        <button
          id="drawer-toggle-btn"
          className="icon-btn"
          onClick={onOpenDrawer}
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div
          className="app-title-container"
          onClick={() => onSelectView && onSelectView('home')}
          style={{ cursor: 'pointer' }}
        >
          <span className="brand-badge">Ebbinghaus</span>
          <h1 style={{ fontSize: '1.08rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>
            Retain<span style={{ color: 'var(--primary)' }}>Curve</span>
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          <button
            onClick={() => onSelectView('home')}
            className={`desktop-nav-btn ${currentView === 'home' ? 'active' : ''}`}
          >
            <Home size={15} />
            <span>Today's Tasks</span>
          </button>
          <button
            onClick={() => onSelectView('learning')}
            className={`desktop-nav-btn ${currentView === 'learning' ? 'active' : ''}`}
          >
            <BookOpen size={15} />
            <span>Learning History</span>
          </button>
          <button
            onClick={() => onSelectView('history')}
            className={`desktop-nav-btn ${currentView === 'history' ? 'active' : ''}`}
          >
            <CheckSquare size={15} />
            <span>Retention & Stats</span>
          </button>
        </nav>
      </div>

      <div className="nav-right">
        {/* Toggle wide desktop mode / compact view */}
        <button
          id="toggle-wide-mode-btn"
          className="icon-btn"
          onClick={onToggleWideMode}
          title={isWideMode ? 'Switch to Compact Mobile View' : 'Switch to Wide Web View'}
        >
          {isWideMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Notification Bell */}
        <button
          id="notifications-bell-btn"
          className="icon-btn"
          onClick={onOpenNotifications}
          title="Notifications & Reminders"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        {/* Dark / Light Mode Switch */}
        <button
          id="theme-toggle-btn"
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
        </button>

        {/* Profile Button */}
        <button
          id="profile-nav-btn"
          className="icon-btn"
          onClick={onOpenProfile}
          title="Profile & Settings"
          aria-label="User Profile"
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{user?.avatar || '🎓'}</span>
        </button>
      </div>
    </header>
  );
};
