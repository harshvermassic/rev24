import React, { useState } from 'react';
import { Calendar, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export const DateFilterBar = ({
  activePreset, // 'all', 'today', 'yesterday', 'this_week', 'this_month', 'custom'
  onSelectPreset,
  startDate,
  endDate,
  onDateChange,
  onReset,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(activePreset === 'custom');

  const presets = [
    { id: 'all', label: 'All Dates' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const handlePresetClick = (id) => {
    if (id === 'custom') {
      setShowCustomPicker(true);
      onSelectPreset('custom');
    } else {
      setShowCustomPicker(false);
      onSelectPreset(id);
    }
  };

  const isFiltered = activePreset !== 'all' || startDate || endDate;

  return (
    <div className="date-filter-container" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <Calendar size={15} color="var(--primary)" />
          <span>Filter Date-Wise</span>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--accent-rose)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            <X size={12} /> Reset Filter
          </button>
        )}
      </div>

      {/* Preset Pill Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {presets.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePresetClick(p.id)}
              className={`filter-pill-btn ${isActive ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full, 99px)',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                background: isActive ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker Accordion */}
      {showCustomPicker && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              className="form-input"
              value={startDate || ''}
              onChange={(e) => onDateChange(e.target.value, endDate)}
              style={{
                fontSize: '0.78rem',
                padding: '6px 8px',
                height: 34,
                borderRadius: 'var(--radius-sm)',
                flex: 1,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-input"
              value={endDate || ''}
              onChange={(e) => onDateChange(startDate, e.target.value)}
              style={{
                fontSize: '0.78rem',
                padding: '6px 8px',
                height: 34,
                borderRadius: 'var(--radius-sm)',
                flex: 1,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
