import C from '../../theme';

const SIZES = {
  sm: { padding: '0 10px', minHeight: 38, fontSize: 13 },
  md: { padding: '10px 16px', minHeight: 42, fontSize: 14 },
  lg: { padding: '12px 20px', minHeight: 48, fontSize: 15 },
};

const VARIANTS = {
  primary: {
    backgroundColor: C.accent,
    color: '#000',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: C.t1,
    border: `1px solid ${C.sep}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: C.t1,
    border: '1px solid transparent',
  },
  danger: {
    backgroundColor: C.danger,
    color: '#fff',
    border: '1px solid transparent',
  },
};

const baseStyle = {
  appearance: 'none',
  borderRadius: C.radius,
  fontFamily: C.font,
  fontWeight: 700,
  letterSpacing: '0.01em',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.16s ease, background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

export default function Button({ variant = 'primary', size = 'md', style, children, type = 'button', ...props }) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      style={{ ...baseStyle, ...variantStyle, ...sizeStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
