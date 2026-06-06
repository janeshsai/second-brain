const C = {
  // Backgrounds
  bg:       '#1C1C1E',
  sidebar:  '#212124',
  panel:    '#202023',
  card:     'rgba(255,255,255,0.04)',
  cardHov:  'rgba(255,255,255,0.08)',
  list:     '#232326',

  // Borders & surfaces
  sep:      'rgba(255,255,255,0.08)',
  hover:    'rgba(255,255,255,0.08)',
  selected: 'rgba(255,214,10,0.14)',
  inputBg:  'rgba(255,255,255,0.08)',

  // Accent
  accent:   '#FFD60A',

  // Text
  t1:       '#FFFFFF',
  t2:       'rgba(235,235,245,0.72)',
  t3:       'rgba(235,235,245,0.42)',

  // Semantic
  danger:   '#FF453A',
  success:  '#32D74B',

  // Layout
  radius:   14,
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Typography
  font:     "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
  type: {
    pageTitle: { size: '20px', weight: 600, lineHeight: 1.4 },
    sectionLabel: { size: '13px', weight: 500, color: 'rgba(235,235,245,0.6)' },
    body: { size: '14px', weight: 400, lineHeight: 1.6 },
    meta: { size: '12px', weight: 400, color: 'rgba(235,235,245,0.4)' },
  },
};

export default C;

// ── Dashboard glassmorphism tokens ────────────────────────────────────────────
// These are used only by the dashboard components.
// oklch() is supported in all modern browsers (Chrome 111+, Safari 15.4+, Firefox 113+).

export const glass = {
  bg:     'oklch(0.06 0.015 270)',        // deep dark background
  card:   'oklch(1 0 0 / 0.05)',          // glass card surface
  border: 'oklch(1 0 0 / 0.1)',           // subtle white border
  muted:  'oklch(0.6 0 0)',               // muted text
  blur:   'blur(20px)',
};

// Per-section glow colors — one per dashboard card
export const glow = {
  cyan: {
    border:      'rgba(34,211,238,0.3)',
    borderHover: 'rgba(34,211,238,0.5)',
    shadow:      '0 0 30px rgba(0,212,255,0.15)',
    iconBg:      'rgba(34,211,238,0.2)',
    gradient:    'linear-gradient(to right, rgba(34,211,238,0.1), transparent)',
    color:       'rgb(34,211,238)',
  },
  magenta: {
    border:      'rgba(236,72,153,0.3)',
    borderHover: 'rgba(236,72,153,0.5)',
    shadow:      '0 0 30px rgba(255,0,255,0.15)',
    iconBg:      'rgba(236,72,153,0.2)',
    gradient:    'linear-gradient(to right, rgba(236,72,153,0.1), transparent)',
    color:       'rgb(244,114,182)',
  },
  purple: {
    border:      'rgba(139,92,246,0.3)',
    borderHover: 'rgba(139,92,246,0.5)',
    shadow:      '0 0 30px rgba(139,92,246,0.15)',
    iconBg:      'rgba(139,92,246,0.2)',
    gradient:    'linear-gradient(to right, rgba(139,92,246,0.1), transparent)',
    color:       'rgb(167,139,250)',
  },
  blue: {
    border:      'rgba(59,130,246,0.3)',
    borderHover: 'rgba(59,130,246,0.5)',
    shadow:      '0 0 30px rgba(59,130,246,0.15)',
    iconBg:      'rgba(59,130,246,0.2)',
    gradient:    'linear-gradient(to right, rgba(59,130,246,0.1), transparent)',
    color:       'rgb(96,165,250)',
  },
  green: {
    border:      'rgba(16,185,129,0.3)',
    borderHover: 'rgba(16,185,129,0.5)',
    shadow:      '0 0 30px rgba(16,185,129,0.15)',
    iconBg:      'rgba(16,185,129,0.2)',
    gradient:    'linear-gradient(to right, rgba(16,185,129,0.1), transparent)',
    color:       'rgb(52,211,153)',
  },
  yellow: {
    border:      'rgba(255,214,10,0.3)',
    borderHover: 'rgba(255,214,10,0.5)',
    shadow:      '0 0 30px rgba(255,214,10,0.15)',
    iconBg:      'rgba(255,214,10,0.2)',
    gradient:    'linear-gradient(to right, rgba(255,214,10,0.1), transparent)',
    color:       '#FFD60A',
  },
};

// Helper — adds alpha to any rgba/rgb color string
export function withAlpha(color, a) {
  if (color.startsWith('oklch')) {
    return color.replace(/\)$/, ` / ${a})`);
  }
  return color.replace(/[\d.]+\)$/, `${a})`);
}
