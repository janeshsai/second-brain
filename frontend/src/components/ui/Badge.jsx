import C from '../../theme';

const VARIANTS = {
  primary: {
    background: 'rgba(255,214,10,0.14)',
    color: C.accent,
    border: `1px solid rgba(255,214,10,0.24)`,
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: C.t1,
    border: `1px solid ${C.sep}`,
  },
  success: {
    background: 'rgba(50,215,75,0.14)',
    color: C.success,
    border: `1px solid rgba(50,215,75,0.24)`,
  },
  danger: {
    background: 'rgba(255,69,58,0.14)',
    color: C.danger,
    border: `1px solid rgba(255,69,58,0.24)`,
  },
};

const baseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '6px 12px',
  fontSize: 11,
  letterSpacing: '0.01em',
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

export default function Badge({ variant = 'secondary', style, children, ...props }) {
  const variantStyle = VARIANTS[variant] || VARIANTS.secondary;

  return (
    <span style={{ ...baseStyle, ...variantStyle, ...style }} {...props}>
      {children}
    </span>
  );
}
