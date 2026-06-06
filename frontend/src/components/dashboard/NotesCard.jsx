import { useState } from 'react';
import { FileText, Search, Plus } from 'lucide-react';
import { CollapsibleCard } from './CollapsibleCard';
import { glass } from '../../theme';

// Step 5: Replace with real notes from /api/notes/
const PLACEHOLDER = [
  { id: 1, title: 'No notes loaded yet', excerpt: 'Wire API in Step 5', date: '—', tags: [] },
];

// notes prop: array from /api/notes/ — wired in Step 5
// onNew: navigate to notes page
export function NotesCard({ notes, onNew, loading }) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const list = notes || PLACEHOLDER;
  const filtered = list.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CollapsibleCard
      title="Recent Notes"
      icon={<FileText size={20} color="rgb(34,211,238)" />}
      glowColor="cyan"
      rightAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
          {searching && (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                height: 28, width: 120, borderRadius: 6,
                border: `1px solid ${glass.border}`, background: 'rgba(255,255,255,0.05)',
                padding: '0 8px', fontSize: 12, color: '#fff', outline: 'none',
              }}
              onClick={e => e.stopPropagation()}
            />
          )}
          <button
            onClick={e => { e.stopPropagation(); setSearching(s => !s); setSearch(''); }}
            style={{ borderRadius: 8, padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: glass.muted, transition: 'all 0.15s' }}
          >
            <Search size={16} />
          </button>
          {onNew && (
            <button
              onClick={e => { e.stopPropagation(); onNew(); }}
              style={{ borderRadius: 8, padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: glass.muted, transition: 'all 0.15s' }}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      }
    >
      <div style={{ borderTop: `1px solid ${glass.border}` }}>
        {loading
          ? [1,2,3].map(i => <div key={i} style={{ padding: 16, borderBottom: `1px solid ${glass.border}` }}><div style={{ height: 14, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} /></div>)
          : filtered.slice(0, 4).map(note => <NoteRow key={note.id} note={note} />)
        }
      </div>
    </CollapsibleCard>
  );
}

function NoteRow({ note }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: 16, cursor: 'pointer', borderBottom: `1px solid ${glass.border}`,
        background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: '#fff' }}>{note.title}</span>
        <span style={{ fontSize: 11, color: glass.muted, flexShrink: 0, marginLeft: 8 }}>{note.date || '—'}</span>
      </div>
      {note.excerpt && (
        <p style={{ fontSize: 13, color: glass.muted, margin: '0 0 6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {note.excerpt}
        </p>
      )}
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {note.tags.map(tag => (
            <span key={tag} style={{ borderRadius: 9999, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', fontSize: 11, color: glass.muted }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
