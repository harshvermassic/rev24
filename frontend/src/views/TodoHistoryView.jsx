import React, { useState, useEffect, useMemo } from 'react';
import { Award, CheckCircle2, Clock, AlertTriangle, Filter, Search, Check, RefreshCw, X, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DateFilterBar } from '../components/DateFilterBar';
import { ForgettingCurveVisualizer } from '../components/ForgettingCurveVisualizer';
import { api } from '../services/api';

export const TodoHistoryView = ({ onTodoChanged }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'done', 'pending', 'overdue'
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getTodoHistory({
        status: statusFilter,
        subject: selectedSubject,
        search: searchTerm,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        datePreset: datePreset !== 'custom' ? datePreset : undefined,
      });
      if (res.success) {
        setHistoryData(res);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [statusFilter, selectedSubject, searchTerm, datePreset, startDate, endDate]);

  const stats = historyData?.stats || {
    totalScheduled: 0,
    totalCompleted: 0,
    totalPending: 0,
    totalOverdue: 0,
    retentionScore: 0,
  };

  const subjectBreakdown = historyData?.subjectBreakdown || [];
  const todos = historyData?.todos || [];

  const handleToggleTodo = async (todo) => {
    try {
      if (todo.status === 'done') {
        await api.uncompleteTodo(todo._id);
      } else {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
        await api.completeTodo(todo._id);
      }
      loadHistory();
      onTodoChanged && onTodoChanged();
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedSubject('all');
    setSearchTerm('');
  };

  // Helper date normalization
  const getDateKey = (dateInput) => {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayKey = getDateKey(new Date());
  const tomorrowKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getDateKey(d);
  })();

  // Group todos logically: Overdue, Today, Tomorrow/Upcoming, Completed
  const organizedGroups = useMemo(() => {
    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    todos.forEach((t) => {
      if (t.status === 'done') {
        completed.push(t);
      } else if (t.isOverdue) {
        overdue.push(t);
      } else {
        const schedKey = getDateKey(t.scheduledDate);
        if (schedKey === todayKey) {
          today.push(t);
        } else {
          upcoming.push(t);
        }
      }
    });

    const groups = [];
    if (overdue.length > 0) {
      groups.push({
        id: 'overdue',
        title: '⚠️ Overdue Revisions',
        subtitle: 'Scheduled date has passed — revise now to prevent memory decay!',
        badgeClass: 'overdue',
        badgeText: `${overdue.length} Action Needed`,
        items: overdue,
        borderColor: 'var(--accent-rose)',
      });
    }

    if (today.length > 0) {
      groups.push({
        id: 'today',
        title: "⚡ Today's Scheduled Revisions",
        subtitle: 'Due today based on your forgetting curve intervals',
        badgeClass: 'due-today',
        badgeText: `${today.length} Due`,
        items: today,
        borderColor: 'var(--primary)',
      });
    }

    if (upcoming.length > 0) {
      groups.push({
        id: 'upcoming',
        title: '📅 Upcoming Scheduled Revisions',
        subtitle: 'Future curve intervals (Days 3, 7, 14, 30)',
        badgeClass: 'upcoming',
        badgeText: `${upcoming.length} Scheduled`,
        items: upcoming,
        borderColor: 'var(--accent-cyan)',
      });
    }

    if (completed.length > 0) {
      groups.push({
        id: 'completed',
        title: '✅ Completed Revisions History',
        subtitle: 'Successfully reviewed concepts retained in memory',
        badgeClass: 'done',
        badgeText: `${completed.length} Retained`,
        items: completed,
        borderColor: 'var(--accent-emerald)',
      });
    }

    return groups;
  }, [todos, todayKey]);

  return (
    <div className="main-content" style={{ paddingTop: 16 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="section-title">
            <Award size={20} color="var(--primary)" />
            <span>Revision History & Retention</span>
          </h2>
          <div className="section-subtitle">
            Track spaced repetition adherence, overdue items, and subject mastery
          </div>
        </div>
        <button
          onClick={loadHistory}
          className="icon-btn"
          title="Refresh Data"
          style={{ width: 36, height: 36 }}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* Retention Score */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              RETENTION SCORE
            </span>
            <Award size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {stats.retentionScore}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {stats.totalCompleted} of {stats.totalScheduled} retained
          </div>
        </div>

        {/* Pending Revisions */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              PENDING
            </span>
            <Clock size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {stats.totalPending}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            In current cycle
          </div>
        </div>

        {/* Overdue Revisions */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(245, 158, 11, 0.1))',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              OVERDUE
            </span>
            <AlertTriangle size={16} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
            {stats.totalOverdue}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Needs attention
          </div>
        </div>
      </div>

      {/* Interactive Ebbinghaus Forgetting Curve Explainer */}
      <ForgettingCurveVisualizer />

      {/* Subject Retention Breakdown (e.g. Physics: 8/10 revisions on time) */}
      {subjectBreakdown.length > 0 && (
        <div
          style={{
            marginBottom: 18,
            padding: 14,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Subject Retention Performance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {subjectBreakdown.map((item) => (
              <div key={item.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {item.subject}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {item.completed}/{item.total} Revisions ({item.retentionRate}%)
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: item.retentionRate > 70 ? 'var(--accent-emerald)' : 'var(--primary)',
                      width: `${item.retentionRate}%`,
                      borderRadius: 99,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Date-Wise Filter Component */}
      <DateFilterBar
        activePreset={datePreset}
        onSelectPreset={(p) => {
          setDatePreset(p);
          if (p !== 'custom') {
            setStartDate('');
            setEndDate('');
          }
        }}
        startDate={startDate}
        endDate={endDate}
        onDateChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
          setDatePreset('custom');
        }}
        onReset={handleResetFilters}
      />

      {/* 2. Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'All Status' },
          { id: 'pending', label: 'Pending Only' },
          { id: 'overdue', label: 'Overdue Only' },
          { id: 'done', label: 'Completed Only' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: statusFilter === tab.id ? 'var(--primary)' : 'var(--border-subtle)',
              background: statusFilter === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
              color: statusFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search Bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search revision topic, subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: 38, paddingRight: searchTerm ? 36 : 14, height: 40 }}
        />
        <Search
          size={17}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: 12, top: 12 }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 4. Organized Revision Groups */}
      {todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Revisions Found</div>
          <div className="empty-desc">
            {searchTerm || datePreset !== 'all' || statusFilter !== 'all'
              ? 'No revisions match the selected filters. Try clearing your filters.'
              : 'No scheduled revisions found. Once you log learning topics, forgetting curve revision todos will appear here.'}
          </div>
          {(searchTerm || datePreset !== 'all' || statusFilter !== 'all') && (
            <button onClick={handleResetFilters} className="btn-primary" style={{ marginTop: 12 }}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {organizedGroups.map((group) => (
            <div key={group.id} className="todo-group-section">
              {/* Group Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `2px solid ${group.borderColor}`,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {group.title}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {group.subtitle}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {group.badgeText}
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((todo) => {
                  const isDone = todo.status === 'done';
                  const schedDate = new Date(todo.scheduledDate);
                  const schedStr = schedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  const compStr = todo.completedAt
                    ? new Date(todo.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : null;

                  return (
                    <div
                      key={todo._id}
                      className={`todo-card ${isDone ? 'completed' : todo.isOverdue ? 'overdue' : ''}`}
                      style={{
                        padding: '12px 14px',
                        borderLeft: todo.isOverdue && !isDone
                          ? '4px solid var(--accent-rose)'
                          : isDone
                          ? '4px solid var(--accent-emerald)'
                          : '4px solid var(--primary)',
                      }}
                    >
                      <div className="todo-left" style={{ width: '100%' }}>
                        <button
                          className={`check-trigger ${isDone ? 'checked' : ''}`}
                          onClick={() => handleToggleTodo(todo)}
                          title={isDone ? 'Click to uncheck' : 'Click to complete'}
                          aria-label="Toggle completion"
                        >
                          <Check size={16} />
                        </button>

                        <div className="todo-info" style={{ flex: 1 }}>
                          <div className="todo-meta-row" style={{ marginBottom: 4 }}>
                            <span className="subject-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)' }}>
                              {todo.subject}
                            </span>
                            <span className={`interval-pill day-${todo.intervalDay}`}>
                              Day {todo.intervalDay}
                            </span>
                            {todo.isOverdue && !isDone && (
                              <span className="overdue-tag">
                                Overdue ({todo.daysOverdue}d)
                              </span>
                            )}
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              {isDone ? `Done on ${compStr}` : `Due: ${schedStr}`}
                            </span>
                          </div>

                          <div className={`todo-topic ${isDone ? 'strike' : ''}`} style={{ fontSize: '0.94rem' }}>
                            {todo.topic}
                          </div>

                          {todo.notes && (
                            <div className="todo-notes-preview" style={{ marginTop: 4 }}>
                              📝 {todo.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
