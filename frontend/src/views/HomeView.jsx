import React, { useState } from 'react';
import { Check, Clock, Plus, BookOpen, AlertCircle, Sparkles, ChevronRight, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreakBanner } from '../components/StreakBanner';
import { ViewToggle } from '../components/ViewToggle';

export const HomeView = ({
  todayData,
  learningEntries = [],
  onCompleteTodo,
  onUncompleteTodo,
  onOpenAddModal,
  onSelectLearningEntry,
}) => {
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' or 'learning'
  const todos = todayData?.todos || [];
  const completedToday = todayData?.completedToday || [];
  const streakCount = todayData?.streakCount || 0;

  // Separate overdue todos vs today's scheduled todos
  const overdueTodos = todos.filter((t) => t.isOverdue);
  const dueTodayTodos = todos.filter((t) => !t.isOverdue);

  const handleToggleTodo = (todo) => {
    if (todo.status === 'done') {
      onUncompleteTodo && onUncompleteTodo(todo._id);
    } else {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
      onCompleteTodo && onCompleteTodo(todo._id);
    }
  };

  const getSubjectClass = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return 'subject-physics';
    if (s.includes('chem')) return 'subject-chemistry';
    if (s.includes('math')) return 'subject-maths';
    if (s.includes('bio')) return 'subject-biology';
    if (s.includes('code') || s.includes('prog')) return 'subject-coding';
    return 'subject-general';
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      {/* Date Header Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px 4px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{todayDateFormatted}</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Ebbinghaus 1-3-7-14-30 System
        </div>
      </div>

      {/* Streak Banner */}
      <StreakBanner
        streakCount={streakCount}
        pendingCount={todos.length}
        retentionScore={92}
      />

      {/* Wireframe View Switcher: Revision ToDo <-> Aaj Kya Padha */}
      <ViewToggle
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todoCount={todos.length}
        learnedCount={learningEntries.length}
      />

      <div className="main-content">
        {activeTab === 'todos' ? (
          /* ==========================================================
             REVISION TODOS (Categorized: Overdue, Due Today, Completed)
             ========================================================== */
          <>
            {/* OVERDUE REVISIONS SECTION */}
            {overdueTodos.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={16} color="var(--accent-rose)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                      Overdue Revisions ({overdueTodos.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    Immediate review recommended!
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overdueTodos.map((todo) => (
                    <div
                      key={todo._id}
                      id={`todo-card-${todo._id}`}
                      className="todo-card overdue"
                      style={{ borderLeft: '4px solid var(--accent-rose)' }}
                    >
                      <div className="todo-left" style={{ width: '100%' }}>
                        <button
                          id={`check-todo-${todo._id}`}
                          className="check-trigger"
                          onClick={() => handleToggleTodo(todo)}
                          title="Mark as Revised"
                          aria-label="Complete revision"
                        >
                          <Check size={16} />
                        </button>

                        <div className="todo-info" style={{ flex: 1 }}>
                          <div className="todo-meta-row">
                            <span className={`subject-badge ${getSubjectClass(todo.subject)}`}>
                              {todo.subject}
                            </span>
                            <span className={`interval-pill day-${todo.intervalDay}`}>
                              Day {todo.intervalDay}
                            </span>
                            <span className="overdue-tag">
                              Overdue by {todo.daysOverdue}d
                            </span>
                          </div>

                          <div className="todo-topic">{todo.topic}</div>

                          {todo.notes && (
                            <div className="todo-notes-preview">
                              📝 {todo.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DUE TODAY SECTION */}
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Sparkles size={18} color="var(--primary)" />
                  <span>Today's Due Revisions</span>
                </h2>
                <div className="section-subtitle">
                  Scheduled for today by Ebbinghaus Forgetting Curve
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                {dueTodayTodos.length} Due
              </span>
            </div>

            {dueTodayTodos.length === 0 && overdueTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <div className="empty-title">All Revisions Completed!</div>
                <div className="empty-desc">
                  No revisions pending for today. Tap the <strong>+</strong> button below to log what you studied today and schedule your next forgetting curve milestones!
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="btn-primary"
                  style={{ maxWidth: 220, marginTop: 8 }}
                >
                  <Plus size={16} /> Log Today's Study
                </button>
              </div>
            ) : dueTodayTodos.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                }}
              >
                ✅ All regular revisions for today are done! Only overdue items remain above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dueTodayTodos.map((todo) => (
                  <div
                    key={todo._id}
                    id={`todo-card-${todo._id}`}
                    className="todo-card due-today"
                    style={{ borderLeft: '4px solid var(--primary)' }}
                  >
                    <div className="todo-left" style={{ width: '100%' }}>
                      <button
                        id={`check-todo-${todo._id}`}
                        className="check-trigger"
                        onClick={() => handleToggleTodo(todo)}
                        title="Mark as Revised"
                        aria-label="Complete revision"
                      >
                        <Check size={16} />
                      </button>

                      <div className="todo-info" style={{ flex: 1 }}>
                        <div className="todo-meta-row">
                          <span className={`subject-badge ${getSubjectClass(todo.subject)}`}>
                            {todo.subject}
                          </span>

                          <span className={`interval-pill day-${todo.intervalDay}`}>
                            Day {todo.intervalDay}
                          </span>

                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                              background: 'rgba(99, 102, 241, 0.12)',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            Due Today
                          </span>
                        </div>

                        <div className="todo-topic">{todo.topic}</div>

                        {todo.notes && (
                          <div className="todo-notes-preview">
                            📝 {todo.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COMPLETED TODAY SECTION */}
            {completedToday.length > 0 && (
              <div style={{ marginTop: 26 }}>
                <div className="section-header" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      Completed Today ({completedToday.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Streak updated 🔥
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedToday.map((todo) => (
                    <div
                      key={todo._id}
                      className="todo-card completed"
                      style={{ padding: '10px 14px', borderLeft: '4px solid var(--accent-emerald)' }}
                    >
                      <div className="todo-left" style={{ width: '100%' }}>
                        <button
                          className="check-trigger checked"
                          onClick={() => handleToggleTodo(todo)}
                          title="Click to undo"
                        >
                          <Check size={16} />
                        </button>
                        <div className="todo-info" style={{ flex: 1 }}>
                          <div className="todo-meta-row">
                            <span className={`subject-badge ${getSubjectClass(todo.subject)}`}>
                              {todo.subject}
                            </span>
                            <span className="interval-pill">Day {todo.intervalDay}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              Revised today ✓
                            </span>
                          </div>
                          <div className="todo-topic strike">{todo.topic}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ==========================================================
             AAJ KYA PADHA (Today / Recent Learning Entries)
             ========================================================== */
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <BookOpen size={18} color="var(--primary)" />
                  <span>Aaj Kya Padha (Study Log)</span>
                </h2>
                <div className="section-subtitle">
                  Topics you studied with auto-generated 1-3-7-14-30 curve timelines
                </div>
              </div>
              <button
                id="quick-add-learning-btn"
                onClick={onOpenAddModal}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={15} /> Add New
              </button>
            </div>

            {learningEntries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <div className="empty-title">No Study Sessions Recorded</div>
                <div className="empty-desc">
                  Log your first study topic to activate the 1-3-7-14-30 forgetting curve revision system!
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="btn-primary"
                  style={{ maxWidth: 220, marginTop: 8 }}
                >
                  <Plus size={16} /> Add First Topic
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {learningEntries.slice(0, 10).map((entry) => {
                  const compCount = entry.completedRevisions || 0;
                  const totalCount = entry.totalRevisions || 5;
                  const isFullyCompleted = compCount === totalCount;

                  return (
                    <div
                      key={entry._id}
                      className="todo-card"
                      style={{ cursor: 'pointer', padding: '14px 16px' }}
                      onClick={() => onSelectLearningEntry && onSelectLearningEntry(entry)}
                    >
                      <div className="todo-info" style={{ width: '100%' }}>
                        <div className="todo-meta-row">
                          <span className={`subject-badge ${getSubjectClass(entry.subject)}`}>
                            {entry.subject}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Learned: {new Date(entry.learnedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: isFullyCompleted ? 'var(--accent-emerald)' : 'var(--primary)',
                              background: isFullyCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                              padding: '2px 8px',
                              borderRadius: 99,
                            }}
                          >
                            {compCount}/{totalCount} Revisions
                          </span>
                        </div>
                        <div className="todo-topic" style={{ fontSize: '1rem', marginTop: 4 }}>
                          {entry.topic}
                        </div>
                        {entry.notes && (
                          <div className="todo-notes-preview" style={{ marginTop: 4 }}>
                            📝 {entry.notes}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: 8 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        id="fab-add-learning-btn"
        className="fab-btn"
        onClick={onOpenAddModal}
        title="Add Today's Study Topic"
        aria-label="Add study topic"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
