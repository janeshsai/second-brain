import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

const SUGGESTIONS = [
  'What should I focus on today?',
  'Summarize my notes from this week',
  'What is my next learning step?',
  'Show me my habit trends',
];

function Chip({ text, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(text)}
      style={{
        borderRadius: 9999,
        border: `1px solid ${hov ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.3)'}`,
        background: hov ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.1)',
        padding: '6px 12px', fontSize: 12,
        color: hov ? 'rgb(165,243,252)' : 'rgb(103,232,249)',
        transition: 'all 0.2s ease', cursor: 'pointer',
      }}
    >
      {text}
    </button>
  );
}

// onSubmit: handler from Dashboard that calls /api/ai/chat/ — wired in Step 5
export function AICard({ onSubmit, style }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [btnHov, setBtnHov] = useState(false);

  const submit = () => {
    if (!query.trim()) return;
    if (onSubmit) onSubmit(query);
    setQuery('');
  };

  return (
    <CollapsibleCard
      title="AI Assistant"
      icon={<Sparkles size={20} color="rgb(34,211,238)" />}
      glowColor="cyan"
      style={style}
    >
      <div style={{ padding: 16 }}>
        <p style={{ marginBottom: 16, fontSize: 12, color: glass.muted }}>
          Ask anything in your Second Brain
        </p>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Ask me anything about your notes, habits, or goals…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              height: 48, width: '100%', borderRadius: 8,
              border: `1px solid ${focused ? 'oklch(0.7 0.2 260)' : glass.border}`,
              background: 'rgba(255,255,255,0.05)',
              padding: '0 48px 0 16px', fontSize: 14, color: '#fff',
              outline: 'none', boxSizing: 'border-box',
              boxShadow: focused ? '0 0 0 1px oklch(0.7 0.2 260)' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
          <button
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            onClick={submit}
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', height: 36, width: 36,
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: btnHov ? 'rgba(112,95,255,0.8)' : 'oklch(0.7 0.2 260)',
              color: '#fff', transition: 'background 0.2s ease',
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTIONS.map(s => <Chip key={s} text={s} onSelect={t => setQuery(t)} />)}
        </div>
      </div>
    </CollapsibleCard>
  );
}
