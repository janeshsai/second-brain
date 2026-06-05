import C from '../../theme';

const baseStyle = {
  background: C.card,
  border: `1px solid ${C.sep}`,
  borderRadius: C.radius,
  transition: 'background-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  color: C.t1,
};

const VARIANTS = {
  surface: {},
  elevated: {
    background: 'rgba(255,255,255,0.06)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
  },
  transparent: {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
  },
};

export default function Card({ variant = 'surface', hoverable = false, style, children, ...props }) {
  const variantStyle = VARIANTS[variant] || VARIANTS.surface;

  return (
    <div
      style={{
        ...baseStyle,
        ...variantStyle,
        ...(hoverable ? { cursor: 'pointer', willChange: 'transform' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
