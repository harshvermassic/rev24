import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Brain, CheckCircle2 } from 'lucide-react';

export const ForgettingCurveVisualizer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(1);

  const milestones = [
    {
      day: 1,
      title: 'Review 1 — 24 Hours Later',
      retention: '100% Retained',
      decayWithout: 'Drops to ~45%',
      benefit: 'Immediate Interruption of Steep Decay',
      desc: 'The brain discards ~50% of new information within 24 hours. A quick 10-minute review on Day 1 arrests this sharp decline and signals high importance to the hippocampus.',
      color: '#38bdf8',
    },
    {
      day: 3,
      title: 'Review 2 — 3 Days Later',
      retention: '100% Retained',
      decayWithout: 'Drops to ~35%',
      benefit: 'Synaptic Consolidation',
      desc: 'By Day 3, fragile neural links start to fade again. This 2nd touchpoint reactivates the memory trace, making the decay slope significantly flatter.',
      color: '#818cf8',
    },
    {
      day: 7,
      title: 'Review 3 — 1 Week Later',
      retention: '100% Retained',
      decayWithout: 'Drops to ~25%',
      benefit: 'Medium-Term Memory Formation',
      desc: 'After 7 days, your recall has stabilized. Reviewing now takes only a few minutes, yet doubles the duration the concept stays easily accessible.',
      color: '#a855f7',
    },
    {
      day: 14,
      title: 'Review 4 — 2 Weeks Later',
      retention: '100% Retained',
      decayWithout: 'Drops to ~18%',
      benefit: 'Long-Term Storage Migration',
      desc: 'Information shifts from temporary working buffers into long-term neocortical memory structures.',
      color: '#ec4899',
    },
    {
      day: 30,
      title: 'Review 5 — 1 Month Later',
      retention: '>95% Permanent Recall',
      decayWithout: 'Drops to <10%',
      benefit: 'Permanent Concept Retention',
      desc: 'The 30-day review locks the concept into permanent memory. You can now recall formulas, rules, and topics months later during final exams or interviews with ease!',
      color: '#f59e0b',
    },
  ];

  const currentInfo = milestones.find((m) => m.day === selectedMilestone) || milestones[0];

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 16,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            How Ebbinghaus Forgetting Curve Works (1-3-7-14-30 Rule)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isExpanded ? 'Collapse' : 'Explain System'}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Interactive Body */}
      {isExpanded && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Visual SVG Curve Diagram */}
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                RETENTION VS TIME (DAYS)
              </span>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 2, background: 'var(--accent-rose)', display: 'inline-block' }} /> No Review (~10%)
                </span>
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 2, background: 'var(--accent-emerald)', display: 'inline-block' }} /> 1-3-7-14-30 Reviews (&gt;95%)
                </span>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <svg viewBox="0 0 460 140" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="440" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="440" y2="65" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="440" y2="110" stroke="var(--border-subtle)" />

              {/* Axis Labels */}
              <text x="32" y="24" fill="var(--text-muted)" fontSize="9" textAnchor="end">100%</text>
              <text x="32" y="69" fill="var(--text-muted)" fontSize="9" textAnchor="end">50%</text>
              <text x="32" y="114" fill="var(--text-muted)" fontSize="9" textAnchor="end">0%</text>

              {/* Days X Axis */}
              <text x="50" y="125" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Day 0</text>
              <text x="110" y="125" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">Day 1</text>
              <text x="180" y="125" fill="#818cf8" fontSize="9" fontWeight="bold" textAnchor="middle">Day 3</text>
              <text x="260" y="125" fill="#a855f7" fontSize="9" fontWeight="bold" textAnchor="middle">Day 7</text>
              <text x="340" y="125" fill="#ec4899" fontSize="9" fontWeight="bold" textAnchor="middle">Day 14</text>
              <text x="420" y="125" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">Day 30</text>

              {/* Unreviewed Decay Curve (Red Dotted) */}
              <path
                d="M 50 20 Q 90 75 160 98 T 420 106"
                fill="none"
                stroke="var(--accent-rose)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* With Spaced Review Curve (Green/Indigo Stepped) */}
              {/* Day 0 to 1 */}
              <path d="M 50 20 Q 80 48 110 62" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Day 1 Review Reset */}
              <line x1="110" y1="62" x2="110" y2="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
              
              {/* Day 1 to 3 */}
              <path d="M 110 20 Q 145 42 180 50" fill="none" stroke="#818cf8" strokeWidth="2.5" />
              {/* Day 3 Review Reset */}
              <line x1="180" y1="50" x2="180" y2="20" stroke="#818cf8" strokeWidth="2" strokeDasharray="2 2" />

              {/* Day 3 to 7 */}
              <path d="M 180 20 Q 220 36 260 42" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              {/* Day 7 Review Reset */}
              <line x1="260" y1="42" x2="260" y2="20" stroke="#a855f7" strokeWidth="2" strokeDasharray="2 2" />

              {/* Day 7 to 14 */}
              <path d="M 260 20 Q 300 32 340 36" fill="none" stroke="#ec4899" strokeWidth="2.5" />
              {/* Day 14 Review Reset */}
              <line x1="340" y1="36" x2="340" y2="20" stroke="#ec4899" strokeWidth="2" strokeDasharray="2 2" />

              {/* Day 14 to 30 */}
              <path d="M 340 20 Q 380 26 420 28" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Milestone Dots */}
              <circle cx="110" cy="20" r="4" fill="#38bdf8" />
              <circle cx="180" cy="20" r="4" fill="#818cf8" />
              <circle cx="260" cy="20" r="4" fill="#a855f7" />
              <circle cx="340" cy="20" r="4" fill="#ec4899" />
              <circle cx="420" cy="20" r="4" fill="#f59e0b" />
            </svg>
          </div>

          {/* Milestone Selection Tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 12, paddingBottom: 4 }}>
            {milestones.map((m) => {
              const isSel = selectedMilestone === m.day;
              return (
                <button
                  key={m.day}
                  onClick={() => setSelectedMilestone(m.day)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isSel ? m.color : 'var(--border-subtle)',
                    background: isSel ? `${m.color}20` : 'var(--bg-main)',
                    color: isSel ? m.color : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Day {m.day}
                </button>
              );
            })}
          </div>

          {/* Selected Milestone Detail Card */}
          <div
            style={{
              marginTop: 10,
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-main)',
              borderLeft: `4px solid ${currentInfo.color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', color: currentInfo.color }}>
                {currentInfo.title}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                }}
              >
                {currentInfo.retention}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: 4 }}>
              {currentInfo.desc}
            </div>

            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                Without this review: <strong style={{ color: 'var(--accent-rose)' }}>{currentInfo.decayWithout}</strong>
              </span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                ✓ Auto-scheduled in RetainCurve
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
