import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import C, { glass } from '../theme';
import { StatsRow }     from '../components/dashboard/StatsRow';
import { HabitsCard }   from '../components/dashboard/HabitsCard';
import { AICard }       from '../components/dashboard/AICard';
import { NotesCard }    from '../components/dashboard/NotesCard';
import { CalendarCard } from '../components/dashboard/CalendarCard';
import { LearningCard } from '../components/dashboard/LearningCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';
import { InsightsCard } from '../components/dashboard/InsightsCard';
import { QuickActions } from '../components/dashboard/QuickActions';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Build activity feed from habits completed today
function buildActivity(habits) {
  return habits
    .filter(h => h.completed_today)
    .map(h => ({
      id:    h.id,
      text:  `Completed "${h.name}"`,
      time:  'Today',
      color: h.color === 'yellow' ? '#FFD60A'
           : h.color === 'blue'   ? '#0A84FF'
           : h.color === 'green'  ? '#32D74B'
           : h.color === 'red'    ? '#FF453A'
           : h.color === 'purple' ? '#BF5AF2'
           :                        '#FF9F0A',
    }));
}

export default function Dashboard() {
  const navigate    = useNavigate();
  const pendingRef  = useRef(new Set());

  // Data state
  const [habits,    setHabits]    = useState([]);
  const [notes,     setNotes]     = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [paths,     setPaths]     = useState([]);
  const [events,    setEvents]    = useState([]);
  const [stuckSteps, setStuck]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Fire all requests in parallel — one network round-trip
  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    Promise.all([
      api.get('/api/habits/'),
      api.get('/api/notes/'),
      api.get('/api/bookmarks/'),
      api.get('/api/paths/'),
      api.get(`/api/events/?start=${today}&end=${nextWeek}`),
      api.get('/api/steps/stuck/'),
    ]).then(([h, n, b, p, e, s]) => {
      if (cancelled) return;
      setHabits(h.data);
      setNotes(n.data);
      setBookmarks(b.data);
      setPaths(p.data);
      setEvents(e.data);
      setStuck(s.data);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // Optimistic habit toggle — same pattern as Habits page
  const handleToggle = useCallback(async (id) => {
    if (pendingRef.current.has(id)) return;
    pendingRef.current.add(id);

    const original = habits.find(h => h.id === id);
    if (!original) { pendingRef.current.delete(id); return; }

    const newDone = !original.completed_today;
    setHabits(prev => prev.map(h =>
      h.id === id
        ? { ...h, completed_today: newDone, completion_rate_today: newDone ? 1.0 : 0.0,
            sub_items: (h.sub_items || []).map(si => ({ ...si, completed_today: newDone })) }
        : h
    ));

    try {
      const r = await api.post(`/api/habits/${id}/cascade/`);
      setHabits(prev => prev.map(h => h.id === id ? r.data : h));
    } catch {
      setHabits(prev => prev.map(h => h.id === id ? original : h));
    } finally {
      pendingRef.current.delete(id);
    }
  }, [habits]);

  // Derived stats
  const totalSteps = paths.reduce((s, p) => s + (p.total_steps || 0), 0);
  const doneSteps  = paths.reduce((s, p) => s + (p.done_steps  || 0), 0);
  const learnPct   = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const statValues = {
    notes:       loading ? undefined : notes.length,
    habits:      loading ? undefined : habits.length,
    events:      loading ? undefined : events.length,
    learningPct: loading ? undefined : learnPct,
    bookmarks:   loading ? undefined : bookmarks.length,
    aiChats:     undefined, // wired when Agent Hub tracks sessions
  };

  const activity = buildActivity(habits);

  // Notes formatted for NotesCard
  const formattedNotes = notes.slice(0, 5).map(n => ({
    id:      n.id,
    title:   n.title || 'Untitled',
    excerpt: n.body?.slice(0, 80),
    date:    new Date(n.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    tags:    n.tags ? n.tags.split(',').filter(Boolean) : [],
  }));

  // Responsive grid
  const isLg    = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const threeCol = isLg ? 'repeat(3, minmax(0,1fr))' : '1fr';
  const twoCol   = isLg ? 'repeat(2, minmax(0,1fr))' : '1fr';

  return (
    <div style={{ position: 'relative', minHeight: '100%', flex: 1, overflow: 'auto', fontFamily: C.font }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Neural Network Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/neural-brain-bg.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom right, rgba(0,0,0,0.65), rgba(0,0,0,0.45), rgba(0,0,0,0.55))',
      }} />

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 2, padding: 24, color: '#fff' }}>

        {/* ── Welcome Header ── */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
              {greeting()},{' '}
              <span style={{ background: 'linear-gradient(to right, oklch(0.7 0.2 260), oklch(0.8 0.18 195))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Brain
              </span>
            </h1>
            <p style={{ marginTop: 4, color: glass.muted, fontSize: 14, margin: '4px 0 0' }}>{todayLabel()}</p>
          </div>

          {/* Stuck steps alert */}
          {stuckSteps.length > 0 && (
            <div
              onClick={() => navigate('/learning')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                borderRadius: 12, border: '1px solid rgba(255,214,10,0.3)',
                background: 'rgba(255,214,10,0.08)', backdropFilter: glass.blur,
                padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span>⚠️</span>
              <span style={{ fontSize: 13, color: '#FFD60A', fontWeight: 600 }}>
                {stuckSteps.length} step{stuckSteps.length > 1 ? 's' : ''} stuck 7+ days
              </span>
              <span style={{ fontSize: 12, color: glass.muted }}>→ Review</span>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <QuickActions navigate={navigate} />

        {/* ── AI + Habits ── */}
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: threeCol, marginBottom: 24 }}>
          <AICard style={{ gridColumn: isLg ? 'span 2' : '1 / -1' }} />
          <div style={{ gridColumn: isLg ? 'auto' : '1 / -1' }}>
            <HabitsCard habits={habits} onToggle={handleToggle} loading={loading} />
          </div>
        </div>

        {/* ── Notes + Calendar ── */}
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: twoCol, marginBottom: 24 }}>
          <NotesCard notes={formattedNotes} onNew={() => navigate('/notes')} loading={loading} />
          <CalendarCard events={events} loading={loading} />
        </div>

        {/* ── Learning + Activity + Insights ── */}
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: threeCol, marginBottom: 24 }}>
          <LearningCard paths={paths} loading={loading} />
          <ActivityCard activities={activity} loading={loading} />
          <InsightsCard loading={loading} />
        </div>

        {/* ── Stats ── */}
        <StatsRow values={statValues} />
      </div>
    </div>
  );
}
