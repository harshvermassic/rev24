import React, { useState, useMemo } from 'react';
import { Search, Calendar, CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp, AlertCircle, Plus, BookOpen, Check, X } from 'lucide-react';
import { DateFilterBar } from '../components/DateFilterBar';
import { api } from '../services/api';

export const LearningHistoryView = ({ entries = [], onRefresh, onOpenAddModal, onCompleteTodo, onUncompleteTodo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Extract unique subjects with counts
  const subjectCounts = useMemo(() => {
    const counts = { all: entries.length };
    entries.forEach((e) => {
      const s = e.subject || 'General';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [entries]);

  const subjects = Object.keys(subjectCounts);

  // Helper date normalization
  const getDateKey = (dateInput) => {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayKey = getDateKey(new Date());
  const yesterdayKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getDateKey(d);
  })();

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Subject filter
      if (selectedSubject !== 'all' && entry.subject?.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // 2. Search query filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTopic = entry.topic?.toLowerCase().includes(query);
        const matchesSubj = entry.subject?.toLowerCase().includes(query);
        const matchesNotes = entry.notes?.toLowerCase().includes(query);
        if (!matchesTopic && !matchesSubj && !matchesNotes) return false;
      }

      // 3. Date filter
      const entryDateKey = getDateKey(entry.learnedDate);
      const entryTime = new Date(entry.learnedDate).getTime();

      if (datePreset === 'today') {
        return entryDateKey === todayKey;
      } else if (datePreset === 'yesterday') {
        return entryDateKey === yesterdayKey;
      } else if (datePreset === 'this_week') {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() || 7) + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        return entryTime >= startOfWeek.getTime();
      } else if (datePreset === 'this_month') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        return entryTime >= startOfMonth.getTime();
      } else if (datePreset === 'custom' || startDate || endDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (entryTime < start.getTime()) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (entryTime > end.getTime()) return false;
        }
      }

      return true;
    });
  }, [entries, selectedSubject, searchTerm, datePreset, startDate, endDate, todayKey, yesterdayKey]);

  // Group filtered entries by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredEntries.forEach((entry) => {
      const key = getDateKey(entry.learnedDate);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });

    // Sort descending by date
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => {
      let label = key;
      if (key === todayKey) {
        label = 'Today';
      } else if (key === yesterdayKey) {
        label = 'Yesterday';
      } else {
        const d = new Date(key);
        label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return {
        dateKey: key,
        dateLabel: label,
        entries: groups[key],
      };
    });
  }, [filteredEntries, todayKey, yesterdayKey]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this learning entry and its 5 scheduled revisions?')) {
      try {
        await api.deleteLearningEntry(id);
        onRefresh && onRefresh();
      } catch (err) {
        alert('Failed to delete entry');
      }
    }
  };

  const handleToggleTodoStatus = async (todo, e) => {
    e.stopPropagation();
    try {
      setIsActionLoading(true);
      if (todo.status === 'done') {
        await api.uncompleteTodo(todo._id);
      } else {
        await api.completeTodo(todo._id);
      }
      onRefresh && onRefresh();
    } catch (err) {
      console.error('Error toggling todo:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getSubjectColor = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return { bg: 'rgba(56, 189, 248, 0.15)', text: '#0284c7', border: '#38bdf8' };
    if (s.includes('chem')) return { bg: 'rgba(244, 63, 94, 0.15)', text: '#e11d48', border: '#f43f5e' };
    if (s.includes('math')) return { bg: 'rgba(168, 85, 247, 0.15)', text: '#9333ea', border: '#a855f7' };
    if (s.includes('bio')) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669', border: '#10b981' };
    if (s.includes('code') || s.includes('prog')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: '#f59e0b' };
    return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', border: '#6366f1' };
  };

  return (
    <div className="main-content" style={{ paddingTop: 16 }}>
      {/* Header with Title & Action */}
      <div className="section-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="section-title">
            <BookOpen size={20} color="var(--primary)" />
            <span>Date-Wise Learning History</span>
          </h2>
          <div className="section-subtitle">
            Everything you studied organized chronologically with 1-3-7-14-30 curve progress
          </div>
        </div>
        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Plus size={16} /> Log Study
        </button>
      </div>

      {/* 1. Date-Wise Filter Bar */}
      <DateFilterBar
        activePreset={datePreset}
        onSelectPreset={(preset) => {
          setDatePreset(preset);
          if (preset !== 'custom') {
            setStartDate('');
            setEndDate('');
          }
        }}
        startDate={startDate}
        endDate={endDate}
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setDatePreset('custom');
        }}
        onReset={handleResetFilters}
      />

      {/* 2. Search Input with Clear Button */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          id="search-learning-history-input"
          type="text"
          className="form-input"
          placeholder="Search topic, subject, formulas or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: 38, paddingRight: searchTerm ? 36 : 14, height: 42 }}
        />
        <Search
          size={18}
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
            <X size={16} />
          </button>
        )}
      </div>

      {/* 3. Subject Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          scrollbarWidth: 'none',
        }}
      >
        {subjects.map((subj) => {
          const isActive = selectedSubject.toLowerCase() === subj.toLowerCase();
          const count = subjectCounts[subj] || 0;
          return (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full, 99px)',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                background: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{subj}</span>
              <span
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                  padding: '1px 6px',
                  borderRadius: 99,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Filter Results Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'topic' : 'topics'} across {groupedByDate.length} {groupedByDate.length === 1 ? 'day' : 'days'}
        </span>
        {(datePreset !== 'all' || selectedSubject !== 'all' || searchTerm) && (
          <button
            onClick={handleResetFilters}
            style={{
              fontSize: '0.74rem',
              color: 'var(--primary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* 5. Date-Grouped Study Timelines */}
      {groupedByDate.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No Study Sessions Found</div>
          <div className="empty-desc">
            {searchTerm || datePreset !== 'all' || selectedSubject !== 'all'
              ? 'No learning records match your active filters. Try resetting the filters.'
              : 'You haven’t logged any study sessions yet. Log what you studied today to automatically generate your 1-3-7-14-30 revision plan!'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {(searchTerm || datePreset !== 'all' || selectedSubject !== 'all') ? (
              <button onClick={handleResetFilters} className="btn-primary" style={{ padding: '8px 16px' }}>
                Reset Filters
              </button>
            ) : (
              <button onClick={onOpenAddModal} className="btn-primary" style={{ padding: '8px 16px' }}>
                <Plus size={16} /> Log Today's Study
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groupedByDate.map((group) => (
            <div key={group.dateKey} className="date-group-section">
              {/* Clean Date Divider Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                  padding: '4px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: group.dateLabel === 'Today' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                    border: '1px solid',
                    borderColor: group.dateLabel === 'Today' ? 'var(--primary)' : 'var(--border-subtle)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: group.dateLabel === 'Today' ? 'var(--primary)' : 'var(--text-primary)',
                  }}
                >
                  <Calendar size={14} />
                  <span>{group.dateLabel}</span>
                </div>
                <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {group.entries.length} {group.entries.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              {/* Entries for this Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.entries.map((entry) => {
                  const isExpanded = expandedId === entry._id;
                  const colors = getSubjectColor(entry.subject);
                  const completionRate = entry.totalRevisions > 0
                    ? Math.round((entry.completedRevisions / entry.totalRevisions) * 100)
                    : 0;

                  return (
                    <div
                      key={entry._id}
                      id={`learning-card-${entry._id}`}
                      className="todo-card"
                      style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: 'pointer',
                        padding: '14px 16px',
                        borderLeft: `4px solid ${colors.border}`,
                        background: 'var(--bg-surface)',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : entry._id)}
                    >
                      {/* Top Row: Subject Badge + Title + Revision Progress + Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div className="todo-meta-row" style={{ marginBottom: 6 }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                              }}
                            >
                              {entry.subject}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              Learned: {new Date(entry.learnedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {entry.topic}
                          </div>
                          {entry.notes && (
                            <div className="todo-notes-preview" style={{ marginTop: 6 }}>
                              📝 {entry.notes}
                            </div>
                          )}
                        </div>

                        {/* Action buttons on right */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: completionRate === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                              color: completionRate === 100 ? 'var(--accent-emerald)' : 'var(--primary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {entry.completedRevisions || 0}/{entry.totalRevisions || 5} Rev ({completionRate}%)
                          </span>

                          <button
                            className="icon-btn"
                            onClick={(e) => handleDelete(entry._id, e)}
                            title="Delete Topic"
                            style={{ width: 32, height: 32 }}
                          >
                            <Trash2 size={15} color="var(--accent-rose)" />
                          </button>

                          <div style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </div>

                      {/* Mini 5-stage Progress Bar */}
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            height: 5,
                            borderRadius: 99,
                            background: 'var(--border-subtle)',
                            overflow: 'hidden',
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${completionRate}%`,
                              background: completionRate === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--primary), var(--accent-purple))',
                              borderRadius: 99,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>

                        {/* 5-step interval pills summary */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(entry.todos || []).map((todo) => {
                            const isDone = todo.status === 'done';
                            const schedDate = new Date(todo.scheduledDate);
                            const isToday = getDateKey(schedDate) === todayKey;
                            const isOverdue = !isDone && schedDate < new Date().setHours(0, 0, 0, 0);

                            let pillBg = 'var(--bg-surface-elevated)';
                            let pillColor = 'var(--text-secondary)';
                            let pillBorder = 'var(--border-subtle)';

                            if (isDone) {
                              pillBg = 'rgba(16, 185, 129, 0.15)';
                              pillColor = 'var(--accent-emerald)';
                              pillBorder = 'rgba(16, 185, 129, 0.3)';
                            } else if (isOverdue) {
                              pillBg = 'rgba(244, 63, 94, 0.15)';
                              pillColor = 'var(--accent-rose)';
                              pillBorder = 'rgba(244, 63, 94, 0.3)';
                            } else if (isToday) {
                              pillBg = 'rgba(99, 102, 241, 0.2)';
                              pillColor = 'var(--primary)';
                              pillBorder = 'var(--primary)';
                            }

                            return (
                              <span
                                key={todo._id || todo.intervalDay}
                                style={{
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: pillBg,
                                  color: pillColor,
                                  border: `1px solid ${pillBorder}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <span>Day {todo.intervalDay}</span>
                                {isDone && '✓'}
                                {isOverdue && '!'}
                                {isToday && '⚡'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expandable Detailed 5-Stage Schedule with interactive completion */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: 14,
                            paddingTop: 12,
                            borderTop: '1px dashed var(--border-subtle)',
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                            📅 5-Stage Revision Schedule (Forgetting Curve):
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(entry.todos || []).map((todo) => {
                              const isDone = todo.status === 'done';
                              const schedDate = new Date(todo.scheduledDate);
                              const isToday = getDateKey(schedDate) === todayKey;
                              const isOverdue = !isDone && schedDate < new Date().setHours(0, 0, 0, 0);

                              const dateFormatted = schedDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              });

                              return (
                                <div
                                  key={todo._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)',
                                    border: '1px solid',
                                    borderColor: isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <button
                                      disabled={isActionLoading}
                                      onClick={(e) => handleToggleTodoStatus(todo, e)}
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 'var(--radius-full, 99px)',
                                        border: '1.5px solid',
                                        borderColor: isDone ? 'var(--accent-emerald)' : 'var(--border-focus)',
                                        background: isDone ? 'var(--accent-emerald)' : 'transparent',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {isDone && <Check size={14} />}
                                    </button>

                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                          Revision Day {todo.intervalDay}
                                        </span>
                                        {isOverdue && (
                                          <span style={{ fontSize: '0.68rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                                            (Overdue)
                                          </span>
                                        )}
                                        {isToday && (
                                          <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700 }}>
                                            (Due Today ⚡)
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        Scheduled: {dateFormatted}
                                        {isDone && todo.completedAt && (
                                          <span> • Completed on {new Date(todo.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      color: isDone ? 'var(--accent-emerald)' : isOverdue ? 'var(--accent-rose)' : 'var(--text-muted)',
                                    }}
                                  >
                                    {isDone ? 'Completed' : isOverdue ? 'Action Needed' : isToday ? 'Due Today' : 'Upcoming'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
