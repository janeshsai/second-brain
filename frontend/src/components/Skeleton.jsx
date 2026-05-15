export function SkeletonRow() {
  return (
    <div style={{ padding: '10px 14px', borderBottom: 'rgba(84,84,88,0.55) 1px solid' }}>
      <div style={{ height: 13, width: '70%', borderRadius: 6, background: 'rgba(255,255,255,0.07)', marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '45%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#2C2C2E', border: '1px solid rgba(84,84,88,0.55)', borderRadius: 12, padding: 14 }}>
      <div style={{ height: 13, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.07)', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '80%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}