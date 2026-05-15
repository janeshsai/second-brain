import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const C = {
  bg: '#2C2C2E', sep: 'rgba(84,84,88,0.55)', accent: '#FFD60A',
  t1: '#FFFFFF', t2: 'rgba(235,235,245,0.6)', t3: 'rgba(235,235,245,0.28)',
  danger: '#FF453A', success: '#32D74B',
  font: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
};

export default function AISearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [agentCmd, setAgentCmd] = useState('');
  const [agentResult, setAgentResult] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(''); setResults(null); setChatHistory([]);
    }
  }, [isOpen]);

  // Keyboard shortcut: Cmd+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await api.get(`/api/ai/search/?q=${encodeURIComponent(q)}`);
      setResults(r.data);
    } catch {}
    setLoading(false);
  };

  const handleChat = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);
    try {
      const r = await api.post('/api/ai/chat/', { message: userMsg });
      setChatHistory(prev => [...prev, { role: 'ai', text: r.data.answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  const handleAgent = async () => {
    if (!agentCmd.trim()) return;
    setLoading(true);
    setAgentResult(null);
    try {
      const r = await api.post('/api/ai/agent/', { command: agentCmd });
      setAgentResult(r.data);
      if (r.data.success) setAgentCmd('');
    } catch {}
    setLoading(false);
  };

  if (!isOpen) return null;

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.sep}`,
    borderRadius: 10, padding: '12px 16px', color: C.t1, fontSize: 15,
    outline: 'none', fontFamily: C.font, boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#1C1C1E', border: `1px solid ${C.sep}`, borderRadius: 16, width: '100%', maxWidth: 640, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', fontFamily: C.font, overflow: 'hidden' }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.sep}` }}>
          {[['🔍 Search', false], ['💬 Ask AI', true]].map(([label, isChatVal]) => (
            <button key={label} onClick={() => { setChatMode(isChatVal); setResults(null); setChatHistory([]); setQuery(''); }}
              style={{ flex: 1, padding: '14px', fontSize: 13, cursor: 'pointer', border: 'none', fontFamily: C.font,
                background: chatMode === isChatVal ? 'rgba(255,214,10,0.1)' : 'transparent',
                color: chatMode === isChatVal ? C.accent : C.t2,
                fontWeight: chatMode === isChatVal ? 700 : 400,
                borderBottom: chatMode === isChatVal ? `2px solid ${C.accent}` : '2px solid transparent',
              }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {/* Search mode */}
          {!chatMode && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={inputRef} style={{ ...inp, flex: 1 }}
                  placeholder="Search your notes and bookmarks by meaning…"
                  value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <button onClick={() => handleSearch()}
                  style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 10, padding: '0 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                  {loading ? '…' : 'Search'}
                </button>
              </div>

              {results && (
                <div style={{ marginTop: 16, maxHeight: 420, overflowY: 'auto' }}>
                  {results.semantic && (
                    <div style={{ fontSize: 11, color: C.accent, marginBottom: 10, fontWeight: 700 }}>
                      ✨ AI Semantic Search — results matched by meaning
                    </div>
                  )}

                  {results.notes?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: C.t3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Notes</div>
                      {results.notes.map(note => (
                        <div key={note.id}
                          onClick={() => { navigate('/notes'); onClose(); }}
                          style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.t1 }}>{note.title || 'Untitled'}</div>
                          <div style={{ fontSize: 12, color: C.t2, marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {note.body?.slice(0, 100)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.bookmarks?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: C.t3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Bookmarks</div>
                      {results.bookmarks.map(bm => (
                        <div key={bm.id}
                          onClick={() => { navigate('/bookmarks'); onClose(); }}
                          style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.t1 }}>{bm.title || bm.url}</div>
                          {bm.progress && <div style={{ fontSize: 11, color: C.success, marginTop: 2 }}>📍 {bm.progress}</div>}
                          {bm.url && <div style={{ fontSize: 11, color: '#0A84FF', marginTop: 2 }}>{bm.url}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {results.notes?.length === 0 && results.bookmarks?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', color: C.t3, fontSize: 13 }}>
                      No results found for "{results.query}"
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Chat mode */}
          {chatMode && (
            <>
              <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {chatHistory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>🧠</div>
                    <p style={{ color: C.t3, fontSize: 13 }}>Ask anything about your notes and bookmarks.</p>
                    <p style={{ color: C.t3, fontSize: 12, marginTop: 4 }}>Try: "Where was I reading One Piece?" or "What did I note about GCP?"</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10, maxWidth: '85%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? C.accent + '22' : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? C.accent : C.t1,
                    fontSize: 13, lineHeight: 1.6,
                    border: `1px solid ${msg.role === 'user' ? C.accent + '44' : C.sep}`,
                  }}>
                    {msg.text}
                  </div>
                ))}
                {loading && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: C.t3, fontSize: 13, alignSelf: 'flex-start', border: `1px solid ${C.sep}` }}>
                    Thinking…
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }}
                  placeholder="Ask about your notes, bookmarks, learning…"
                  value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleChat()} />
                <button onClick={handleChat} disabled={loading}
                  style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 10, padding: '0 18px', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.font, opacity: loading ? 0.6 : 1 }}>
                  Send
                </button>
              </div>

              {/* Agent command box */}
              <div style={{ marginTop: 12, padding: '12px', borderRadius: 10, background: 'rgba(255,214,10,0.06)', border: `1px solid rgba(255,214,10,0.2)` }}>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 8 }}>⚡ Quick Command — update bookmarks by typing</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1, fontSize: 13, padding: '8px 12px' }}
                    placeholder='e.g. "manga one piece chapter 65" or "favorite gcp course"'
                    value={agentCmd} onChange={e => setAgentCmd(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAgent()} />
                  <button onClick={handleAgent} disabled={loading}
                    style={{ background: 'rgba(255,214,10,0.2)', color: C.accent, border: `1px solid rgba(255,214,10,0.4)`, borderRadius: 8, padding: '0 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                    Run
                  </button>
                </div>
                {agentResult && (
                  <div style={{ marginTop: 8, fontSize: 12, color: agentResult.success ? C.success : C.danger }}>
                    {agentResult.success ? '✓' : '✗'} {agentResult.message}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.sep}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.t3 }}>Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>⌘K</kbd> to toggle</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', fontSize: 12, fontFamily: C.font }}>Close</button>
        </div>
      </div>
    </div>
  );
}