export function Linkify({ text }) {
  if (!text) return null;

  // This pattern matches anything starting with http/https or www.something
  const urlPattern = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9-]+\.[^\s]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, i) => {
        // Test if this chunk is a URL
        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const href = part.startsWith('http') ? part : `https://${part}`;
          return (
            <a key={i} href={href} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#0A84FF', textDecoration: 'underline', wordBreak: 'break-all' }}>
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}