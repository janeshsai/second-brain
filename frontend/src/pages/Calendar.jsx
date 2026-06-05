import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks,
         addMonths, addYears, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import C from '../theme';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay, locales: { 'en-US': enUS },
});

const COLOR_MAP = { yellow: '#FFD60A', blue: '#0A84FF', green: '#32D74B', red: '#FF453A', purple: '#BF5AF2', orange: '#FF9F0A' };
const TYPE_COLOR = { meeting: '#0A84FF', reminder: '#FF9F0A', learning_session: '#BF5AF2', task: '#32D74B', exercise: '#FF453A', other: '#636366' };

function YearView({ date, events, onSelectDay }) {
  const year = date.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {months.map(monthStart => {
        const monthName = format(monthStart, 'MMMM');
        const daysInMonth = new Date(year, monthStart.getMonth() + 1, 0).getDate();
        const firstDayOfWeek = getDay(monthStart);
        const today = new Date();
        const eventDays = new Set(events.filter(e => {
          const ed = new Date(e.start); return ed.getMonth() === monthStart.getMonth() && ed.getFullYear() === year;
        }).map(e => new Date(e.start).getDate()));
        return (
          <Card key={monthName} style={{ background: '#2C2C2E', borderRadius: 16, padding: 14, border: `1px solid ${C.sep}`, minHeight: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: C.t1 }}>{monthName}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (<div key={i} style={{ fontSize: 9, color: C.t3, textAlign: 'center', fontWeight: 700 }}>{d}</div>))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const isToday = today.getDate() === dayNum && today.getMonth() === monthStart.getMonth() && today.getFullYear() === year;
                const hasEvent = eventDays.has(dayNum);
                return (
                  <button key={dayNum} type="button" onClick={() => onSelectDay(new Date(year, monthStart.getMonth(), dayNum))}
                    style={{ width: '100%', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', position: 'relative', background: isToday ? C.accent : 'transparent', color: isToday ? '#000' : C.t2, fontSize: 10, fontWeight: isToday ? 700 : 400, border: 'none' }}>
                    {dayNum}
                    {hasEvent && !isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent, position: 'absolute', bottom: 6 }} />}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MiniCalendar({ currentDate, onSelectDay }) {
  const [mini, setMini] = useState(new Date(currentDate));
  const year = mini.getFullYear();
  const month = mini.getMonth();
  const firstDay = getDay(new Date(year, month, 1));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return (
    <Card style={{ padding: '12px 14px', borderRadius: 16, margin: 12, border: `1px solid ${C.sep}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Button variant="ghost" size="sm" onClick={() => setMini(d => addMonths(d, -1))}>‹</Button>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{format(mini, 'MMM yyyy')}</span>
        <Button variant="ghost" size="sm" onClick={() => setMini(d => addMonths(d, 1))}>›</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ fontSize: 9, color: C.t3, textAlign: 'center', fontWeight: 700 }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1; const d = new Date(year, month, day);
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          return (
            <button key={day} type="button" onClick={() => onSelectDay(d)} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', borderRadius: 6, background: isToday ? C.accent : 'transparent', color: isToday ? '#000' : C.t2, fontWeight: isToday ? 700 : 400, border: 'none' }}>
              {day}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function SubItemRow({ item, onToggle }) {
  return (
    <div onClick={() => onToggle(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.sep}`, cursor: 'pointer' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${item.completed_today ? C.success : 'rgba(255,255,255,0.25)'}`, background: item.completed_today ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{item.completed_today ? '✓' : ''}</div>
      <span style={{ fontSize: 13, color: item.completed_today ? C.t3 : C.t1, textDecoration: item.completed_today ? 'line-through' : 'none', flex: 1 }}>{item.name}</span>
    </div>
  );
}

function PanelCard({ item, type, onToggleHabit, onToggleSubItem, onRemove }) {
  const isRoutine = type === 'routine';
  const accentColor = isRoutine ? (COLOR_MAP[item.color] || C.accent) : (TYPE_COLOR[item.event_type] || C.accent);
  const titleText = item.name || item.title;
  const isDone = !isRoutine && titleText.includes('[DONE]');

  return (
    <Card style={{ background: '#2B2B2D', marginBottom: 12, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.sep}` }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: isDone ? C.t3 : C.t1, textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {titleText}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>
            {isRoutine ? `${(item.sub_items || []).filter(s => s.completed_today).length}/${(item.sub_items || []).length} done` : `${(item.event_type || '').replace('_', ' ')}${item.start_time ? ' • ' + item.start_time.slice(0,5) : ''}`}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} style={{ color: C.t3, minWidth: 28, padding: 0 }}>×</Button>
      </div>
      {isRoutine && (
        <div style={{ padding: '0 16px 12px' }}>
          <button onClick={() => onToggleHabit(item.id)} type="button" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, marginBottom: 8, borderBottom: `1px solid ${C.sep}`, cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', color: item.completed_today ? C.t3 : C.t1, fontFamily: C.font }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${item.completed_today ? accentColor : 'rgba(255,255,255,0.25)'}`, background: item.completed_today ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000' }}>{item.completed_today ? '✓' : ''}</div>
            <span style={{ fontSize: 13, textDecoration: item.completed_today ? 'line-through' : 'none', flex: 1 }}>Mark whole routine done</span>
          </button>
          {(item.sub_items || []).length > 0 ? (item.sub_items || []).map(si => <SubItemRow key={si.id} item={si} onToggle={onToggleSubItem} />) : <p style={{ fontSize: 12, color: C.t3, padding: '6px 0' }}>No sub-items yet.</p>}
        </div>
      )}
      {!isRoutine && item.notes && <div style={{ padding: '0 16px 12px', fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{item.notes}</div>}
    </Card>
  );
}

function EventPopup({ event, habits, rawEvents, onClose }) {
  const isRoutine = event.rawType === 'routine';
  const data = isRoutine ? habits.find(h => h.id === event.rawId) : rawEvents.find(e => e.id === event.rawId);
  if (!data) return null;
  const color = isRoutine ? (COLOR_MAP[data.color] || C.accent) : (TYPE_COLOR[data.event_type] || C.accent);

  return (
    <Modal onClose={onClose}>
      <Card style={{ width: '100%', maxWidth: 360, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: C.t1, flex: 1 }}>{data.name || data.title}</span>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: 0, minWidth: 28 }}>×</Button>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          {isRoutine ? (
            <>
              <div style={{ fontSize: 12, color: C.t3, marginBottom: 8 }}>{data.frequency} • 🔥 {data.streak} day streak • {data.total_completions} total</div>
              {(data.sub_items || []).length > 0 && (
                <div style={{ borderTop: `1px solid ${C.sep}`, paddingTop: 10 }}>
                  {data.sub_items.map(si => (
                    <div key={si.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 12, color: si.completed_today ? C.t3 : C.t1 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${si.completed_today ? C.success : 'rgba(255,255,255,0.2)'}`, background: si.completed_today ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{si.completed_today ? '✓' : ''}</div>
                      <span style={{ textDecoration: si.completed_today ? 'line-through' : 'none' }}>{si.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: C.t3, marginBottom: 8 }}>{(data.event_type || '').replace('_', ' ')}{data.start_time && ` • ${data.start_time.slice(0,5)}`}{data.end_time && ` → ${data.end_time.slice(0,5)}`}</div>
              {data.notes && <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{data.notes}</div>}
            </>
          )}
        </div>
      </Card>
    </Modal>
  );
}

function EventModal({ defaultDate, defaultTime, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('task');
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(defaultTime || '');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [color, setColor] = useState('blue');
  const [notes, setNotes] = useState('');

  const labelStyle = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' };

  return (
    <Modal onClose={onClose}>
      <Card style={{ width: '100%', maxWidth: 520, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.t1 }}>New Event</span>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: 0, minWidth: 28 }}>×</Button>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          <div>
            <div style={labelStyle}>Title</div>
            <Input placeholder="What's happening?" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <div style={labelStyle}>Type</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[['task','Task'],['meeting','Meeting'],['reminder','Reminder'],['learning_session','Learning'],['exercise','Exercise'],['other','Other']].map(([val, label]) => (
                <Button key={val} variant={eventType === val ? 'primary' : 'secondary'} size="sm" onClick={() => setEventType(val)} style={{ minWidth: 92 }}>{label}</Button>
              ))}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Date</div>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={labelStyle}>Start</div>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <div style={labelStyle}>End</div>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <div style={labelStyle}>Recurrence</div>
            <select style={{ width: '100%', borderRadius: 12, border: `1px solid ${C.sep}`, background: C.inputBg, color: C.t1, padding: '12px 14px', fontFamily: C.font, fontSize: 13 }} value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              <option value="none">One time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Color</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(COLOR_MAP).map(([n, hex]) => (
                <button key={n} type="button" onClick={() => setColor(n)} style={{ width: 28, height: 28, borderRadius: '50%', background: hex, cursor: 'pointer', border: color === n ? '3px solid #fff' : '3px solid transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Notes</div>
            <textarea style={{ width: '100%', borderRadius: 12, border: `1px solid ${C.sep}`, background: C.inputBg, color: C.t1, fontFamily: C.font, fontSize: 13, padding: '12px 14px', minHeight: 96, resize: 'vertical' }} rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: `1px solid ${C.sep}` }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button style={{ flex: 1 }} onClick={() => title.trim() && onSave({ title, event_type: eventType, date, start_time: startTime || null, end_time: endTime || null, time_of_day: 'allday', is_all_day: false, recurrence, color, notes })}>Save Event</Button>
        </div>
      </Card>
    </Modal>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [habits, setHabits] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelItems, setPanelItems] = useState([]);
  const [panelDate, setPanelDate] = useState(null);
  const [popup, setPopup] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [newEventTime, setNewEventTime] = useState(null);

  useEffect(() => { fetchHabits(); }, []);
  useEffect(() => { fetchEvents(); }, [currentDate, habits.length]);

  const fetchHabits = async () => {
    try { const r = await api.get('/api/habits/'); setHabits(r.data); } catch {}
  };

  const fetchEvents = async () => {
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end   = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const r = await api.get(`/api/events/?start=${start}&end=${end}`);
      setRawEvents(r.data);

      const rbc = [];
      r.data.forEach(ev => {
        const s = ev.start_time ? new Date(ev.date + 'T' + ev.start_time) : new Date(ev.date + 'T00:00:00');
        const e = ev.end_time   ? new Date(ev.date + 'T' + ev.end_time)   : new Date(s.getTime() + 3600000);
        rbc.push({ id: 'ev-' + ev.id, title: ev.title, start: s, end: e,
          color: COLOR_MAP[ev.color] || '#0A84FF', rawType: 'event', rawId: ev.id, allDay: ev.is_all_day });
      });

      const today = new Date();
      habits.forEach(h => {
        rbc.push({ id: 'hab-' + h.id, title: h.name, start: today, end: today,
          color: COLOR_MAP[h.color] || C.accent, rawType: 'routine', rawId: h.id, allDay: true });
      });

      setCalendarEvents(rbc);
    } catch (e) { console.error(e); }
  };

  const navigate = useCallback((direction) => {
    const delta = direction === 'next' ? 1 : -1;
    setCurrentDate(d => {
      if (view === 'day')    return addDays(d, delta);
      if (view === 'week')   return addWeeks(d, delta);
      if (view === 'month')  return addMonths(d, delta);
      if (view === 'year')   return addYears(d, delta);
      return d;
    });
  }, [view]);

  const headerLabel = () => {
    if (view === 'day')   return format(currentDate, 'EEEE, MMMM d, yyyy');
    if (view === 'week')  return `Week of ${format(currentDate, 'MMM d, yyyy')}`;
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'year')  return format(currentDate, 'yyyy');
    return '';
  };

  const handleSelectSlot = useCallback(async ({ start }) => {
    const dateStr = format(start, 'yyyy-MM-dd');
    const timeStr = format(start, 'HH:mm');  // ← EXTRACT TIME (e.g., "14:30")
    if (panelDate !== dateStr) setPanelItems([]);
    setPanelDate(dateStr);
    setNewEventDate(dateStr);
    setNewEventTime(timeStr);
    setShowEventModal(true);
    try {
      const r = await api.get(`/api/calendar/day/?date=${dateStr}`);
      setDayData(r.data);
    } catch {}
  }, [panelDate]);

  const handleSelectEvent = useCallback((event) => {
    if (!panelOpen) { setPopup(event); return; }
    const key = event.id;
    if (panelItems.find(p => p.key === key)) return;
    if (event.rawType === 'routine') {
      const habit = habits.find(h => h.id === event.rawId);
      if (habit) setPanelItems(prev => [...prev, { key, type: 'routine', data: habit }]);
    } else {
      const ev = rawEvents.find(e => e.id === event.rawId);
      if (ev) setPanelItems(prev => [...prev, { key, type: 'event', data: ev }]);
    }
  }, [panelOpen, panelItems, habits, rawEvents]);

  const handleToggleHabit = async (id) => {
    try {
      const r = await api.post(`/api/habits/${id}/toggle/`);
      setHabits(prev => prev.map(h => h.id === id ? r.data : h));
      setPanelItems(prev => prev.map(p => p.type === 'routine' && p.data.id === id ? { ...p, data: r.data } : p));
    } catch {}
  };

  const handleToggleSubItem = async (subItemId) => {
    try {
      const r = await api.post(`/api/subitems/${subItemId}/toggle/`);
      setPanelItems(prev => prev.map(p => {
        if (p.type !== 'routine') return p;
        return { ...p, data: { ...p.data, sub_items: p.data.sub_items.map(si => si.id === subItemId ? r.data : si) } };
      }));
    } catch {}
  };

  const handleCreateEvent = async (data) => {
    try { 
      await api.post('/api/events/', data); 
      setShowEventModal(false); 
      setNewEventTime(null);  // ← clear stored time
      fetchEvents(); 
    }
    catch { alert('Could not create event.'); }
  };

  const eventStyleGetter = ev => {
    const isDone = ev.title.includes('[DONE]');
    return {
      style: { 
        background: ev.color + '22', 
        border: 'none', 
        borderLeft: `3px solid ${ev.color}`,
        color: isDone ? C.t3 : ev.color, 
        textDecoration: isDone ? 'line-through' : 'none',
        borderRadius: '0 6px 6px 0', 
        fontSize: 11, fontWeight: 600, padding: '2px 6px' 
      }
    };
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: C.bg, fontFamily: C.font, color: C.t1, overflow: 'hidden', flex: 1 }}>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.sep}`, flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: C.inputBg, borderRadius: 10, padding: 4, gap: 4 }}>
            {[['day','Day'],['week','Week'],['month','Month'],['year','Year']].map(([val, label]) => (
              <Button key={val} variant={view === val ? 'primary' : 'secondary'} size="sm" onClick={() => setView(val)} style={{ minWidth: 64, padding: '8px 12px' }}>
                {label}
              </Button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={() => navigate('prev')} style={{ width: 34, height: 34, padding: 0 }}>‹</Button>
          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 180, textAlign: 'center', color: C.t1 }}>{headerLabel()}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate('next')} style={{ width: 34, height: 34, padding: 0 }}>›</Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>

          <div style={{ flex: 1 }} />

          <Button variant={panelOpen ? 'primary' : 'secondary'} size="sm" onClick={() => { setPanelOpen(s => !s); if (panelOpen) setPanelItems([]); }} style={{ minWidth: 130 }}>
            {panelOpen ? '⊙ Panel ON' : '○ Detail Panel'}
          </Button>

          <Button onClick={() => setShowEventModal(true)} style={{ padding: '8px 18px' }}>+ New Event</Button>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {view === 'year' ? (
            <YearView date={currentDate} events={calendarEvents} onSelectDay={day => { setCurrentDate(day); setView('day'); }} />
          ) : (
            <>
              {/* THIN TRANSPARENT LINES APPLE STYLE FIX */}
              <style>{`
                .rbc-calendar { background: transparent; color: ${C.t1}; font-family: ${C.font}; height: 100%; }
                .rbc-header { background: transparent; border-color: rgba(255, 255, 255, 0.05); color: ${C.t3}; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .rbc-day-bg { background: transparent; border-color: rgba(255, 255, 255, 0.05) !important; }
                
                /* FIX: Applies our dark mode highlight to BOTH Month and Week/Day views */
                .rbc-day-bg.rbc-today, .rbc-day-slot.rbc-today { background-color: rgba(255,214,10,0.04) !important; }
                
                .rbc-off-range-bg { background: rgba(0,0,0,0.18); }
                .rbc-month-row, .rbc-month-view { border-color: rgba(255, 255, 255, 0.05) !important; }
                .rbc-date-cell { color: ${C.t2}; font-size: 13px; padding: 6px 8px; }
                .rbc-date-cell.rbc-now a { color: ${C.accent}; font-weight: 700; }
                .rbc-toolbar { display: none; }
                .rbc-event { border-radius: 4px !important; }
                .rbc-time-view, .rbc-time-header, .rbc-time-content, .rbc-timeslot-group, .rbc-time-slot { border-color: rgba(255, 255, 255, 0.05) !important; background: transparent; }
                .rbc-time-slot { color: ${C.t3}; font-size: 11px; }
                .rbc-current-time-indicator { background: ${C.accent}; }
                .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row, .rbc-header + .rbc-header { border-left: 1px solid rgba(255, 255, 255, 0.05); }
              `}</style>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                view={view}
                date={currentDate}
                onNavigate={setCurrentDate}
                onView={setView}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                style={{ height: '100%' }}
              />
            </>
          )}
        </div>
      </div>

      {panelOpen && (
        <div style={{ width: 280, background: C.panel, borderLeft: `1px solid ${C.sep}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <MiniCalendar currentDate={currentDate} onSelectDay={day => { setCurrentDate(day); setView('day'); }} />

          <div style={{ padding: '12px 12px 6px', borderBottom: `1px solid ${C.sep}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.t1 }}>{panelDate ? format(new Date(panelDate + 'T00:00:00'), 'EEE, MMM d') : 'Click a date'}</div>
            <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{panelItems.length === 0 ? 'Click events to pin them here' : `${panelItems.length} pinned`}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {panelItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px' }}><div style={{ fontSize: 32, opacity: 0.3, marginBottom: 10 }}>📌</div><p style={{ color: C.t3, fontSize: 12 }}>Click calendar events while panel is ON to pin their details here</p></div>
            ) : (
              panelItems.map(item => <PanelCard key={item.key} item={item.data} type={item.type} onToggleHabit={handleToggleHabit} onToggleSubItem={handleToggleSubItem} onRemove={() => setPanelItems(prev => prev.filter(p => p.key !== item.key))} />)
            )}
          </div>
        </div>
      )}

      {popup && !panelOpen && <EventPopup event={popup} habits={habits} rawEvents={rawEvents} onClose={() => setPopup(null)} />}
      {showEventModal && <EventModal defaultDate={newEventDate} defaultTime={newEventTime} onSave={handleCreateEvent} onClose={() => { setShowEventModal(false); setNewEventTime(null); }} />}
    </div>
  );
}