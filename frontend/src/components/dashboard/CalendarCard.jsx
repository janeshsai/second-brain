import { Calendar } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

const TYPE_COLOR = {
  meeting: 'rgb(96,165,250)', reminder: 'rgb(255,214,10)',
  learning_session: 'rgb(167,139,250)', task: 'rgb(52,211,153)',
  exercise: 'rgb(244,114,182)', other: 'rgb(156,163,175)',
};

// events prop: array from /api/events/ — wired in Step 5
export function CalendarCard({ events, loading }) {
  const list = events || [];
  const today = new Date().toISOString().split('T')[0];
  const upcoming = list.filter(e => e.date >= today).slice(0, 5);

  return (
    <CollapsibleCard
      title="Upcoming Events"
      icon={<Calendar size={20} color="rgb(96,165,250)" />}
      glowColor="blue"
    >
      <div style={{ padding: 16 }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} style={{ height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />)
        ) : upcoming.length === 0 ? (
          <p style={{ fontSize: 13, color: glass.muted, textAlign: 'center', padding: '20px 0' }}>
            No upcoming events
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(ev => {
              const color = TYPE_COLOR[ev.event_type] || TYPE_COLOR.other;
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 12, borderRadius: 8, border: `1px solid ${glass.border}`,
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <div style={{ width: 3, height: 36, borderRadius: 9999, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: glass.muted }}>{ev.date}{ev.start_time ? ` · ${ev.start_time}` : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
