import { Sparkles } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

// Step 5: Wire to real AI insights — for now shows static tips
const STATIC_INSIGHTS = [
  { id: 1, text: 'Wire API in Step 5 to see AI-powered insights here.', color: 'rgb(34,211,238)' },
  { id: 2, text: 'Insights will analyze your habits, notes, and learning progress.', color: 'rgb(167,139,250)' },
  { id: 3, text: 'The Resume Coach agent will surface skill gap recommendations here.', color: 'rgb(244,114,182)' },
];

// insights prop: array of { id, text, color } — wired in Step 5
export function InsightsCard({ insights, loading }) {
  const list = insights || STATIC_INSIGHTS;

  return (
    <CollapsibleCard
      title="AI Insights"
      icon={<Sparkles size={20} color="rgb(255,214,10)" />}
      glowColor="yellow"
    >
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading
          ? [1,2,3].map(i => <div key={i} style={{ height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />)
          : list.slice(0, 3).map(insight => (
            <div key={insight.id} style={{
              borderRadius: 8, border: `1px solid ${glass.border}`,
              background: 'rgba(255,255,255,0.05)', padding: 12,
              borderLeft: `3px solid ${insight.color}`,
            }}>
              <p style={{ fontSize: 13, color: '#fff', margin: 0, lineHeight: 1.5 }}>{insight.text}</p>
            </div>
          ))
        }
      </div>
    </CollapsibleCard>
  );
}
