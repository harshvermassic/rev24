import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const demoEmail = 'student@retaincurve.demo';
      const demoPassword = 'demopassword123';
      let res = await login(demoEmail, demoPassword);
      if (!res.success) {
        // Create demo user if doesn't exist yet
        res = await register('Harsh Study Pro', demoEmail, demoPassword);
      }
      if (res.success) {
        onClose();
      }
    } catch (e) {
      setError('Demo login error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isRegister
                ? 'Sign up to track your forgetting curve revisions'
                : 'Sign in to sync your study progress with MongoDB'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div
          style={{
            padding: 12,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              ⚡ Instant Evaluation Mode
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Try with preloaded study topics & revisions
            </div>
          </div>
          <button
            id="demo-account-login-btn"
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Demo Login
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-name-input"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harsh Sharma"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="auth-email-input"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="auth-password-input"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
