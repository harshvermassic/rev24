import React, { useState } from 'react';
import { X, Plus, Calendar, BookOpen, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const QUICK_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Coding', 'English'];

export const AddLearningModal = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [learnedDate, setLearnedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate upcoming revision dates based on 1, 3, 7, 14, 30 rule
  const calculateSchedule = (baseDateStr) => {
    let base;
    if (baseDateStr && baseDateStr.includes('-')) {
      const parts = baseDateStr.split('-');
      base = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      base = new Date(baseDateStr || Date.now());
    }
    const intervals = [1, 3, 7, 14, 30];
    return intervals.map((day) => {
      const d = new Date(base);
      d.setDate(d.getDate() + day);
      return {
        interval: day,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });
  };

  const schedulePreview = calculateSchedule(learnedDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setError('Please provide both a subject and topic.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.createLearningEntry({
        subject,
        topic,
        learnedDate,
        notes,
        intervals: [1, 3, 7, 14, 30],
      });

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });

        onSuccess && onSuccess(res);
        onClose();
        // Reset form
        setTopic('');
        setNotes('');
      } else {
        setError(res.message || 'Failed to save entry');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
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
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="modal-title">Aaj Kya Padha?</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Add new study topic to schedule 5 spaced revisions
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
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
          {/* Quick Subject Select & Custom Input */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {QUICK_SUBJECTS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSubject(s)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 99,
                    border: '1px solid',
                    borderColor: subject === s ? 'var(--primary)' : 'var(--border-subtle)',
                    background: subject === s ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface-elevated)',
                    color: subject === s ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              id="input-learning-subject"
              type="text"
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics, Organic Chemistry, etc."
              required
            />
          </div>

          {/* Topic */}
          <div className="form-group">
            <label className="form-label">Topic / Concept Name</label>
            <input
              id="input-learning-topic"
              type="text"
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's Three Laws of Motion"
              required
            />
          </div>

          {/* Date Studied */}
          <div className="form-group">
            <label className="form-label">Date Studied</label>
            <input
              id="input-learning-date"
              type="date"
              className="form-input"
              value={learnedDate}
              onChange={(e) => setLearnedDate(e.target.value)}
              required
            />
          </div>

          {/* Key Notes / Formulas */}
          <div className="form-group">
            <label className="form-label">Key Notes / Formulas (Optional)</label>
            <textarea
              id="input-learning-notes"
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary, key formulas (e.g. F=ma, Action-Reaction), reference page..."
            />
          </div>

          {/* Forgetting Curve Auto-Schedule Preview */}
          <div className="curve-preview-card">
            <div className="curve-preview-title">
              <Sparkles size={14} />
              <span>Forgetting Curve Schedule (1-3-7-14-30 Rule)</span>
            </div>
            <div className="curve-timeline">
              {schedulePreview.map((item) => (
                <div key={item.interval} className="curve-step">
                  <span className={`interval-pill day-${item.interval}`}>
                    Day {item.interval}
                  </span>
                  <div className="step-dot" />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {item.dateStr}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              5 Revision todos will be generated automatically in MongoDB!
            </div>
          </div>

          <button
            id="submit-learning-btn"
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            <Plus size={18} />
            <span>{isSubmitting ? 'Scheduling Revisions...' : 'Schedule 5 Revisions'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
