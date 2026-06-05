import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import C from '../theme';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Semantic Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    
    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.get(`/api/search/?q=${encodeURIComponent(query)}`);
        setResults(r.data);
      } catch (error) {
        console.error("AI Search failed", error);
      }
      setLoading(false);
    }, 500); // Wait 500ms after user stops typing to ask Gemini

    return () => clearTimeout(searchTimer.current);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 600, background: '#2C2C2E', borderRadius: 16, border: `1px solid ${C.sep}`, boxShadow: '0 24px 64px rgba(0,0,0,0.8)', overflow: 'hidden', fontFamily: C.font }}>
        
        
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontSize: 20, marginRight: 12, opacity: 0.5 }}>✨</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask your Second Brain anything..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: C.t1, fontSize: 18, outline: 'none', fontFamily: C.font }}
          />
          <span style={{ fontSize: 10, color: C.t3, background: C.inputBg, padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>ESC</span>
        </div>

        
        <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: results.length > 0 || loading ? 12 : 0 }}>
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: C.t3, fontSize: 13 }}>
              Thinking... 🧠
            </div>
          )}
          
          {!loading && query && results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: C.t3, fontSize: 13 }}>
              No semantic matches found for "{query}"
            </div>
          )}

          {!loading && results.map((note) => (
            <div key={note.id} style={{ padding: '12px 16px', borderRadius: 10, cursor: 'default', background: 'transparent', transition: 'background 0.2s', borderBottom: `1px solid ${C.sep}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: C.t1, fontSize: 14 }}>{note.title}</span>
                {note.tags && (
                  <span style={{ fontSize: 10, color: C.accent, background: 'rgba(255,214,10,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                    #{note.tags.split(',')[0]}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.t2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {note.body.substring(0, 150)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}