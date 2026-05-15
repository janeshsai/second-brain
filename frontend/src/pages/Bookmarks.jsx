import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Linkify } from '../utils/linkify';

const C = {
  bg: '#1C1C1E', sidebar: '#2C2C2E', card: '#2C2C2E',
  cardHov: '#3A3A3C', sep: 'rgba(84,84,88,0.55)',
  accent: '#FFD60A', hover: 'rgba(255,255,255,0.06)',
  inputBg: 'rgba(255,255,255,0.08)', t1: '#FFFFFF',
  t2: 'rgba(235,235,245,0.6)', t3: 'rgba(235,235,245,0.28)',
  danger: '#FF453A', success: '#32D74B',
  font: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
};

const CAT_COLORS = [
  { bg: 'rgba(191,90,242,0.15)', text: '#BF5AF2', border: 'rgba(191,90,242,0.3)' },
  { bg: 'rgba(10,132,255,0.15)', text: '#0A84FF', border: 'rgba(10,132,255,0.3)' },
  { bg: 'rgba(255,159,10,0.15)', text: '#FF9F0A', border: 'rgba(255,159,10,0.3)' },
  { bg: 'rgba(255,69,58,0.15)',  text: '#FF453A', border: 'rgba(255,69,58,0.3)' },
  { bg: 'rgba(50,209,75,0.15)',  text: '#32D74B', border: 'rgba(50,209,75,0.3)' },
  { bg: 'rgba(255,214,10,0.15)', text: '#FFD60A', border: 'rgba(255,214,10,0.3)' },
];

const looksLikeUrl = s => { try { new URL(s.startsWith('http') ? s : `https://${s}`); return s.includes('.'); } catch { return false; } };
const normalizeUrl = s => { if (!s) return ''; return s.startsWith('http') ? s : `https://${s}`; };
const getDomain = url => { 
  try { 
    const host = new URL(url).hostname.replace('www.', ''); 
    return (host === '127.0.0.1' || host === 'localhost') ? '' : host;
  } catch { return ''; } 
};

function SidebarBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8,
        fontSize: 13, cursor: 'pointer', border: 'none',
        background: active ? C.accent : hov ? C.hover : 'transparent',
        color: active ? '#000' : C.t1, fontWeight: active ? 600 : 400,
        marginBottom: 1, display: 'flex', alignItems: 'center', gap: 8,
        transition: 'background 0.12s', fontFamily: C.font,
      }}>{children}</button>
  );
}

function MenuRow({ label, color = C.t1, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, color, background: hov ? C.hover : 'transparent', border: 'none', cursor: 'pointer', fontFamily: C.font }}>
      {label}
    </button>
  );
}

function BookmarkCard({ bm, viewMode, categories, menuOpenId, setMenuOpenId, onEdit, onDelete, onToggleFav, onMarkOpened }) {
  const [hov, setHov] = useState(false);
  const catIdx = categories.findIndex(c => c.id === bm.category);
  const pal = catIdx >= 0 ? CAT_COLORS[catIdx % CAT_COLORS.length] : null;
  const domain = bm.url ? getDomain(bm.url) : '';
  const d = bm.last_opened ? new Date(bm.last_opened) : null;
  const lastOpened = d ? `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : null;

  const isGrid = viewMode === 'grid';

  return (
    <div onClick={() => onEdit(bm)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.cardHov : C.card, border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : C.sep}`,
        borderRadius: 12, padding: isGrid ? '14px' : '12px 14px',
        display: isGrid ? 'block' : 'flex', gap: 12, alignItems: 'flex-start',
        cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
      }}>

      {/* three-dot */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
        onClick={e => e.stopPropagation()}>
        <button onClick={() => setMenuOpenId(menuOpenId === bm.id ? null : bm.id)}
          style={{
            opacity: hov || menuOpenId === bm.id ? 1 : 0, width: 26, height: 26,
            borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: C.t1,
            fontSize: 16, cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⋮</button>
        {menuOpenId === bm.id && (
          <div style={{
            position: 'absolute', right: 0, top: 30, background: '#3A3A3C',
            border: `1px solid ${C.sep}`, borderRadius: 10, width: 168,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 50, overflow: 'hidden',
          }}>
            <MenuRow label="Edit" onClick={() => { onEdit(bm); setMenuOpenId(null); }} />
            <MenuRow label={bm.is_favorite ? 'Remove Favorite' : 'Add Favorite'} color={C.accent}
              onClick={() => { onToggleFav(bm); setMenuOpenId(null); }} />
            {bm.url && (
              <a href={normalizeUrl(bm.url)} target="_blank" rel="noreferrer"
                onClick={() => { onMarkOpened(bm.id); setMenuOpenId(null); }}
                style={{ display: 'block', padding: '9px 14px', fontSize: 13, color: '#0A84FF', textDecoration: 'none', fontFamily: C.font }}>
                Open URL
              </a>
            )}
            <div style={{ borderTop: `1px solid ${C.sep}`, margin: '4px 0' }} />
            <MenuRow label="Delete" color={C.danger} onClick={() => { onDelete(bm.id); setMenuOpenId(null); }} />
          </div>
        )}
      </div>

      {/* icon */}
      <div style={{ flexShrink: 0, marginBottom: isGrid ? 10 : 0 }}>
        {bm.url && domain && !domain.includes('127.0.0.1') && !domain.includes('localhost') ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            onError={e => { e.target.style.display = 'none'; }}
            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.08)' }}
            alt=""
          />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: 7,
            background: 'rgba(255,255,255,0.08)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {bm.url ? '🌐' : '📝'}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {bm.is_favorite && <span style={{ color: C.accent, marginRight: 4 }}>★</span>}
          {bm.title || domain || 'Untitled'}
        </div>
        
        {bm.url && (
          <a href={bm.url} target="_blank" rel="noreferrer"
            onClick={e => { e.stopPropagation(); onMarkOpened(bm.id); }}
            style={{ fontSize: 11, color: '#0A84FF', display: 'block', marginBottom: 4, textDecoration: 'none' }}>
            {domain} ↗
          </a>
        )}
        {bm.content && (
          <div style={{ fontSize: 12, color: C.t2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: isGrid ? 2 : 1, WebkitBoxOrient: 'vertical', marginBottom: 8 }}>
            <Linkify text={bm.content} />
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {pal && bm.category_name && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: pal.bg, color: pal.text, border: `1px solid ${pal.border}` }}>
              {bm.category_name}
            </span>
          )}
          {bm.progress && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(50,209,75,0.12)', color: C.success, border: '1px solid rgba(50,209,75,0.25)' }}>
              📍 {bm.progress}
            </span>
          )}
          {lastOpened && <span style={{ fontSize: 11, color: C.t3 }}>{lastOpened}</span>}
        </div>
      </div>
    </div>
  );
}

function Modal({ bm, folders, categories, onSave, onClose, onAddCategory }) {
  const [url, setUrl] = useState(bm?.url || '');
  const [title, setTitle] = useState(bm?.title || '');
  const [content, setContent] = useState(bm?.content || '');
  const [progress, setProgress] = useState(bm?.progress || '');
  const [catId, setCatId] = useState(bm?.category || '');
  const [folderId, setFolderId] = useState(bm?.folder || '');
  const [isFav, setIsFav] = useState(bm?.is_favorite || false);
  const [newCat, setNewCat] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const inp = {
    width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8,
    padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none',
    fontFamily: C.font, boxSizing: 'border-box', transition: 'border 0.15s',
  };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' };

  const handleSave = () => onSave({ url: normalizeUrl(url), title, content, progress, category: catId || null, folder: folderId || null, is_favorite: isFav });
  const handleAddCat = async e => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const cat = await onAddCategory(newCat.trim());
    if (cat) { setCatId(cat.id); setNewCat(''); setShowNewCat(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: '#2C2C2E', border: `1px solid ${C.sep}`, borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', fontFamily: C.font }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{bm ? 'Edit Bookmark' : 'New Bookmark'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '65vh', overflowY: 'auto' }}>
          <div><label style={lbl}>URL <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label>
            <input style={inp} placeholder="https://… or leave blank" value={url} onChange={e => setUrl(e.target.value)} /></div>
          <div><label style={lbl}>Title <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label>
            <input style={inp} placeholder="Give it a name…" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label style={lbl}>Notes / Info</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3} placeholder="Any context you want to remember…" value={content} onChange={e => setContent(e.target.value)} /></div>
          <div><label style={lbl}>Progress <span style={{ color: C.t3, textTransform: 'none' }}>(e.g. "Chapter 42", "45%", "Ep 5 of 12")</span></label>
            <input style={inp} placeholder="Where did you leave off?" value={progress} onChange={e => setProgress(e.target.value)} /></div>

          <div>
            <label style={lbl}>Category <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={{ ...inp, flex: 1 }} value={catId} onChange={e => setCatId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => setShowNewCat(s => !s)} style={{ background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, color: C.t1, fontSize: 13, padding: '0 14px', cursor: 'pointer', fontFamily: C.font }}>+ New</button>
            </div>
            {showNewCat && (
              <form onSubmit={handleAddCat} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input autoFocus style={{ ...inp, flex: 1 }} placeholder="e.g. Manga" value={newCat} onChange={e => setNewCat(e.target.value)} />
                <button type="submit" style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>Add</button>
              </form>
            )}
          </div>

          <div><label style={lbl}>Folder <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label>
            <select style={inp} value={folderId} onChange={e => setFolderId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">No folder</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Favorite toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => setIsFav(s => !s)} style={{
              width: 44, height: 26, borderRadius: 100, cursor: 'pointer',
              background: isFav ? C.accent : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'background 0.2s',
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: isFav ? 'translateX(18px)' : 'none', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
            </div>
            <span style={{ fontSize: 13, color: C.t1 }}>Mark as Favorite</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.sep}` }}>
          <button onClick={onClose} style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`, color: C.t1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: C.font }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, background: C.accent, color: '#000', border: 'none', padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: C.font }}>
            {bm ? 'Save Changes' : 'Add Bookmark'}
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CATS = ['Manga', 'Course', 'Article', 'Video', 'Tool', 'Research'];

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selFolder, setSelFolder] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [favOnly, setFavOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingBm, setEditingBm] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [quickAdd, setQuickAdd] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const searchTimer = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchBookmarks(); }, [selFolder, selCat, favOnly]);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchBookmarks, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const fetchAll = async () => {
    const [bRes, fRes, cRes] = await Promise.all([api.get('/api/bookmarks/'), api.get('/api/bookmark-folders/'), api.get('/api/categories/')]);
    setBookmarks(bRes.data); setFolders(fRes.data);
    if (cRes.data.length === 0) {
      for (const name of DEFAULT_CATS) { try { await api.post('/api/categories/', { name }); } catch {} }
      const fresh = await api.get('/api/categories/'); setCategories(fresh.data);
    } else setCategories(cRes.data);
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (selFolder) p.append('folder', selFolder);
      if (selCat) p.append('category', selCat);
      if (favOnly) p.append('favorites', 'true');
      if (search.trim()) p.append('search', search.trim());
      const r = await api.get(`/api/bookmarks/?${p}`);
      setBookmarks(r.data);
    } catch {}
    setLoading(false);
  };

  const handleSave = async data => {
    setShowModal(false);
    setEditingBm(null);
    
    if (editingBm) {
      // Optimistic update for edit
      setBookmarks(prev => prev.map(b => b.id === editingBm.id ? { ...b, ...data } : b));
      try {
        const r = await api.put(`/api/bookmarks/${editingBm.id}/`, data);
        // Replace optimistic version with real server data
        setBookmarks(prev => prev.map(b => b.id === editingBm.id ? r.data : b));
      } catch { alert('Save failed.'); fetchBookmarks(); }
    } else {
      // Optimistic create
      const tempId = `temp-${Date.now()}`;
      const optimistic = { ...data, id: tempId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category_name: categories.find(c => c.id === data.category)?.name || null };
      setBookmarks(prev => [optimistic, ...prev]);
      try {
        const r = await api.post('/api/bookmarks/', data);
        setBookmarks(prev => prev.map(b => b.id === tempId ? r.data : b));
      } catch { setBookmarks(prev => prev.filter(b => b.id !== tempId)); alert('Save failed.'); }
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this bookmark?')) return;
    await api.delete(`/api/bookmarks/${id}/`);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleToggleFav = async bm => {
    const r = await api.put(`/api/bookmarks/${bm.id}/`, { ...bm, category: bm.category || null, folder: bm.folder || null, is_favorite: !bm.is_favorite });
    setBookmarks(prev => prev.map(b => b.id === bm.id ? r.data : b));
  };

  const handleMarkOpened = async id => {
    const r = await api.post(`/api/bookmarks/${id}/opened/`);
    setBookmarks(prev => prev.map(b => b.id === id ? r.data : b));
  };

  const handleAddCategory = async name => {
    try { const r = await api.post('/api/categories/', { name }); setCategories(prev => [...prev, r.data]); return r.data; }
    catch { alert('Category already exists or is invalid.'); return null; }
  };

  const handleQuickAdd = async e => {
    if (e.key !== 'Enter' || !quickAdd.trim()) return;
    const isUrl = looksLikeUrl(quickAdd.trim());
    const payload = isUrl ? { url: normalizeUrl(quickAdd.trim()), title: '', content: '' } : { url: '', title: quickAdd.trim(), content: '' };
    try { const r = await api.post('/api/bookmarks/', payload); setBookmarks(prev => [r.data, ...prev]); setQuickAdd(''); }
    catch { alert('Could not quick-save.'); }
  };

  const createFolder = async e => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const r = await api.post('/api/bookmark-folders/', { name: newFolderName.trim() });
    setFolders(prev => [...prev, r.data]); setNewFolderName(''); setShowNewFolder(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, background: C.bg, fontFamily: C.font, color: C.t1, overflow: 'hidden' }}
      onClick={() => setMenuOpenId(null)}>

      {/* Sidebar */}
      <div style={{ width: 196, background: C.sidebar, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.sep}`, flexShrink: 0 }}>
        <div style={{ padding: '18px 14px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bookmarks</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          <SidebarBtn active={!selFolder && !selCat && !favOnly} onClick={() => { setSelFolder(null); setSelCat(null); setFavOnly(false); }}>All Bookmarks</SidebarBtn>
          <SidebarBtn active={favOnly} onClick={() => { setFavOnly(s => !s); setSelFolder(null); setSelCat(null); }}>★ Favorites</SidebarBtn>
          {categories.length > 0 && <div style={{ padding: '10px 10px 4px', fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Categories</div>}
          {categories.map(cat => (
            <SidebarBtn key={cat.id} active={selCat === cat.id && !selFolder} onClick={() => { setSelCat(cat.id); setSelFolder(null); setFavOnly(false); }}>
              {cat.name}
            </SidebarBtn>
          ))}
          {folders.length > 0 && <div style={{ padding: '10px 10px 4px', fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Folders</div>}
          {folders.map(f => (
            <SidebarBtn key={f.id} active={selFolder === f.id} onClick={() => { setSelFolder(f.id); setSelCat(null); setFavOnly(false); }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11, opacity: 0.5 }}>{f.bookmark_count}</span>
            </SidebarBtn>
          ))}
        </div>

        <div style={{ padding: '8px', borderTop: `1px solid ${C.sep}` }}>
          {showNewFolder ? (
            <form onSubmit={createFolder} style={{ display: 'flex', gap: 4 }}>
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name"
                style={{ flex: 1, background: C.inputBg, border: 'none', borderRadius: 6, padding: '5px 8px', color: C.t1, fontSize: 12, outline: 'none', minWidth: 0, fontFamily: C.font }} />
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

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `1px solid ${C.sep}`, flexShrink: 0 }}>
          <input
            value={quickAdd || search}
            onChange={e => { setQuickAdd(e.target.value); setSearch(e.target.value); }}
            onKeyDown={handleQuickAdd}
            placeholder="⚡ Paste URL or type a note → Enter to quick-save,  or type to search"
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 10, padding: '9px 14px', color: C.t1, fontSize: 13, outline: 'none', fontFamily: C.font }}
          />
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            style={{ background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, padding: '8px 12px', color: C.t1, cursor: 'pointer', fontSize: 15 }}>
            {viewMode === 'grid' ? '☰' : '⊞'}
          </button>
          <button onClick={() => { setEditingBm(null); setShowModal(true); }}
            style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: C.font, flexShrink: 0 }}>
            + New
          </button>
        </div>

        {/* Grid / List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} onClick={e => e.stopPropagation()}>
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
          : bookmarks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 20, opacity: 0.3 }}>🔖</div>
              <p style={{ color: C.t2, fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No bookmarks yet</p>
              <p style={{ color: C.t3, fontSize: 13, marginBottom: 24 }}>Paste a URL above or hit + New</p>
              <button onClick={() => setShowModal(true)} style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                + Add First Bookmark
              </button>
            </div>
          ) : (
            <div style={viewMode === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }
              : { display: 'flex', flexDirection: 'column', gap: 8 }
            }>
              {bookmarks.map(b => (
                <BookmarkCard key={b.id} bm={b} viewMode={viewMode} categories={categories}
                  menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId}
                  onEdit={bm => { setEditingBm(bm); setShowModal(true); }}
                  onDelete={handleDelete} onToggleFav={handleToggleFav} onMarkOpened={handleMarkOpened} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal bm={editingBm} folders={folders} categories={categories}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditingBm(null); }}
          onAddCategory={handleAddCategory} />
      )}
    </div>
  );
}