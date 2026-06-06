import { Activity } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

// Step 5: Wire to real activity — for now shows recent completions from habits
// activities prop: array of { id, text, time, color } — wired in Step 5
export function ActivityCard({ activities, loading }) {
  const list = activities || [];

  return (
    <CollapsibleCard
      title="Activity Feed"
      icon={<Activity size={20} color="rgb(52,211,153)" />}
      glowColor="green"
    >
      <div style={{ padding: 16 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} style={{ height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />)
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: glass.muted, fontSize: 13 }}>
            No recent activity
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {list.slice(0, 6).map((item, i) => (
              <div key={item.id || i} style={{
                display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: i < list.length - 1 ? `1px solid ${glass.border}` : 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || 'rgb(52,211,153)', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#fff', margin: 0 }}>{item.text}</p>
                  <p style={{ fontSize: 11, color: glass.muted, margin: '2px 0 0' }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
