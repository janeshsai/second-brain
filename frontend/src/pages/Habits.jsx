import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';

const C = {
  bg: '#1C1C1E', sidebar: '#2C2C2E', card: '#2C2C2E', cardHov: '#3A3A3C',
  sep: 'rgba(84,84,88,0.55)', hover: 'rgba(255,255,255,0.06)',
  inputBg: 'rgba(255,255,255,0.08)',
  t1: '#FFFFFF', t2: 'rgba(235,235,245,0.6)', t3: 'rgba(235,235,245,0.28)',
  danger: '#FF453A', success: '#32D74B', accent: '#FFD60A',
  font: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
};

const COLOR_MAP = {
  yellow: '#FFD60A', blue: '#0A84FF', green: '#32D74B',
  red: '#FF453A', purple: '#BF5AF2', orange: '#FF9F0A',
};

// Time sections — Anytime above Morning
const TIME_SECTIONS = [
  { key: 'anytime',   label: '🔁 Anytime'   },
  { key: 'morning',   label: '🌅 Morning'   },
  { key: 'afternoon', label: '☀️ Afternoon' },
  { key: 'evening',   label: '🌙 Evening'   },
  { key: 'night',     label: '🌃 Night'     },
];

// 0=Mon … 6=Sun (Python datetime.weekday() convention stored in backend)
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_SHORT  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// JS getDay(): 0=Sun → convert to 0=Mon
function todayIndex() {
  const js = new Date().getDay(); // 0=Sun
  return js === 0 ? 6 : js - 1;  // 0=Mon, 6=Sun
}

function isAvailableToday(habit) {
  if (habit.frequency !== 'weekly' || !habit.weekdays) return true;
  const sel = habit.weekdays.split(',').map(Number);
  return sel.includes(todayIndex());
}

// ── Build date columns for past track with inactivity collapsing ──────────────
function buildColumns(startDate, endDate, habitsData) {
  const activeDates = new Set();
  habitsData.forEach(h => h.logs.forEach(l => { if (l.completed) activeDates.add(l.date); }));

  const days = [];
  const cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }

  const cols = [];
  let inStart = null;
  let inCount = 0;

  days.forEach(date => {
    if (!activeDates.has(date)) {
      if (!inStart) inStart = date;
      inCount++;
    } else {
      if (inCount > 2) {
        cols.push({ type: 'inactive', start: inStart, count: inCount });
      } else {
        // 1-2 days: show individually
        for (let i = 0; i < inCount; i++) {
          const d = new Date(inStart + 'T00:00:00');
          d.setDate(d.getDate() + i);
          cols.push({ type: 'day', date: d.toISOString().split('T')[0] });
        }
      }
      inStart = null;
      inCount = 0;
      cols.push({ type: 'day', date });
    }
  });
  if (inCount > 2) {
    cols.push({ type: 'inactive', start: inStart, count: inCount });
  } else {
    for (let i = 0; i < inCount; i++) {
      const d = new Date(inStart + 'T00:00:00');
      d.setDate(d.getDate() + i);
      cols.push({ type: 'day', date: d.toISOString().split('T')[0] });
    }
  }
  return cols;
}

// ── SVG partial-fill circle ───────────────────────────────────────────────────
function CompletionCircle({ rate, color, size = 36, onClick, disabled = false }) {
  const r = (size / 2) - 3;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(rate, 1.0);
  const isDone = rate >= 1.0;

  return (
    <div onClick={disabled ? undefined : onClick}
      style={{ width: size, height: size, position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
        opacity: disabled ? 0.35 : 1, transition: 'opacity 0.2s' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill={isDone ? color : 'transparent'}
          stroke="rgba(255,255,255,0.12)" strokeWidth={2.5} />
        {rate > 0 && (
          <circle cx={size/2} cy={size/2} r={r}
            fill="transparent" stroke={color} strokeWidth={2.5}
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.3s ease' }} />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size < 30 ? 10 : 13,
        color: isDone ? '#000' : color }}>
        {isDone ? '✓' : ''}
      </div>
    </div>
  );
}

// ── Sub-item row ──────────────────────────────────────────────────────────────
function SubItemRow({ item, color, onToggle, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px 7px 44px', borderTop: `1px solid ${C.sep}`,
        background: hov ? 'rgba(0,0,0,0.15)' : 'transparent', transition: 'background 0.1s' }}>
      {/* Circle */}
      <div onClick={() => onToggle(item.id)}
        style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${item.completed_today ? C.success : 'rgba(255,255,255,0.2)'}`,
          background: item.completed_today ? C.success : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#000', transition: 'all 0.15s' }}>
        {item.completed_today ? '✓' : ''}
      </div>
      <span style={{ flex: 1, fontSize: 13, color: item.completed_today ? C.t3 : C.t2,
        textDecoration: item.completed_today ? 'line-through' : 'none' }}>
        {item.name}
      </span>
      {hov && (
        <button onClick={() => onDelete(item.id)}
          style={{ background: 'none', border: 'none', color: C.danger,
            cursor: 'pointer', fontSize: 14, padding: '0 2px' }}>×</button>
      )}
    </div>
  );
}

// ── Add sub-item inline input ─────────────────────────────────────────────────
function AddSubItemInput({ onAdd }) {
  const [val, setVal] = useState('');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(''); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px 8px 44px', borderTop: `1px solid ${C.sep}` }}>
      <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Add sub-item…"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: C.t1, fontSize: 13, fontFamily: C.font }} />
      <button onClick={submit}
        style={{ background: C.accent + '22', border: `1px solid ${C.accent + '44'}`,
          color: C.accent, borderRadius: 6, padding: '3px 10px', fontSize: 12,
          cursor: 'pointer', fontFamily: C.font }}>Add</button>
    </div>
  );
}

// ── Past Track section (inline, not popup) ────────────────────────────────────
function PastTrackSection({ habits }) {
  const [range, setRange] = useState('3m');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const r = await api.get(`/api/habits/history/all/?range=${range}`);
        setData(r.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [range]);

  if (!data && !loading) return null;

  const cols = data ? buildColumns(data.start_date, data.end_date, data.habits) : [];

  // Month boundary labels for column headers
  const monthLabels = {};
  cols.forEach((col, i) => {
    if (col.type === 'day') {
      const d = new Date(col.date + 'T00:00:00');
      if (d.getDate() === 1 || i === 0) {
        monthLabels[i] = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      }
    }
  });

  const CELL_W = 10;  // px per day cell
  const GAP = 2;
  const NAME_W = 160;

  return (
    <div style={{ marginTop: 20, background: C.card, border: `1px solid ${C.sep}`,
      borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${C.sep}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>📊 Past Track</span>
        {/* Range selector */}
        <div style={{ display: 'flex', background: C.inputBg, borderRadius: 8, padding: 3, gap: 2 }}>
          {[['1w','1W'],['1m','1M'],['3m','3M'],['all','All']].map(([val, label]) => (
            <button key={val} onClick={() => setRange(val)}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: 'none', fontFamily: C.font, fontWeight: range === val ? 700 : 400,
                background: range === val ? C.accent : 'transparent',
                color: range === val ? '#000' : C.t2 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: C.t3, fontSize: 13 }}>
          Loading history…
        </div>
      ) : (
        <div style={{ overflow: 'hidden' }}>
          {/* Scrollable area with sticky name column */}
          <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', minWidth: 'max-content' }}>
              {/* Fixed name column */}
              <div style={{ width: NAME_W, flexShrink: 0, position: 'sticky', left: 0,
                background: C.card, zIndex: 2, borderRight: `1px solid ${C.sep}` }}>
                {/* Header row spacer */}
                <div style={{ height: 32 }} />
                {/* Habit names */}
                {(data?.habits || []).map(h => (
                  <div key={h.habit_id}
                    style={{ height: 22, display: 'flex', alignItems: 'center',
                      padding: '0 12px', marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                      background: COLOR_MAP[h.habit_color] || C.accent,
                      flexShrink: 0, marginRight: 6 }} />
                    <span style={{ fontSize: 11, color: C.t1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {h.habit_name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Scrollable dates area */}
              <div style={{ padding: '0 12px 12px' }}>
                {/* Month labels row */}
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 32, gap: GAP }}>
                  {cols.map((col, i) => (
                    <div key={i}
                      style={{ width: col.type === 'inactive' ? 24 : CELL_W,
                        flexShrink: 0, fontSize: 8, color: C.t3, whiteSpace: 'nowrap',
                        overflow: 'visible' }}>
                      {col.type === 'day' && monthLabels[i] ? (
                        <span style={{ position: 'relative', left: 0 }}>{monthLabels[i]}</span>
                      ) : col.type === 'inactive' ? (
                        <span style={{ fontSize: 7, color: C.t3, opacity: 0.6 }}>…</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Habit rows */}
                {(data?.habits || []).map(h => {
                  const doneSet = new Set(h.logs.filter(l => l.completed).map(l => l.date));
                  const accentColor = COLOR_MAP[h.habit_color] || C.accent;

                  return (
                    <div key={h.habit_id}
                      style={{ display: 'flex', gap: GAP, marginBottom: 4, alignItems: 'center' }}>
                      {cols.map((col, i) => {
                        if (col.type === 'inactive') {
                          return (
                            <div key={i}
                              title={`${col.count} inactive days`}
                              style={{ width: 24, height: CELL_W + 2, borderRadius: 2,
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px dashed ${C.sep}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0 }}>
                              <span style={{ fontSize: 7, color: C.t3 }}>~</span>
                            </div>
                          );
                        }
                        const done = doneSet.has(col.date);
                        return (
                          <div key={i} title={col.date}
                            style={{ width: CELL_W, height: CELL_W + 2, borderRadius: 2, flexShrink: 0,
                              background: done ? accentColor : 'rgba(255,255,255,0.06)',
                              transition: 'background 0.1s' }} />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date range label */}
          {data && (
            <div style={{ padding: '6px 16px 10px', fontSize: 11, color: C.t3, textAlign: 'right', borderTop: `1px solid ${C.sep}` }}>
              {new Date(data.start_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
              {' — '}
              {new Date(data.end_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Global ⋮ options menu (beside + New Habit) ────────────────────────────────
function GlobalOptionsMenu({ pos, viewMode, onView, showPastTrack, onTogglePastTrack, onClose }) {
  useEffect(() => {
    const h = () => onClose();
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 400,
        background: '#3A3A3C', border: `1px solid ${C.sep}`, borderRadius: 10,
        width: 176, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden',
        fontFamily: C.font }}>
      {/* View options */}
      <div style={{ padding: '6px 14px 4px', fontSize: 10, color: C.t3,
        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        View
      </div>
      {[['card','⊞ Card View'],['table','☰ Table View']].map(([v, label]) => (
        <MenuBtn key={v} label={label} color={viewMode === v ? C.accent : C.t1}
          onClick={() => { onView(v); onClose(); }} />
      ))}
      <div style={{ borderTop: `1px solid ${C.sep}`, margin: '4px 0' }} />
      <MenuBtn
        label={showPastTrack ? '📊 Hide Past Track' : '📊 Past Track'}
        color={showPastTrack ? C.accent : C.t1}
        onClick={() => { onTogglePastTrack(); onClose(); }}
      />
    </div>
  );
}

// ── Per-habit ⋮ menu ───────────────────────────────────────────────────────────
function HabitMenu({ habit, pos, onEdit, onDelete, onNumeric, onCalendar, onClose }) {
  useEffect(() => {
    const h = () => onClose();
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const items = [
    ['✏️ Edit', () => { onEdit(habit); onClose(); }, C.t1],
    ...(habit.target_value
      ? [['🔢 Log Number', () => { onNumeric(habit); onClose(); }, C.t1]]
      : []
    ),
    ['📅 Add to Calendar', () => { onCalendar(habit); onClose(); }, C.t1],
    ['🗑 Delete', () => { onDelete(habit.id); onClose(); }, C.danger],
  ];

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 400,
        background: '#3A3A3C', border: `1px solid ${C.sep}`, borderRadius: 10,
        width: 172, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden',
        fontFamily: C.font }}>
      {items.map(([label, action, color]) => (
        <MenuBtn key={label} label={label} color={color} onClick={action} />
      ))}
    </div>
  );
}

function MenuBtn({ label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13,
        color, background: hov ? C.hover : 'transparent', border: 'none',
        cursor: 'pointer', fontFamily: C.font }}>
      {label}
    </button>
  );
}

// ── Numeric log modal ─────────────────────────────────────────────────────────
function NumericModal({ habit, onSave, onClose }) {
  const [value, setValue] = useState('');
  const accentColor = COLOR_MAP[habit.color] || C.accent;
  const pct = value && habit.target_value
    ? Math.round((parseInt(value) / habit.target_value) * 100)
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: '#2C2C2E', border: `1px solid ${C.sep}`, borderRadius: 16,
        width: 300, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.t1 }}>{habit.name}</div>
          <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>
            Target: {habit.target_value || '?'} per day
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <input autoFocus type="number" min="0" value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && value && onSave(parseInt(value))}
            style={{ width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`,
              borderRadius: 8, padding: '12px', color: C.t1, fontSize: 28,
              outline: 'none', fontFamily: C.font, boxSizing: 'border-box',
              textAlign: 'center', fontWeight: 700 }}
            placeholder="0" />
          {pct !== null && (
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13,
              color: pct >= 100 ? C.success : accentColor, fontWeight: 600 }}>
              {pct >= 100 ? `✓ ${pct}% — Target reached!` : `${pct}% of target`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px',
          borderTop: `1px solid ${C.sep}` }}>
          <button onClick={onClose}
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`,
              color: C.t1, padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontFamily: C.font }}>Cancel</button>
          <button onClick={() => value && onSave(parseInt(value))}
            style={{ flex: 1, background: accentColor, color: '#000', border: 'none',
              padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: C.font }}>Log It</button>
        </div>
      </div>
    </div>
  );
}

// ── Add to Calendar modal ─────────────────────────────────────────────────────
function CalendarModal({ habit, onSave, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [rec, setRec] = useState(habit.frequency === 'daily' ? 'daily' : 'weekly');
  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`,
    borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none',
    fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5,
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: '#2C2C2E', border: `1px solid ${C.sep}`, borderRadius: 16,
        width: 360, fontFamily: C.font }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.t1 }}>Add to Calendar</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: C.inputBg, borderRadius: 8, padding: '10px 12px',
            fontSize: 13, color: C.t1, fontWeight: 600 }}>🎯 {habit.name}</div>
          <div><label style={lbl}>Start Date</label>
            <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label style={lbl}>Time</label>
            <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)} /></div>
          <div><label style={lbl}>Repeat</label>
            <select style={inp} value={rec} onChange={e => setRec(e.target.value)}>
              <option value="none">One time</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px',
          borderTop: `1px solid ${C.sep}` }}>
          <button onClick={onClose}
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`,
              color: C.t1, padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontFamily: C.font }}>Cancel</button>
          <button onClick={() => onSave({ date, startTime: time, recurrence: rec })}
            style={{ flex: 1, background: C.accent, color: '#000', border: 'none',
              padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: C.font }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Habit Modal ──────────────────────────────────────────────────────────
function EditHabitModal({ habit, onSave, onClose }) {
  const [name, setName]         = useState(habit.name);
  const [freq, setFreq]         = useState(habit.frequency);
  const [color, setColor]       = useState(habit.color);
  const [tod, setTod]           = useState(habit.time_of_day || 'anytime');
  const [target, setTarget]     = useState(habit.target_value ?? '');
  const [weekdays, setWeekdays] = useState(
    habit.weekdays ? habit.weekdays.split(',').map(Number) : []
  );

  const toggleDay = d => setWeekdays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`,
    borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none',
    fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5,
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: '#2C2C2E', border: `1px solid ${C.sep}`, borderRadius: 16,
        width: '100%', maxWidth: 440, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.t1 }}>Edit Habit</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
          maxHeight: '65vh', overflowY: 'auto' }}>
          <div><label style={lbl}>Name</label>
            <input autoFocus style={inp} value={name} onChange={e => setName(e.target.value)} /></div>

          {/* Frequency */}
          <div><label style={lbl}>Frequency</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['daily','weekly'].map(f => (
                <button key={f} onClick={() => setFreq(f)}
                  style={{ flex: 1, padding: 9, borderRadius: 8, cursor: 'pointer',
                    fontFamily: C.font, fontSize: 13, border: 'none',
                    background: freq === f ? C.accent : C.inputBg,
                    color: freq === f ? '#000' : C.t1,
                    fontWeight: freq === f ? 700 : 400 }}>
                  {f === 'daily' ? '🔁 Daily' : '📅 Weekly'}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly day picker */}
          {freq === 'weekly' && (
            <div>
              <label style={lbl}>Active Days</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {DAY_LABELS.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer',
                      border: 'none', fontFamily: C.font, fontSize: 11,
                      background: weekdays.includes(i) ? C.accent : C.inputBg,
                      color: weekdays.includes(i) ? '#000' : C.t2,
                      fontWeight: weekdays.includes(i) ? 700 : 400 }}>
                    {DAY_SHORT[i]}
                  </button>
                ))}
              </div>
              {weekdays.length === 0 && (
                <p style={{ fontSize: 11, color: C.danger, margin: '4px 0 0' }}>
                  Select at least one day
                </p>
              )}
            </div>
          )}

          {/* Time of day */}
          <div><label style={lbl}>Time of Day</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['anytime','🔁'],['morning','🌅'],['afternoon','☀️'],['evening','🌙'],['night','🌃']].map(([v, e]) => (
                <button key={v} onClick={() => setTod(v)}
                  style={{ flex: '1 1 60px', padding: '7px 4px', borderRadius: 8,
                    cursor: 'pointer', border: 'none', fontFamily: C.font, fontSize: 11,
                    background: tod === v ? C.accent : C.inputBg,
                    color: tod === v ? '#000' : C.t2,
                    fontWeight: tod === v ? 700 : 400 }}>
                  {e} {v}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric target */}
          <div><label style={lbl}>Numeric Target <span style={{ color: C.t3, textTransform: 'none' }}>(e.g. 20 push-ups)</span></label>
            <input type="number" style={inp} placeholder="Leave blank for yes/no"
              value={target} onChange={e => setTarget(e.target.value)} /></div>

          {/* Color */}
          <div><label style={lbl}>Color</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(COLOR_MAP).map(([n, hex]) => (
                <button key={n} onClick={() => setColor(n)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: hex,
                    cursor: 'pointer',
                    border: color === n ? '3px solid white' : '3px solid transparent' }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px',
          borderTop: `1px solid ${C.sep}` }}>
          <button onClick={onClose}
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`,
              color: C.t1, padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontFamily: C.font }}>Cancel</button>
          <button
            onClick={() => {
              if (!name.trim()) return;
              if (freq === 'weekly' && weekdays.length === 0) return;
              onSave({
                name, frequency: freq, color, time_of_day: tod,
                target_value: target ? parseInt(target) : null,
                weekdays: freq === 'weekly' ? weekdays.sort().join(',') : '',
              });
            }}
            style={{ flex: 1, background: C.accent, color: '#000', border: 'none',
              padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: C.font }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Habit Modal (same fields as Edit) ─────────────────────────────────────
function NewHabitModal({ onSave, onClose }) {
  const [name, setName]         = useState('');
  const [freq, setFreq]         = useState('daily');
  const [color, setColor]       = useState('yellow');
  const [tod, setTod]           = useState('anytime');
  const [target, setTarget]     = useState('');
  const [weekdays, setWeekdays] = useState([]);

  const toggleDay = d => setWeekdays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const canSave = name.trim() && (freq === 'daily' || weekdays.length > 0);

  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`,
    borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none',
    fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5,
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: '#2C2C2E', border: `1px solid ${C.sep}`, borderRadius: 16,
        width: '100%', maxWidth: 440, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.t1 }}>New Habit</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
          maxHeight: '65vh', overflowY: 'auto' }}>
          <div><label style={lbl}>Habit Name</label>
            <input autoFocus style={inp} placeholder="e.g. Push-ups, Read 20 pages, Meditate"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSave && onSave({
                name, frequency: freq, color, time_of_day: tod,
                target_value: target ? parseInt(target) : null,
                weekdays: freq === 'weekly' ? weekdays.sort().join(',') : '',
              })} /></div>

          <div><label style={lbl}>Frequency</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['daily','weekly'].map(f => (
                <button key={f} onClick={() => setFreq(f)}
                  style={{ flex: 1, padding: 9, borderRadius: 8, cursor: 'pointer',
                    border: 'none', fontFamily: C.font, fontSize: 13,
                    background: freq === f ? C.accent : C.inputBg,
                    color: freq === f ? '#000' : C.t1,
                    fontWeight: freq === f ? 700 : 400 }}>
                  {f === 'daily' ? '🔁 Daily' : '📅 Weekly'}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly day picker — only shown when weekly selected */}
          {freq === 'weekly' && (
            <div>
              <label style={lbl}>Active Days <span style={{ color: C.t3, textTransform: 'none' }}>(pick which days)</span></label>
              <div style={{ display: 'flex', gap: 6 }}>
                {DAY_LABELS.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                      border: 'none', fontFamily: C.font, fontSize: 11,
                      background: weekdays.includes(i) ? C.accent : C.inputBg,
                      color: weekdays.includes(i) ? '#000' : C.t2,
                      fontWeight: weekdays.includes(i) ? 700 : 400 }}>
                    {DAY_SHORT[i]}
                  </button>
                ))}
              </div>
              {weekdays.length === 0 && (
                <p style={{ fontSize: 11, color: C.danger, margin: '4px 0 0' }}>
                  Select at least one day to continue
                </p>
              )}
            </div>
          )}

          <div><label style={lbl}>Time of Day <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['anytime','🔁'],['morning','🌅'],['afternoon','☀️'],['evening','🌙'],['night','🌃']].map(([v, e]) => (
                <button key={v} onClick={() => setTod(v)}
                  style={{ flex: '1 1 60px', padding: '7px 4px', borderRadius: 8,
                    cursor: 'pointer', border: 'none', fontFamily: C.font, fontSize: 11,
                    background: tod === v ? C.accent : C.inputBg,
                    color: tod === v ? '#000' : C.t2,
                    fontWeight: tod === v ? 700 : 400 }}>
                  {e} {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Numeric Target <span style={{ color: C.t3, textTransform: 'none' }}>(e.g. 20 push-ups/day)</span></label>
            <input type="number" style={inp} placeholder="Leave blank for yes/no habit"
              value={target} onChange={e => setTarget(e.target.value)} />
          </div>

          <div><label style={lbl}>Color</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(COLOR_MAP).map(([n, hex]) => (
                <button key={n} onClick={() => setColor(n)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: hex,
                    cursor: 'pointer',
                    border: color === n ? '3px solid white' : '3px solid transparent' }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px',
          borderTop: `1px solid ${C.sep}` }}>
          <button onClick={onClose}
            style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.sep}`,
              color: C.t1, padding: 10, borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontFamily: C.font }}>Cancel</button>
          <button disabled={!canSave}
            onClick={() => canSave && onSave({
              name, frequency: freq, color, time_of_day: tod,
              target_value: target ? parseInt(target) : null,
              weekdays: freq === 'weekly' ? weekdays.sort().join(',') : '',
            })}
            style={{ flex: 1, background: C.accent, color: '#000', border: 'none',
              padding: 10, borderRadius: 10, cursor: canSave ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700, fontFamily: C.font,
              opacity: canSave ? 1 : 0.4 }}>
            Create Habit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Weekly day availability label ─────────────────────────────────────────────
function WeekdayBar({ weekdays: wdStr }) {
  if (!wdStr) return null;
  const selected = wdStr.split(',').map(Number);
  const today = todayIndex();
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
      {DAY_SHORT.map((d, i) => (
        <div key={i} title={DAY_LABELS[i]}
          style={{ width: 16, height: 16, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, fontFamily: C.font,
            background: selected.includes(i)
              ? (i === today ? C.accent : 'rgba(255,214,10,0.2)')
              : 'rgba(255,255,255,0.05)',
            color: selected.includes(i)
              ? (i === today ? '#000' : C.accent)
              : C.t3 }}>
          {d}
        </div>
      ))}
    </div>
  );
}

// ── Habit Card (card view) ────────────────────────────────────────────────────
function HabitCard({ habit, viewMode, onToggle, onToggleSubItem, onMenuOpen, onAddSubItem, onDeleteSubItem }) {
  const [subOpen, setSubOpen] = useState(false);
  const [addingSubItem, setAddingSubItem] = useState(false);
  const accentColor = COLOR_MAP[habit.color] || C.accent;
  const rate = habit.completion_rate_today || 0;
  const hasSubItems = (habit.sub_items || []).length > 0;
  const available = isAvailableToday(habit);
  const isWeekly = habit.frequency === 'weekly';

  const handleCircleClick = (e) => {
    e.stopPropagation();
    if (!available) return;
    onToggle(habit.id, true); // always cascade for parent circle
  };

  if (viewMode === 'table') {
    return (
      <div style={{ borderBottom: `1px solid ${C.sep}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: 'transparent' }}>
          {/* Name + meta (LEFT) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500,
              color: habit.completed_today ? C.t3 : (available ? C.t1 : C.t3),
              textDecoration: habit.completed_today ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habit.name}
              {!available && (
                <span style={{ fontSize: 10, color: C.t3, marginLeft: 6 }}>
                  (not today)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              {habit.streak > 0 && (
                <span style={{ fontSize: 11, color: accentColor }}>🔥 {habit.streak}</span>
              )}
              {habit.target_value && habit.actual_today !== null && (
                <span style={{ fontSize: 11, color: C.t3 }}>
                  {habit.actual_today}/{habit.target_value}
                </span>
              )}
            </div>
          </div>

          {/* Expand sub-items arrow */}
          {hasSubItems && (
            <button onClick={e => { e.stopPropagation(); setSubOpen(s => !s); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: C.t3, fontSize: 13, padding: 4, transition: 'transform 0.2s',
                transform: subOpen ? 'rotate(90deg)' : 'none' }}>▶</button>
          )}

          {/* Circle RIGHT side in table view */}
          <CompletionCircle rate={rate} color={accentColor} size={28}
            onClick={handleCircleClick} disabled={!available} />

          {/* 3-dots */}
          <button onClick={e => { e.stopPropagation(); onMenuOpen(e, habit); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: C.t3, fontSize: 18, padding: '0 2px', lineHeight: 1 }}>⋮</button>
        </div>

        {/* Sub-items */}
        {subOpen && (
          <div style={{ background: 'rgba(0,0,0,0.1)' }}>
            {(habit.sub_items || []).map(si => (
              <SubItemRow key={si.id} item={si} color={accentColor}
                onToggle={onToggleSubItem}
                onDelete={id => onDeleteSubItem(habit.id, id)} />
            ))}
            {addingSubItem ? (
              <AddSubItemInput onAdd={name => {
                onAddSubItem(habit.id, name);
                setAddingSubItem(false);
              }} />
            ) : (
              <button onClick={() => setAddingSubItem(true)}
                style={{ display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px 8px 44px', background: 'none', border: 'none',
                  borderTop: `1px solid ${C.sep}`, color: C.t3, fontSize: 12,
                  cursor: 'pointer', fontFamily: C.font }}>
                + Add sub-item
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Card view ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.card,
      border: `1px solid ${habit.completed_today ? accentColor + '50' : C.sep}`,
      borderRadius: 14, overflow: 'hidden', marginBottom: 8, transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
        {/* Circle LEFT */}
        <CompletionCircle rate={rate} color={accentColor} size={38}
          onClick={handleCircleClick} disabled={!available} />

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600,
            color: habit.completed_today ? C.t2 : (available ? C.t1 : C.t3),
            textDecoration: habit.completed_today ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.name}
            {!available && <span style={{ fontSize: 11, color: C.t3, marginLeft: 6 }}>not today</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
            {habit.streak > 0 && (
              <span style={{ fontSize: 11, color: accentColor, fontWeight: 600 }}>
                🔥 {habit.streak}
              </span>
            )}
            {habit.target_value && (
              <span style={{ fontSize: 11, color: C.t3 }}>
                {habit.actual_today !== null ? `${habit.actual_today}/` : ''}{habit.target_value}
              </span>
            )}
            <span style={{ fontSize: 11, color: C.t3 }}>
              {habit.total_completions} total
            </span>
          </div>
          {/* Weekly day bar */}
          {isWeekly && habit.weekdays && <WeekdayBar weekdays={habit.weekdays} />}
        </div>

        {/* Expand arrow */}
        <button onClick={e => { e.stopPropagation(); setSubOpen(s => !s); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: subOpen ? C.t2 : C.t3, fontSize: 13, padding: 4,
            transition: 'transform 0.2s',
            transform: subOpen ? 'rotate(90deg)' : 'none' }}>▶</button>

        {/* 3-dots */}
        <button onClick={e => { e.stopPropagation(); onMenuOpen(e, habit); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: C.t3, fontSize: 20, padding: '0 4px', lineHeight: 1 }}>⋮</button>
      </div>

      {/* Sub-items accordion */}
      {subOpen && (
        <div style={{ background: 'rgba(0,0,0,0.15)' }}>
          {(habit.sub_items || []).length === 0 && !addingSubItem && (
            <div style={{ padding: '8px 12px 8px 44px', fontSize: 12, color: C.t3,
              borderTop: `1px solid ${C.sep}` }}>
              No sub-items yet
            </div>
          )}
          {(habit.sub_items || []).map(si => (
            <SubItemRow key={si.id} item={si} color={accentColor}
              onToggle={onToggleSubItem}
              onDelete={id => onDeleteSubItem(habit.id, id)} />
          ))}
          {addingSubItem ? (
            <AddSubItemInput onAdd={name => {
              onAddSubItem(habit.id, name);
              setAddingSubItem(false);
            }} />
          ) : (
            <button onClick={() => setAddingSubItem(true)}
              style={{ display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px 8px 44px', background: 'none', border: 'none',
                borderTop: `1px solid ${C.sep}`, color: C.t3, fontSize: 12,
                cursor: 'pointer', fontFamily: C.font }}>
              + Add sub-item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Time section with collapse ────────────────────────────────────────────────
function TimeSection({ section, habits, viewMode, onToggle, onToggleSubItem,
  onMenuOpen, onAddSubItem, onDeleteSubItem }) {
  const [open, setOpen] = useState(true);
  if (habits.length === 0) return null;

  const doneCount = habits.filter(h => h.completed_today).length;

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(s => !s)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
          marginBottom: open ? 8 : 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.t2, fontFamily: C.font }}>
          {section.label}
        </span>
        <span style={{ fontSize: 11, color: C.t3 }}>{doneCount}/{habits.length}</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: C.t3, fontSize: 11, transition: 'transform 0.2s',
          display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none' }}>▶</span>
      </button>

      {open && (
        viewMode === 'table' ? (
          <div style={{ background: C.card, borderRadius: 12,
            border: `1px solid ${C.sep}`, overflow: 'hidden' }}>
            {habits.map(h => (
              <HabitCard key={h.id} habit={h} viewMode="table"
                onToggle={onToggle} onToggleSubItem={onToggleSubItem}
                onMenuOpen={onMenuOpen}
                onAddSubItem={onAddSubItem} onDeleteSubItem={onDeleteSubItem} />
            ))}
          </div>
        ) : (
          habits.map(h => (
            <HabitCard key={h.id} habit={h} viewMode="card"
              onToggle={onToggle} onToggleSubItem={onToggleSubItem}
              onMenuOpen={onMenuOpen}
              onAddSubItem={onAddSubItem} onDeleteSubItem={onDeleteSubItem} />
          ))
        )
      )}
    </div>
  );
}

// ── Main Habits Page ──────────────────────────────────────────────────────────
export default function Habits() {
  const [habits, setHabits]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [viewMode, setViewMode]       = useState('card');
  const [filter, setFilter]           = useState('all');
  const [showNewHabit, setShowNewHabit]   = useState(false);
  const [editingHabit, setEditingHabit]   = useState(null);
  const [numericHabit, setNumericHabit]   = useState(null);
  const [calendarHabit, setCalendarHabit] = useState(null);
  const [menu, setMenu]               = useState(null); // per-habit ⋮
  const [globalMenu, setGlobalMenu]   = useState(null); // header ⋮
  const [showPastTrack, setShowPastTrack] = useState(false);
  const pendingRef = useRef(new Set()); // prevent double-click race

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    setLoading(true);
    try { const r = await api.get('/api/habits/'); setHabits(r.data); }
    catch {}
    setLoading(false);
  };

  // ── OPTIMISTIC TOGGLE — 0ms perceived lag ───────────────────────────────────
  const handleToggle = useCallback(async (id, cascade = false) => {
    if (pendingRef.current.has(id)) return; // block double-click
    pendingRef.current.add(id);

    const original = habits.find(h => h.id === id);
    if (!original) { pendingRef.current.delete(id); return; }

    const newDone = !original.completed_today;

    // Immediate UI update
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const u = { ...h, completed_today: newDone, completion_rate_today: newDone ? 1.0 : 0.0 };
      if (cascade) {
        u.sub_items = (h.sub_items || []).map(si => ({ ...si, completed_today: newDone }));
      }
      return u;
    }));

    try {
      const ep = cascade ? `/api/habits/${id}/cascade/` : `/api/habits/${id}/toggle/`;
      const r = await api.post(ep);
      setHabits(prev => prev.map(h => h.id === id ? r.data : h));
    } catch {
      setHabits(prev => prev.map(h => h.id === id ? original : h));
    } finally {
      pendingRef.current.delete(id);
    }
  }, [habits]);

  // ── Sub-item toggle (optimistic) ────────────────────────────────────────────
  const handleToggleSubItem = useCallback(async (siId) => {
    setHabits(prev => prev.map(h => ({
      ...h,
      sub_items: (h.sub_items || []).map(si =>
        si.id === siId ? { ...si, completed_today: !si.completed_today } : si
      ),
    })));
    try {
      const r = await api.post(`/api/subitems/${siId}/toggle/`);
      setHabits(prev => prev.map(h => ({
        ...h,
        sub_items: (h.sub_items || []).map(si => si.id === siId ? r.data : si),
      })));
    } catch {
      setHabits(prev => prev.map(h => ({
        ...h,
        sub_items: (h.sub_items || []).map(si =>
          si.id === siId ? { ...si, completed_today: !si.completed_today } : si
        ),
      })));
    }
  }, []);

  const handleCreate = async (data) => {
    try {
      const r = await api.post('/api/habits/', data);
      setHabits(prev => [...prev, r.data]);
      setShowNewHabit(false);
    } catch { alert('Could not create habit.'); }
  };

  const handleEdit = async (data) => {
    if (!editingHabit) return;
    try {
      const r = await api.put(`/api/habits/${editingHabit.id}/`, data);
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? r.data : h));
      setEditingHabit(null);
    } catch { alert('Could not update.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this habit? History will be preserved.')) return;
    try {
      await api.delete(`/api/habits/${id}/`);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch {}
  };

  const handleNumericLog = async (value) => {
    if (!numericHabit) return;
    try {
      const r = await api.post(`/api/habits/${numericHabit.id}/numeric/`, { actual_value: value });
      setHabits(prev => prev.map(h => h.id === numericHabit.id ? r.data : h));
      setNumericHabit(null);
    } catch { alert('Could not log value.'); }
  };

  const handleAddToCalendar = async ({ date, startTime, recurrence }) => {
    if (!calendarHabit) return;
    try {
      await api.post('/api/events/', {
        title: `🎯 ${calendarHabit.name}`, event_type: 'other',
        date, start_time: startTime, color: calendarHabit.color || 'yellow',
        notes: `Habit: ${calendarHabit.name}`, recurrence,
      });
      setCalendarHabit(null);
    } catch { alert('Could not add to calendar.'); }
  };

  const handleAddSubItem = async (habitId, name) => {
    try {
      const r = await api.post(`/api/habits/${habitId}/add-subitem/`, { name });
      setHabits(prev => prev.map(h => h.id === habitId ? r.data : h));
    } catch { alert('Could not add sub-item.'); }
  };

  const handleDeleteSubItem = async (habitId, subItemId) => {
    try {
      await api.delete(`/api/subitems/${subItemId}/`);
      setHabits(prev => prev.map(h =>
        h.id === habitId
          ? { ...h, sub_items: h.sub_items.filter(si => si.id !== subItemId) }
          : h
      ));
    } catch { alert('Could not delete sub-item.'); }
  };

  const handleMenuOpen = (e, habit) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ habit, pos: { x: Math.max(0, rect.left - 165), y: rect.bottom + 4 } });
  };

  const handleGlobalMenuOpen = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setGlobalMenu({ pos: { x: Math.max(0, rect.right - 176), y: rect.bottom + 4 } });
  };

  // Group habits
  const filtered = habits.filter(h =>
    filter === 'all' ? true : h.frequency === filter
  );
  const grouped = {};
  TIME_SECTIONS.forEach(s => { grouped[s.key] = []; });
  filtered.forEach(h => {
    const key = h.time_of_day || 'anytime';
    (grouped[key] || grouped['anytime']).push(h);
  });

  const completedCount = habits.filter(h => h.completed_today).length;
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, background: C.bg,
      fontFamily: C.font, color: C.t1, overflow: 'hidden' }}
      onClick={() => { setMenu(null); setGlobalMenu(null); }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 196, background: C.sidebar, display: 'flex',
        flexDirection: 'column', borderRight: `1px solid ${C.sep}`, flexShrink: 0 }}>
        <div style={{ padding: '18px 14px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.t3,
            textTransform: 'uppercase', letterSpacing: '0.1em' }}>Habits</span>
        </div>
        <div style={{ flex: 1, padding: '4px 8px' }}>
          {[['all','All Habits'],['daily','🔁 Daily'],['weekly','📅 Weekly']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ width: '100%', textAlign: 'left', padding: '7px 10px',
                borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', marginBottom: 1,
                background: filter === v ? C.accent : 'transparent',
                color: filter === v ? '#000' : C.t1,
                fontWeight: filter === v ? 600 : 400, fontFamily: C.font }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.sep}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 2 }}>
                Today's Habits
              </h1>
              <p style={{ fontSize: 11, color: C.t3, margin: 0 }}>{todayLabel}</p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Global ⋮ options menu */}
              <button onClick={handleGlobalMenuOpen}
                style={{ background: C.inputBg, border: `1px solid ${C.sep}`,
                  borderRadius: 8, padding: '7px 10px', fontSize: 16, cursor: 'pointer',
                  color: C.t2, display: 'flex', alignItems: 'center' }}>
                ⋮
              </button>
              <button onClick={() => setShowNewHabit(true)}
                style={{ background: C.accent, color: '#000', border: 'none',
                  borderRadius: 10, padding: '9px 18px', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                + New Habit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {habits.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: C.t2 }}>
                  {completedCount}/{habits.length} completed
                </span>
                <span style={{ fontSize: 11, color: C.t3 }}>
                  {Math.round((completedCount / habits.length) * 100)}%
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)',
                borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: C.accent,
                  width: `${(completedCount / habits.length) * 100}%`,
                  borderRadius: 100, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

          {loading ? (
            [1,2,3].map(i => (
              <div key={i} style={{ height: 64, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', marginBottom: 8,
                animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '50%', textAlign: 'center' }}>
              <div style={{ fontSize: 52, opacity: 0.3, marginBottom: 16 }}>🎯</div>
              <p style={{ color: C.t2, fontSize: 15, marginBottom: 8 }}>No habits yet</p>
              <button onClick={() => setShowNewHabit(true)}
                style={{ background: C.accent, color: '#000', border: 'none',
                  borderRadius: 10, padding: '10px 24px', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', fontFamily: C.font }}>
                + Add First Habit
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 720 }}>
              {TIME_SECTIONS.map(section => (
                <TimeSection key={section.key}
                  section={section}
                  habits={grouped[section.key] || []}
                  viewMode={viewMode}
                  onToggle={handleToggle}
                  onToggleSubItem={handleToggleSubItem}
                  onMenuOpen={handleMenuOpen}
                  onAddSubItem={handleAddSubItem}
                  onDeleteSubItem={handleDeleteSubItem}
                />
              ))}

              {/* Inline Past Track section */}
              {showPastTrack && <PastTrackSection habits={habits} />}
            </div>
          )}
        </div>
      </div>

      {/* ── Context menus ── */}
      {globalMenu && (
        <GlobalOptionsMenu
          pos={globalMenu.pos}
          viewMode={viewMode}
          onView={setViewMode}
          showPastTrack={showPastTrack}
          onTogglePastTrack={() => setShowPastTrack(s => !s)}
          onClose={() => setGlobalMenu(null)}
        />
      )}

      {menu && (
        <HabitMenu
          habit={menu.habit}
          pos={menu.pos}
          onEdit={h => setEditingHabit(h)}
          onDelete={handleDelete}
          onNumeric={h => setNumericHabit(h)}
          onCalendar={h => setCalendarHabit(h)}
          onClose={() => setMenu(null)}
        />
      )}

      {/* ── Modals ── */}
      {showNewHabit   && <NewHabitModal onSave={handleCreate} onClose={() => setShowNewHabit(false)} />}
      {editingHabit   && <EditHabitModal habit={editingHabit} onSave={handleEdit} onClose={() => setEditingHabit(null)} />}
      {numericHabit   && <NumericModal habit={numericHabit} onSave={handleNumericLog} onClose={() => setNumericHabit(null)} />}
      {calendarHabit  && <CalendarModal habit={calendarHabit} onSave={handleAddToCalendar} onClose={() => setCalendarHabit(null)} />}
    </div>
  );
}