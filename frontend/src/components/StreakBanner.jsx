import React from 'react';
import { Award, Zap } from 'lucide-react';

export const StreakBanner = ({ streakCount = 0, retentionScore = 85, pendingCount = 0 }) => {
  return (
    <div className="streak-card">
      <div className="streak-left">
        <span className="streak-label">Daily Revision Streak</span>
        <div className="streak-number-row">
          <span className="streak-count">{streakCount}</span>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Days Active
          </span>
          <span className="streak-fire">🔥</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {pendingCount > 0
            ? `${pendingCount} revision${pendingCount > 1 ? 's' : ''} scheduled for today`
            : '✨ All revisions up to date! Great job!'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div className="retention-pill">
          <Zap size={14} />
          <span>{retentionScore}% Memory</span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          Ebbinghaus Curve
        </span>
      </div>
    </div>
  );
};
