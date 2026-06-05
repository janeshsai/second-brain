import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import C from '../theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function SidebarBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '7px 10px',
        borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none',
        background: active ? C.accent : hov ? C.hover : 'transparent',
        color: active ? '#000' : C.t1, fontWeight: active ? 600 : 400,
        marginBottom: 1, display: 'flex', alignItems: 'center', gap: 8,
        transition: 'background 0.12s', fontFamily: C.font,
      }}>
      {children}
    </button>
  );
}

function NoteRow({ note, isSelected, menuOpenId, setMenuOpenId, onOpen, onDelete }) {
  const [hov, setHov] = useState(false);
  const preview = note.body.replace(/#\w+/g, '').replace(/\n/g, ' ').trim();
  const d = new Date(note.updated_at);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const dateLabel = sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div onClick={() => onOpen(note)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '10px 14px', borderBottom: `1px solid ${C.sep}`, cursor: 'pointer',
        background: isSelected ? C.selected : hov ? C.hover : 'transparent',
        position: 'relative', transition: 'background 0.12s',
        borderLeft: isSelected ? `3px solid ${C.accent}` : '3px solid transparent',
        paddingLeft: isSelected ? 11 : 14,
      }}>
      {/* three-dot menu */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
        onClick={e => e.stopPropagation()}>
        <button onClick={() => setMenuOpenId(menuOpenId === note.id ? null : note.id)}
          style={{
            opacity: hov || menuOpenId === note.id ? 1 : 0,
            width: 24, height: 24, borderRadius: 6, background: 'transparent',
            color: C.t2, fontSize: 16, cursor: 'pointer', border: 'none',
            transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⋮</button>
        {menuOpenId === note.id && (
          <div style={{
            position: 'absolute', right: 0, top: 28, background: '#3A3A3C',
            border: `1px solid ${C.sep}`, borderRadius: 10, width: 150,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50, overflow: 'hidden',
          }}>
            {[['Open', C.t1, () => { onOpen(note); setMenuOpenId(null); }],
              ['Delete', C.danger, () => onDelete(note.id)]
            ].map(([label, color, action]) => (
              <MenuRow key={label} label={label} color={color} onClick={action} />
            ))}
          </div>
        )}
      </div>

      <div style={{ paddingRight: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {note.title || 'New Note'}
          </span>
          <span style={{ fontSize: 11, color: C.t3, flexShrink: 0 }}>{dateLabel}</span>
        </div>
        <span style={{ fontSize: 12, color: C.t2, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
          {preview || 'No additional text'}
        </span>
      </div>
    </div>
  );
}

function MenuRow({ label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13,
        color, background: hov ? 'rgba(255,255,255,0.06)' : 'transparent',
        border: 'none', cursor: 'pointer', fontFamily: C.font,
      }}>{label}</button>
  );
}

function ImportSection({ onImportDone }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const [importType, setImportType] = useState(null); // 'apple' | 'google_keep'

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = importType === 'apple'
        ? '/api/import/apple/'
        : '/api/import/google-keep/';

      const r = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(r.data);
      onImportDone(); // refresh notes list
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Import failed' });
    }
    setImporting(false);
    e.target.value = ''; // reset file input
  };

  const triggerImport = (type) => {
    setImportType(type);
    // Small delay to ensure importType state is set before file dialog opens
    setTimeout(() => fileRef.current?.click(), 50);
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: C.t3, padding: '2px 8px 6px',
        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        Import
      </div>

      <input ref={fileRef} type="file" accept=".zip"
        onChange={handleFileSelect} style={{ display: 'none' }} />

      {importing ? (
        <div style={{ fontSize: 12, color: C.t2, padding: '4px 8px' }}>
          ⏳ Importing…
        </div>
      ) : (
        <>
          <button onClick={() => triggerImport('apple')}
            style={{ background: 'none', border: 'none', color: C.t2, fontSize: 12,
              cursor: 'pointer', padding: '4px 8px', display: 'block',
              width: '100%', textAlign: 'left', fontFamily: C.font }}>
             Apple Notes Markdown (.zip)
          </button>
          <button onClick={() => triggerImport('google_keep')}
            style={{ background: 'none', border: 'none', color: C.t2, fontSize: 12,
              cursor: 'pointer', padding: '4px 8px', display: 'block',
              width: '100%', textAlign: 'left', fontFamily: C.font }}>
             Google Keep (.zip)
          </button>
        </>
      )}

      {/* Result toast */}
      {result && (
        <div style={{
          margin: '6px 8px', padding: '8px', borderRadius: 8, fontSize: 11,
          background: result.error ? 'rgba(255,69,58,0.15)' : 'rgba(50,209,75,0.15)',
          color: result.error ? C.danger : C.success,
          border: `1px solid ${result.error ? 'rgba(255,69,58,0.3)' : 'rgba(50,209,75,0.3)'}`,
          lineHeight: 1.5,
        }}>
          {result.error || result.message}
          <button onClick={() => setResult(null)}
            style={{ float: 'right', background: 'none', border: 'none',
              color: 'inherit', cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>
      )}
    </div>
  );
}




export default function Notes() {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [search, setSearch] = useState('');

  const saveTimer = useRef(null);
  const isDirty = useRef(false);
  const isNewNote = useRef(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary]         = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => { fetchFolders(); }, []);
  useEffect(() => { fetchNotes(); }, [selectedFolderId]);

  const fetchFolders = async () => {
    try { const r = await api.get('/api/folders/'); setFolders(r.data); } catch {}
  };
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const q = selectedFolderId ? `?folder=${selectedFolderId}` : '';
      const r = await api.get(`/api/notes/${q}`); setNotes(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!isDirty.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(performSave, 800);
    return () => clearTimeout(saveTimer.current);
  }, [title, body]);


  const handleSummarize = async () => {
    if (!selectedNote) return;
    setSummarizing(true);
    setSummary(null);
    try {
      const r = await api.post(`/api/notes/${selectedNote.id}/summarize/`);
      setSummary(r.data.summary);
    } catch {}
    setSummarizing(false);
  };
  
  const extractTags = t => [...new Set((t.match(/#\w+/g) || []))].map(x => x.slice(1)).join(',');

  const performSave = useCallback(async () => {
    if (!isDirty.current && !isNewNote.current) return;
    const payload = { title: title.trim() || 'New Note', body, tags: extractTags(body), folder: selectedFolderId || null };
    try {
      if (selectedNote) {
        const r = await api.put(`/api/notes/${selectedNote.id}/`, payload);
        setNotes(prev => prev.map(n => n.id === selectedNote.id ? r.data : n));
        setLastSaved(new Date());
      } else if (isNewNote.current && (title.trim() || body.trim())) {
        const r = await api.post('/api/notes/', payload);
        setSelectedNote(r.data); setNotes(prev => [r.data, ...prev]);
        isNewNote.current = false; setLastSaved(new Date());
      }
    } catch (e) { console.error(e); }
    isDirty.current = false; setIsSaving(false);
  }, [title, body, selectedNote, selectedFolderId]);

  const openNote = async note => {
    if (isDirty.current) { clearTimeout(saveTimer.current); await performSave(); }
    isDirty.current = false; isNewNote.current = false;
    setSelectedNote(note); setTitle(note.title); setBody(note.body);
    setShowEditor(true); setMenuOpenId(null);
  };

  const newNote = async () => {
    if (isDirty.current) { clearTimeout(saveTimer.current); await performSave(); }
    isDirty.current = false; isNewNote.current = true;
    setSelectedNote(null); setTitle(''); setBody('');
    setShowEditor(true); setLastSaved(null);
  };

  const deleteNote = async id => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/notes/${id}/`);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) { setSelectedNote(null); setShowEditor(false); }
    } catch {}
    setMenuOpenId(null);
  };

  const createFolder = async e => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const r = await api.post('/api/folders/', { name: newFolderName.trim() });
      setFolders(prev => [...prev, r.data]); setNewFolderName(''); setShowNewFolder(false);
    } catch {}
  };

  const filtered = notes.filter(n => !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );
  const tags = extractTags(body);
  const saveLabel = isSaving ? 'Saving…'
    : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';

  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, background: C.bg, fontFamily: C.font, color: C.t1, overflow: 'hidden' }}
      onClick={() => setMenuOpenId(null)}>

      {/* ── Sidebar ── */}
      <div style={{ width: 196, background: C.sidebar, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.sep}`, flexShrink: 0 }}>
        <div style={{ padding: '18px 14px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notes</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          <SidebarBtn active={!selectedFolderId} onClick={() => setSelectedFolderId(null)}>
            All Notes
          </SidebarBtn>
          {folders.map(f => (
            <SidebarBtn key={f.id} active={selectedFolderId === f.id} onClick={() => setSelectedFolderId(f.id)}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11, opacity: 0.5 }}>{f.note_count}</span>
            </SidebarBtn>
          ))}
        </div>

        <div style={{ padding: '8px', borderTop: `1px solid ${C.sep}` }}>
          <div style={{ padding: '8px', borderTop: `1px solid ${C.sep}` }}>
            <ImportSection onImportDone={fetchNotes} />
          </div>
          {showNewFolder ? (
            <form onSubmit={createFolder} style={{ display: 'flex', gap: 4 }}>
              <Input autoFocus size="sm" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name" style={{ flex: 1, minWidth: 0 }} />
              <button type="submit" style={{ color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✓</button>
              <button type="button" onClick={() => setShowNewFolder(false)} style={{ color: C.t2, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </form>
          ) : (
            <button onClick={() => setShowNewFolder(true)} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 12, cursor: 'pointer', padding: '4px 8px', textAlign: 'left', width: '100%', fontFamily: C.font }}>
              + New Folder
            </button>
          )}
        </div>

          {/*just in case*/}
      </div>

      {/* ── Notes List ── */}
      <div style={{ width: 276, background: C.list, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.sep}`, flexShrink: 0 }}>
        <div style={{ padding: '16px 14px 10px', borderBottom: `1px solid ${C.sep}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'All Notes'}
            </span>
            <Button size="sm" onClick={newNote}>+ New</Button>
          </div>
          <Input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} size="sm" />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          {loading
            ? [1,2,3,4,5].map(i => (
                <div key={i} style={{ padding: '10px 14px', borderBottom: `1px solid ${C.sep}` }}>
                  <div style={{ height: 13, width: '70%', borderRadius: 6,
                    background: 'rgba(255,255,255,0.07)', marginBottom: 6,
                    animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 11, width: '45%', borderRadius: 6,
                    background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                </div>
              ))
          :filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: '48px 16px', color: C.t3, fontSize: 13 }}>
                {search ? 'No results found' : 'No notes yet — hit + New'}
              </div>
            : filtered.map(n => (
                <NoteRow key={n.id} note={n} isSelected={selectedNote?.id === n.id}
                  menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId}
                  onOpen={openNote} onDelete={deleteNote} />
              ))
          }
        </div>
        <div style={{ padding: '8px', borderTop: `1px solid ${C.sep}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: C.t3 }}>{filtered.length} notes</span>
        </div>
      </div>

      {/* ── Editor ── */}
      {showEditor ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, minWidth: 0 }}>
          <div style={{ padding: '12px 40px', borderBottom: `1px solid ${C.sep}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            {selectedNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSummarize}
                disabled={summarizing}
                style={{
                  background: 'rgba(255,214,10,0.1)',
                  border: '1px solid rgba(255,214,10,0.3)',
                  color: C.accent,
                  opacity: summarizing ? 0.6 : 1,
                }}>
                {summarizing ? '✨ Summarizing…' : '✨ Summarize'}
              </Button>
            )}
            <span style={{ fontSize: 11, color: C.t3 }}>{saveLabel}</span>
            {selectedNote && <span style={{ fontSize: 11, color: C.t3 }}>{new Date(selectedNote.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
          </div>

          <input value={title} onChange={e => { isDirty.current = true; setTitle(e.target.value); }}
            placeholder="Title"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              padding: '36px 40px 10px', fontSize: 28, fontWeight: 700,
              color: C.t1, fontFamily: C.font, width: '100%', boxSizing: 'border-box',
            }} />

          <textarea value={body} onChange={e => { isDirty.current = true; setBody(e.target.value); }}
            placeholder={'Start writing…\n\nTip: use #hashtags anywhere to tag this note automatically.'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '4px 40px 32px', fontSize: 15, lineHeight: 1.75,
              color: C.t2, fontFamily: C.font, resize: 'none',
              boxSizing: 'border-box', width: '100%',
            }} />

          {tags && (
            <div style={{ padding: '10px 40px 18px', borderTop: `1px solid ${C.sep}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.split(',').map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(255,214,10,0.1)', color: C.accent,
                  fontSize: 12, padding: '3px 10px', borderRadius: 100,
                  border: '1px solid rgba(255,214,10,0.2)',
                }}>#{tag}</span>
              ))}
            </div>
          )}
          {summary && (
            <div style={{ padding: '14px 40px', borderTop: `1px solid ${C.sep}`,
              background: 'rgba(255,214,10,0.04)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>✨ AI Summary</span>
                <button onClick={() => setSummary(null)}
                  style={{ background: 'none', border: 'none', color: C.t3,
                    cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
              <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {summary}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.3 }}>📝</div>
          <p style={{ color: C.t2, fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Select a note or create a new one</p>
          <p style={{ color: C.t3, fontSize: 13, marginBottom: 24 }}>Your notes auto-save as you type</p>
          <Button onClick={newNote}>+ New Note</Button>
        </div>
      )}
    </div>
  );
}