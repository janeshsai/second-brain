import { GraduationCap } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

const PATH_COLORS = ['rgb(167,139,250)', 'rgb(34,211,238)', 'rgb(244,114,182)', 'rgb(52,211,153)', 'rgb(96,165,250)'];

// paths prop: array from /api/paths/ — wired in Step 5
export function LearningCard({ paths, loading }) {
  const list = paths || [];

  return (
    <CollapsibleCard
      title="Learning Progress"
      icon={<GraduationCap size={20} color="rgb(167,139,250)" />}
      glowColor="purple"
    >
      <div style={{ padding: 16 }}>
        {loading ? (
          [1, 2].map(i => <div key={i} style={{ height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />)
        ) : list.length === 0 ? (
          <p style={{ fontSize: 13, color: glass.muted, textAlign: 'center', padding: '20px 0' }}>
            No learning paths yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.slice(0, 4).map((path, i) => {
              const pct = path.total_steps > 0 ? Math.round((path.done_steps / path.total_steps) * 100) : 0;
              const color = PATH_COLORS[i % PATH_COLORS.length];
              return (
                <div key={path.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{path.name}</span>
                    <span style={{ fontSize: 12, color: glass.muted }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 9999, background: color,
                      width: `${pct}%`, transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: glass.muted, marginTop: 3 }}>
                    {path.done_steps}/{path.total_steps} steps
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
