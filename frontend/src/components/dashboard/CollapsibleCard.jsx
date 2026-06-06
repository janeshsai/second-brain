import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { glow as glowMap, glass } from '../../theme';
import { useHover } from '../../hooks/useHover';

export function CollapsibleCard({
  title,
  icon,
  badge,
  rightAction,
  children,
  defaultExpanded = true,
  glowColor = 'cyan',
  style,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const card = useHover();
  const header = useHover();
  const g = glowMap[glowColor] || glowMap.cyan;

  return (
    <div
      {...card.props}
      style={{
        borderRadius: 12,
        border: `1px solid ${card.isHovered ? g.borderHover : g.border}`,
        background: glass.card,
        backdropFilter: glass.blur,
        WebkitBackdropFilter: glass.blur,
        transition: 'all 0.3s ease',
        boxShadow: card.isHovered ? g.shadow : 'none',
        ...style,
      }}
    >
      <div
        {...header.props}
        onClick={() => setIsExpanded(v => !v)}
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          borderRadius: isExpanded ? '12px 12px 0 0' : 12,
          borderBottom: isExpanded ? `1px solid ${glass.border}` : 'none',
          padding: 16,
          background: header.isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          userSelect: 'none',
        }}
      >
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: g.gradient,
          opacity: 0.5, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ borderRadius: 8, padding: 8, background: g.iconBg }}>{icon}</div>
          <h3 style={{ fontWeight: 600, color: '#fff', fontSize: 15, margin: 0 }}>{title}</h3>
          {badge}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          {rightAction}
          {isExpanded
            ? <ChevronUp size={16} color={glass.muted} />
            : <ChevronDown size={16} color={glass.muted} />}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateRows: isExpanded ? '1fr' : '0fr',
        opacity: isExpanded ? 1 : 0,
        transition: 'grid-template-rows 0.3s ease, opacity 0.3s ease',
      }}>
        <div style={{ overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}
