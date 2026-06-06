import { useState } from 'react';
import { FileText, Bookmark, Target, Calendar, GraduationCap, Sparkles } from 'lucide-react';

const ACTIONS = [
  { label: 'New Note',      icon: FileText,      color: 'rgb(34,211,238)',  path: '/notes' },
  { label: 'Add Bookmark',  icon: Bookmark,       color: 'rgb(167,139,250)', path: '/bookmarks' },
  { label: 'Log Habit',     icon: Target,         color: 'rgb(244,114,182)', path: '/habits' },
  { label: 'Add Event',     icon: Calendar,       color: 'rgb(52,211,153)',  path: '/calendar' },
  { label: 'Learning',      icon: GraduationCap,  color: 'rgb(96,165,250)',  path: '/learning' },
  { label: 'Ask AI',        icon: Sparkles,       color: 'rgb(255,214,10)',  path: null },
];

function ActionBtn({ label, icon: Icon, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        borderRadius: 12,
        border: `1px solid ${hov ? color.replace('rgb', 'rgba').replace(')', ',0.5)') : 'rgba(255,255,255,0.1)'}`,
        background: hov ? color.replace('rgb', 'rgba').replace(')', ',0.15)') : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 16px', cursor: 'pointer', flex: 1,
        transition: 'all 0.2s ease',
        boxShadow: hov ? `0 0 20px ${color.replace('rgb', 'rgba').replace(')', ',0.2)')}` : 'none',
      }}
    >
      <div style={{ borderRadius: 8, padding: 6, background: color.replace('rgb', 'rgba').replace(')', ',0.2)') }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

// onAsk: opens AI search modal
export function QuickActions({ navigate, onAsk }) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {ACTIONS.map(a => (
        <ActionBtn
          key={a.label}
          {...a}
          onClick={() => {
            if (a.path && navigate) navigate(a.path);
            if (!a.path && onAsk) onAsk();
          }}
        />
      ))}
    </div>
  );
}
