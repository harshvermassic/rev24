import React, { useState } from 'react';
import { User, Moon, Sun, Bell, Flame, Shield, LogOut, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';

const AVATARS = ['🎓', '🧠', '🔬', '🚀', '📚', '⚡', '💡', '🌟'];

export const ProfileView = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { triggerCheck } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🎓');
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationSettings?.enabled !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');
    try {
      const res = await api.updateProfile({
        name,
        avatar,
        notificationSettings: {
          enabled: notifEnabled,
        },
      });
      if (res.success) {
        await refreshUser();
        setSaveMsg('Profile preferences updated!');
      }
    } catch (err) {
      setSaveMsg('Failed to update profile');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(''), 3500);
    }
  };

  return (
    <div className="main-content" style={{ paddingTop: 16 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="section-title">Profile & Settings</h2>
          <div className="section-subtitle">Manage preferences, theme & study notifications</div>
        </div>
      </div>

      {/* User Avatar & Streak Card */}
      <div
        style={{
          padding: 20,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '99px',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          {avatar}
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {user?.name || 'Student'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 6,
              padding: '3px 8px',
              borderRadius: 99,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-amber)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            <Flame size={14} />
            <span>{user?.streakCount || 0} Day Active Streak</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile}>
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Choose Avatar */}
        <div className="form-group">
          <label className="form-label">Select Avatar</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {AVATARS.map((av) => (
              <button
                type="button"
                key={av}
                onClick={() => setAvatar(av)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: '2px solid',
                  borderColor: avatar === av ? 'var(--primary)' : 'var(--border-subtle)',
                  background: avatar === av ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface-elevated)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Setting */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'dark' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="#f59e0b" />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Theme Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Currently: {theme === 'dark' ? 'Dark Mode (OLED Friendly)' : 'Light Mode'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="var(--primary)" />}
          </button>
        </div>

        {/* Notification Reminder Setting */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Daily Revision Notifications
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Morning reminders for Day 1, 3, 7, 14, 30 items
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifEnabled}
            onChange={(e) => setNotifEnabled(e.target.checked)}
            style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>

        {saveMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              fontSize: '0.82rem',
              marginBottom: 14,
              textAlign: 'center',
            }}
          >
            {saveMsg}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isSaving}
          style={{ marginBottom: 12 }}
        >
          <Check size={18} />
          <span>{isSaving ? 'Saving Preferences...' : 'Save Changes'}</span>
        </button>
      </form>

      {/* Logout button */}
      <button
        onClick={logout}
        style={{
          width: '100%',
          padding: 12,
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-rose)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 10,
        }}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
};
