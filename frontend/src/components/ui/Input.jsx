import { forwardRef } from 'react';
import C from '../../theme';

const INPUT_SIZES = {
  sm: { padding: '10px 12px', fontSize: 13, minHeight: 38 },
  md: { padding: '12px 16px', fontSize: 14, minHeight: 44 },
  lg: { padding: '14px 18px', fontSize: 15, minHeight: 48 },
};

const baseStyle = {
  width: '100%',
  borderRadius: C.radius,
  border: `1px solid ${C.sep}`,
  background: C.inputBg,
  color: C.t1,
  fontFamily: C.font,
  outline: 'none',
  transition: 'border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease',
  boxSizing: 'border-box',
};

function Input({ size = 'md', style, ...props }, ref) {
  return (
    <input
      ref={ref}
      style={{ ...baseStyle, ...INPUT_SIZES[size], ...style }}
      {...props}
    />
  );
}

export default forwardRef(Input);
