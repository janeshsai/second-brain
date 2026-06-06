import { useState } from 'react';
import { Target, Flame, Check } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

// Step 5: habits prop will come from /api/habits/ — replace placeholders
const PLACEHOLDER = [
  { id: 1, name: 'Morning Meditation', streak: 0, completed: false },
  { id: 2, name: 'Read 30 minutes',    streak: 0, completed: false },
  { id: 3, name: 'Exercise',           streak: 0, completed: false },
];

function HabitRow({ habit, onToggle }) {
  const [rowHov, setRowHov] = useState(false);
  const [boxHov, setBoxHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setRowHov(true)}
      onMouseLeave={() => setRowHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 8, border: `1px solid ${glass.border}`,
        background: rowHov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        padding: 12, transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => onToggle(habit.id)}
          onMouseEnter={() => setBoxHov(true)}
          onMouseLeave={() => setBoxHov(false)}
          style={{
            display: 'flex', height: 24, width: 24,
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            borderWidth: 2, borderStyle: 'solid',
            borderColor: habit.completed ? 'rgb(236,72,153)' : boxHov ? 'rgb(236,72,153)' : 'rgba(255,255,255,0.2)',
            background: habit.completed ? 'rgb(236,72,153)' : 'transparent',
            color: '#000',
            transform: habit.completed ? 'scale(1.1)' : boxHov ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          {habit.completed && <Check size={14} />}
        </button>
        <span style={{
          fontSize: 14, transition: 'all 0.2s ease',
          color: habit.completed ? glass.muted : '#fff',
          textDecoration: habit.completed ? 'line-through' : 'none',
        }}>
          {habit.name}
        </span>
      </div>
      {habit.streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgb(167,139,250)' }}>
          <Flame size={12} />
          <span>{habit.streak}d</span>
        </div>
      )}
    </div>
  );
}

// habits prop: array from /api/habits/ — wired in Step 5
// onToggle: handler from Dashboard
export function HabitsCard({ habits, onToggle, loading }) {
  const [localHabits, setLocalHabits] = useState(PLACEHOLDER);

  // Use real habits if provided, else local placeholder
  const list = habits || localHabits;

  const handleToggle = (id) => {
    if (onToggle) { onToggle(id); return; }
    // Local placeholder toggle
    setLocalHabits(prev => prev.map(h =>
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  const done = list.filter(h => h.completed).length;
  const pct  = list.length > 0 ? Math.round((done / list.length) * 100) : 0;

  return (
    <CollapsibleCard
      title="Today's Habits"
      icon={<Target size={20} color="rgb(244,114,182)" />}
      glowColor="magenta"
      badge={
        <span style={{
          marginLeft: 8, borderRadius: 9999,
          background: 'rgba(236,72,153,0.2)', padding: '4px 10px',
          fontSize: 12, fontWeight: 500, color: 'rgb(244,114,182)',
        }}>
          {pct}%
        </span>
      }
    >
      <div style={{ padding: 16 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 16, height: 8, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 9999,
            background: 'linear-gradient(to right, rgb(236,72,153), rgba(236,72,153,0.6))',
            width: `${pct}%`, transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading
            ? [1,2,3].map(i => <div key={i} style={{ height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />)
            : list.map(h => <HabitRow key={h.id} habit={h} onToggle={handleToggle} />)
          }
        </div>
      </div>
    </CollapsibleCard>
  );
}
