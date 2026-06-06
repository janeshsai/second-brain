import { useState } from 'react';
import { FileText, Target, Calendar, GraduationCap, Bookmark, MessageSquare, TrendingUp } from 'lucide-react';
import { glass } from '../../theme';

// Step 5: Replace these with real props from Dashboard
const STAT_DEFS = [
  { label: 'Total Notes',       icon: FileText,       color: 'rgb(34,211,238)',   glowRgb: '34,211,238' },
  { label: 'Active Habits',     icon: Target,         color: 'rgb(244,114,182)',  glowRgb: '244,114,182' },
  { label: 'Calendar Events',   icon: Calendar,       color: 'rgb(167,139,250)',  glowRgb: '139,92,246' },
  { label: 'Learning Progress', icon: GraduationCap,  color: 'rgb(52,211,153)',   glowRgb: '16,185,129' },
  { label: 'Bookmarks',         icon: Bookmark,       color: 'rgb(96,165,250)',   glowRgb: '59,130,246' },
  { label: 'AI Chats',          icon: MessageSquare,  color: 'rgb(255,214,10)',   glowRgb: '255,214,10' },
];

function StatCard({ label, value, icon: Icon, color, glowRgb }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 12,
        border: `1px solid ${hov ? 'rgba(255,255,255,0.2)' : glass.border}`,
        background: glass.card,
        backdropFilter: glass.blur, WebkitBackdropFilter: glass.blur,
        padding: 16, transition: 'all 0.3s ease',
        transform: hov ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        cursor: 'pointer',
      }}
    >
      {/* Hover gradient reveal */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom right, rgba(${glowRgb},0.2), rgba(${glowRgb},0.05))`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            borderRadius: 8, padding: 8,
            background: `rgba(${glowRgb},0.2)`,
            transform: hov ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease',
          }}>
            <Icon size={16} color={color} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <TrendingUp size={12} color='rgb(52,211,153)' />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: 0 }}>{value ?? '—'}</p>
          <p style={{ fontSize: 12, color: glass.muted, margin: 0 }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

// values prop: { notes, habits, events, learningPct, bookmarks, aiChats }
export function StatsRow({ values = {} }) {
  const vals = [
    values.notes, values.habits, values.events,
    values.learningPct != null ? `${values.learningPct}%` : undefined,
    values.bookmarks, values.aiChats,
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 16 }}>
      {STAT_DEFS.map((def, i) => (
        <StatCard key={def.label} {...def} value={vals[i]} />
      ))}
    </div>
  );
}
