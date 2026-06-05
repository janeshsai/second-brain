import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  MarkerType, Position, Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api';
import { SkeletonRow } from '../components/Skeleton';

import C from '../theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const COLOR_MAP = { yellow: '#FFD60A', blue: '#0A84FF', green: '#32D74B', red: '#FF453A', purple: '#BF5AF2', orange: '#FF9F0A' };
const STATUS_COLOR = { todo: '#636366', in_progress: '#FF9F0A', done: '#32D74B' };
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', done: 'Done ✓' };



function StepNode({ data }) {
  const borderColor = STATUS_COLOR[data.status];
  const isDone = data.status === 'done';
  return (
    <div onClick={data.onClick}
      style={{
        background: C.card, border: `2px solid ${borderColor}`,
        borderRadius: 12, padding: '12px 16px', minWidth: 180, maxWidth: 220,
        cursor: 'pointer', fontFamily: C.font,
        boxShadow: isDone ? `0 0 0 3px ${borderColor}33` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.18s ease', position: 'relative',
      }}>
      
      {/* EXPLICIT ID ADDED TO FIX EDGE ERROR */}
      <Handle id="target" type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: borderColor }} />
        <span style={{ fontSize: 10, color: borderColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {STATUS_LABEL[data.status]}
        </span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 13.5, color: isDone ? C.t3 : C.t1,
        textDecoration: isDone ? 'line-through' : 'none', marginBottom: 4 }}>
        {data.title}
      </div>
      {data.description && <div style={{ fontSize: 11, color: C.t3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{data.description}</div>}
      {data.estimated_hours && <div style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>⏱ {data.estimated_hours}h</div>}
      {data.resource_url && <a href={data.resource_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 8, fontSize: 11, color: '#0A84FF', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>↗ Open Resource</a>}
      
      {/* EXPLICIT ID ADDED TO FIX EDGE ERROR */}
      <Handle id="source" type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

function buildFlow(steps, onNodeClick, storedPositions = {}) {
  const COLS = 4;
  const nodes = steps.map((step, i) => ({
    id: String(step.id),
    type: 'step',
    position: storedPositions[step.id] || { x: (i % COLS) * 260, y: Math.floor(i / COLS) * 200 },
    data: { ...step, onClick: () => onNodeClick(step) },
  }));

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const edges = sortedSteps.slice(0, -1).map((step, i) => {
    const next = sortedSteps[i + 1];
    return {
      id: `e${step.id}-${next.id}`,
      source: String(step.id),
      target: String(next.id),
      sourceHandle: 'source', // <-- EXPLICIT HANDLE ROUTING
      targetHandle: 'target', // <-- EXPLICIT HANDLE ROUTING
      type: 'smoothstep',
      animated: next.status === 'in_progress',
      style: { stroke: STATUS_COLOR[next.status] || '#636366', strokeWidth: 1.5, opacity: 0.7 },
      markerEnd: { type: MarkerType.ArrowClosed, color: STATUS_COLOR[next.status] || '#636366', width: 16, height: 16 },
    };
  });
  return { nodes, edges };
}

function autoArrange(steps) {
  const COLS = 4;
  const positions = {};
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  sorted.forEach((step, i) => { positions[step.id] = { x: (i % COLS) * 260, y: Math.floor(i / COLS) * 200 }; });
  return positions;
}

function NewPathModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none', fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: C.card, border: `1px solid ${C.sep}`, borderRadius: C.radius + 2, width: 420, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.t1 }}>New Learning Path</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={lbl}>Path Name</label><Input placeholder="e.g. GCP Cloud Engineer" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
          <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'none' }} rows={2} placeholder="What will you learn?" value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div><label style={lbl}>Color</label><div style={{ display: 'flex', gap: 10 }}>{Object.entries(COLOR_MAP).map(([n, hex]) => (<button key={n} onClick={() => setColor(n)} style={{ width: 26, height: 26, borderRadius: '50%', background: hex, cursor: 'pointer', border: color === n ? '3px solid white' : '3px solid transparent' }} />))}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.sep}` }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={() => name.trim() && onSave({ name, description, color })} style={{ flex: 1 }}>Create Path</Button>
        </div>
      </div>
    </div>
  );
}

// ── AI COURSE EXTRACTOR MODAL ────────────────────────────────────────────────
function AutoExtractModal({ onSave, onClose }) {
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [pastedText, setPastedText] = useState(''); // <-- NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!url.trim() && !pastedText.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await api.post('/api/ai/extract-course/', { url, topic, pasted_text: pastedText });
      
      if (!r.data.chapters || r.data.chapters.length === 0) {
        setError("Could not extract chapters. Try pasting the text directly.");
        setLoading(false);
        return;
      }
      
      // Pass topic down so the parent can name the course!
      onSave(r.data.chapters, url, topic); 
    } catch (err) {
      setError(err.response?.data?.error || "Failed to extract course.");
    }
    setLoading(false);
  };

  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none', fontFamily: C.font, boxSizing: 'border-box' };
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: C.card, border: `1px solid ${C.sep}`, borderRadius: C.radius + 2, width: 420, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.accent }}>✨ AI Course Extractor</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 700 }}>COURSE TITLE</label>
            <Input placeholder="e.g. Anthropic API Course" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ height: 1, flex: 1, background: C.sep }} />
            <span style={{ fontSize: 11, color: C.t3, fontWeight: 700 }}>OPTION 1: URL</span>
            <div style={{ height: 1, flex: 1, background: C.sep }} />
          </div>
          <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ height: 1, flex: 1, background: C.sep }} />
            <span style={{ fontSize: 11, color: C.t3, fontWeight: 700 }}>OPTION 2: PASTE TEXT</span>
            <div style={{ height: 1, flex: 1, background: C.sep }} />
          </div>
          <textarea style={{ ...inp, height: 100, resize: 'none' }}
            placeholder="Highlight the syllabus on the website, copy it, and paste it here..."
            value={pastedText} onChange={e => setPastedText(e.target.value)} />
          {error && <div style={{ color: C.danger, fontSize: 12 }}>{error}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.sep}` }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleExtract} disabled={loading || (!url && !pastedText)}
            style={{ flex: 1, opacity: loading ? 0.5 : 1, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Reading...' : 'Generate Path'}
          </Button>
        </div>
      </div>
    </div>
  );
}


function NewStepModal({ pathId, nextOrder, onSave, onBulkSave, onClose }) {
  const [mode, setMode] = useState('single');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [bulkText, setBulkText] = useState('');

  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none', fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  const bulkLines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const cleanLine = (l) => l.replace(/^[•\-\*\d]+[\.\)]\s*/, '').replace(/^[•\-\*]\s*/, '').trim();
  const previewLines = bulkLines.map(cleanLine).filter(l => l.length > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: C.card, border: `1px solid ${C.sep}`, borderRadius: C.radius + 2, width: 480, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.t1 }}>Add Steps</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.sep}`, display: 'flex', gap: 8 }}>
          {[['single', 'Single Step'], ['bulk', 'Paste List']].map(([val, label]) => (
            <button key={val} onClick={() => setMode(val)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: 'none', fontFamily: C.font, background: mode === val ? C.accent : C.inputBg, color: mode === val ? '#000' : C.t2, fontWeight: mode === val ? 700 : 400 }}>{label}</button>
          ))}
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto' }}>
          {mode === 'single' ? (
            <>
              <div><label style={lbl}>Step Title</label><Input value={title} onChange={e => setTitle(e.target.value)} autoFocus /></div>
              <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'none' }} rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div><label style={lbl}>Resource URL <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label><Input value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} /></div>
              <div><label style={lbl}>Estimated Hours <span style={{ color: C.t3, textTransform: 'none' }}>(optional)</span></label><Input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} /></div>
            </>
          ) : (
            <>
              <div><label style={lbl}>Paste your chapter list</label><textarea style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} rows={8} value={bulkText} onChange={e => setBulkText(e.target.value)} autoFocus /></div>
              {previewLines.length > 0 && (
                <div>
                  <label style={lbl}>Preview — {previewLines.length} steps will be created</label>
                  <div style={{ background: C.bg, borderRadius: 8, padding: 10, maxHeight: 160, overflowY: 'auto' }}>
                    {previewLines.map((line, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i < previewLines.length - 1 ? `1px solid ${C.sep}` : 'none' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#636366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 12, color: C.t1 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.sep}` }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button style={{ flex: 1 }} onClick={() => { if (mode === 'single') { title.trim() && onSave({ path: pathId, title, description, resource_url: resourceUrl, order: nextOrder, status: 'todo', estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null }); } else { previewLines.length > 0 && onBulkSave(previewLines); } }}>{mode === 'single' ? 'Add Step' : `Add ${previewLines.length} Steps`}</Button>
        </div>
      </div>
    </div>
  );
}

function AddToCalendarModal({ step, pathName, onSave, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const inp = { width: '100%', background: C.inputBg, border: `1px solid ${C.sep}`, borderRadius: 8, padding: '9px 12px', color: C.t1, fontSize: 13, outline: 'none', fontFamily: C.font, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: C.card, border: `1px solid ${C.sep}`, borderRadius: C.radius + 2, width: 380, fontFamily: C.font, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.t1 }}>Add to Calendar</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.inputBg, borderRadius: C.radius, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 4 }}>COURSE</div>
            <div style={{ fontSize: 12, color: C.t2 }}>{pathName}</div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 4, marginTop: 8 }}>CHAPTER</div>
            <div style={{ fontSize: 13, color: C.t1, fontWeight: 600 }}>📚 {step.title}</div>
          </div>
          <div><label style={lbl}>Date</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><label style={lbl}>Start</label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={lbl}>End</label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.sep}` }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={() => onSave({ date, startTime, endTime })} style={{ flex: 1 }}>Add to Calendar</Button>
        </div>
      </div>
    </div>
  );
}

function StepPanel({ step, pathName, onUpdateStatus, onAddToCalendar, onDelete, onClose }) {
  const [showCalModal, setShowCalModal] = useState(false);
  return (
    <>
      <div style={{ width: 280, background: C.panel, borderLeft: `1px solid ${C.sep}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: `1px solid ${C.sep}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.t1 }}>Step Detail</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 2 }}>{pathName}</div>
            <h3 style={{ margin: 0, fontSize: 16, color: C.t1 }}>{step.title}</h3>
          </div>
          {step.description && <p style={{ margin: 0, fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{step.description}</p>}
          {step.resource_url && <a href={step.resource_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#0A84FF', wordBreak: 'break-all' }}>↗ {step.resource_url}</a>}
          {step.estimated_hours && <div style={{ fontSize: 12, color: C.t3 }}>⏱ {step.estimated_hours}h estimated</div>}
          <div>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['todo','To Do','#636366'],['in_progress','In Progress','#FF9F0A'],['done','Done ✓','#32D74B']].map(([val, label, color]) => (
                <button key={val} onClick={() => onUpdateStatus(step.id, val)} style={{ padding: '9px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: C.font, border: `1px solid ${step.status === val ? color : C.sep}`, background: step.status === val ? color + '22' : C.inputBg, color: step.status === val ? color : C.t2, fontWeight: step.status === val ? 700 : 400, textAlign: 'left' }}>{label}</button>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={() => setShowCalModal(true)} style={{ border: `1px solid ${C.accent}`, background: C.accent + '15', color: C.accent }}>📅 Add to Calendar</Button>
          <Button variant="ghost" onClick={() => onDelete(step.id)} style={{ border: `1px solid ${C.danger}`, color: C.danger }}>Delete Step</Button>
        </div>
      </div>
      {showCalModal && <AddToCalendarModal step={step} pathName={pathName} onSave={async (data) => { await onAddToCalendar(step, data.date, data.startTime, data.endTime); setShowCalModal(false); }} onClose={() => setShowCalModal(false)} />}
    </>
  );
}

// ── AI Coach Sidebar ─────────────────────────────────────────────────────────
function LearningCoach({ isOpen, onClose, paths }) {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const askCoach = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setAdvice(''); // Clear old advice
    try {
      // Calls the new Django endpoint we built in Step 4
      const r = await api.post('/api/ai/coach/', { query });
      setAdvice(r.data.advice);
    } catch (err) { 
      setAdvice("Sorry, the coach is taking a break. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, width: 380, height: '100%',
      background: 'rgba(44,44,46,0.95)', backdropFilter: 'blur(10px)',
      borderLeft: `1px solid ${C.sep}`, zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
      transform: 'translateX(0)', transition: 'transform 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.sep}` }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: C.accent }}>✨ Learning Coach</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t2, fontSize: 22, cursor: 'pointer' }}>×</button>
      </div>
      
      <div style={{ padding: '20px 24px', flexShrink: 0, borderBottom: `1px solid ${C.sep}` }}>
        <p style={{ fontSize: 13, color: C.t2, marginBottom: 12, lineHeight: 1.5 }}>
          Ask the coach for a study strategy. It reads your current paths and skills to guide you.
        </p>
        <textarea 
          placeholder="e.g. 'I want to be a Full Stack dev. Should I finish JS before starting GCP?'"
          style={{ 
            width: '100%', height: 100, background: C.inputBg, border: `1px solid ${C.sep}`, 
            borderRadius: 12, color: C.t1, padding: 12, outline: 'none', fontSize: 13, 
            fontFamily: C.font, resize: 'none', boxSizing: 'border-box'
          }}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button
          onClick={askCoach}
          disabled={loading || !query.trim()}
          style={{ marginTop: 12, width: '100%', opacity: (loading || !query.trim()) ? 0.5 : 1 }}
        >
          {loading ? 'Thinking... 🧠' : 'Ask Coach'}
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', color: C.t1, fontSize: 14, lineHeight: 1.6 }}>
        
        <div style={{ whiteSpace: 'pre-wrap', color: C.t2 }}>
          {advice || (
            <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              Waiting for your question...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function Learning() {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNewPath, setShowNewPath] = useState(false);
  const [showNewStep, setShowNewStep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const positionsRef = useRef({});

  // FIX: MEMOIZE NODETYPES SO REACT FLOW STOPS YELLING
  const nodeTypes = useMemo(() => ({ step: StepNode }), []);
  const [showCoach, setShowCoach] = useState(false);
  const [showAutoExtract, setShowAutoExtract] = useState(false);
  const [stuckSteps, setStuckSteps] = useState([]);

  useEffect(() => { fetchPaths();fetchStuckSteps();}, []);

  useEffect(() => {
    if (selectedPath) {
      const stored = positionsRef.current[selectedPath.id] || {};
      const { nodes: n, edges: e } = buildFlow(selectedPath.steps, setSelectedStep, stored);
      setNodes(n);
      setEdges(e);
    }
  }, [selectedPath]);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/paths/');
      setPaths(r.data);
      if (r.data.length > 0 && !selectedPath) setSelectedPath(r.data[0]);
    } catch {}
    setLoading(false);
  };

  const reloadSelectedPath = async () => {
    if (!selectedPath) return;
    try {
      const r = await api.get(`/api/paths/${selectedPath.id}/`);
      setSelectedPath(r.data);
      setPaths(prev => prev.map(p => p.id === r.data.id ? r.data : p));
    } catch {}
  };

  const handleCreatePath = async (data) => {
    try { const r = await api.post('/api/paths/', data); setPaths(prev => [r.data, ...prev]); setSelectedPath(r.data); setShowNewPath(false); }
    catch { alert('Could not create path.'); }
  };


  const handleCreateStep = async (data) => {
    try { await api.post('/api/steps/', data); await reloadSelectedPath(); setShowNewStep(false); }
    catch { alert('Could not add step.'); }
  };

  const handleBulkCreate = async (lines) => {
    setBulkLoading(true);
    try { await api.post(`/api/paths/${selectedPath.id}/bulk-steps/`, { steps: lines }); await reloadSelectedPath(); setShowNewStep(false); }
    catch { alert('Could not bulk create steps.'); }
    setBulkLoading(false);
  };

  const handleUpdateStatus = async (stepId, status) => {
    try { await api.patch(`/api/steps/${stepId}/`, { status }); await reloadSelectedPath(); setSelectedStep(prev => prev?.id === stepId ? { ...prev, status } : prev); }
    catch {}
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Delete this step?')) return;
    try { await api.delete(`/api/steps/${stepId}/`); await reloadSelectedPath(); setSelectedStep(null); }
    catch {}
  };

  const handleAddToCalendar = async (step, date, startTime, endTime) => {
    try {
      await api.post('/api/events/', {
        title: `📚 ${selectedPath.name} — ${step.title}`, event_type: 'learning_session',
        date, start_time: startTime, end_time: endTime,
        notes: `Course: ${selectedPath.name}\nChapter: ${step.title}${step.description ? '\n\n' + step.description : ''}`,
        color: selectedPath?.color || 'purple', recurrence: 'none',
      });
    } catch { alert('Could not add to calendar.'); }
  };

  const handleDeletePath = async (id) => {
    if (!window.confirm('Delete this entire learning path?')) return;
    try { await api.delete(`/api/paths/${id}/`); const remaining = paths.filter(p => p.id !== id); setPaths(remaining); setSelectedPath(remaining[0] || null); }
    catch {}
  };
  const fetchStuckSteps = async () => {
    try {
        const r = await api.get('/api/steps/stuck/');
        setStuckSteps(r.data);
    } catch {}
  };

  // ── NEW HANDLER: AI Extract Save ─────────────────────────
  const handleAutoExtractSave = async (chapters, originalUrl,topicHint) => {
    try {
      // Smart fallback: topic → URL domain → first chapter title → generic
      let pathTitle = topicHint?.trim();
      if (!pathTitle && originalUrl) {
        try {
          pathTitle = new URL(originalUrl).hostname.replace('www.', '').split('.')[0];
          pathTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);  // Capitalize
        } catch {}
      }
      if (!pathTitle && chapters?.length > 0) {
        pathTitle = chapters[0].title?.slice(0, 50) || "Extracted Course";
      }
      pathTitle = pathTitle || "AI Generated Course";
      
      const pathRes = await api.post('/api/paths/', { 
        name: pathTitle, 
        description: `Source: ${originalUrl || 'Pasted text'}`, 
        color: 'purple' 
      });
      
      const newPath = pathRes.data;
      
      // 2. Format the chapters for bulk import
      // We only extract the titles for now to match our bulk API
      const chapterTitles = chapters.map(c => c.title);
      
      // 3. Bulk create the steps
      await api.post(`/api/paths/${newPath.id}/bulk-steps/`, { steps: chapterTitles });
      
      // 4. Reload
      await fetchPaths();
      setShowAutoExtract(false);
    } catch {
      alert("Failed to save the generated path.");
    }
  };  

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    changes.forEach(change => {
      if (change.type === 'position' && change.position && selectedPath) {
        if (!positionsRef.current[selectedPath.id]) positionsRef.current[selectedPath.id] = {};
        positionsRef.current[selectedPath.id][change.id] = change.position;
      }
    });
  }, [onNodesChange, selectedPath]);

  const handleAutoArrange = () => {
    if (!selectedPath) return;
    const positions = autoArrange(selectedPath.steps);
    positionsRef.current[selectedPath.id] = positions;
    const { nodes: n, edges: e } = buildFlow(selectedPath.steps, setSelectedStep, positions);
    setNodes(n); setEdges(e);
  };

  const progress = (path) => path.total_steps > 0 ? Math.round((path.done_steps / path.total_steps) * 100) : 0;

  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, background: C.bg, fontFamily: C.font, color: C.t1, overflow: 'hidden' }}>
      {/* ── Path sidebar ── */}
      <div style={{ width: 220, background: C.sidebar, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.sep}`, flexShrink: 0 }}>
        <div style={{ padding: '18px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Learning Paths</span>
          <div style={{ display: 'flex', gap: 6 }}>
            
            <button onClick={() => setShowAutoExtract(true)} title="Auto-Generate Path from URL" style={{ background: 'transparent', border: `1px solid ${C.sep}`, color: C.t1, borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</button>
            <button onClick={() => setShowNewPath(true)} style={{ background: C.accent, color: '#000', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {loading ? Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />) : paths.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 12px' }}>
              <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 10 }}>🗺️</div>
              <p style={{ color: C.t3, fontSize: 12 }}>No paths yet</p>
            </div>
          ) : paths.map(path => {
            const isActive = selectedPath?.id === path.id;
            const pct = progress(path);
            const pathColor = COLOR_MAP[path.color] || C.accent;
            return (
              <div key={path.id} onClick={() => setSelectedPath(path)} style={{ padding: '10px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: isActive ? pathColor + '20' : 'transparent', border: `1px solid ${isActive ? pathColor + '50' : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: pathColor }} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{path.name}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: pathColor, width: `${pct}%`, borderRadius: 100, transition: 'width 0.4s' }} />
                </div>
                <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{path.done_steps}/{path.total_steps} • {pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Flow canvas ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {selectedPath ? (
          <>
            {stuckSteps.length > 0 && (
              <div style={{
                  background: 'rgba(255,214,10,0.12)',
                  border: '1px solid rgba(255,214,10,0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  margin: '12px 16px 0',
                  flexShrink: 0,
                  maxHeight: 140,
                  overflowY: 'auto',
              }}>
                  <div style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: C.accent, 
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                  }}>
                      ⚠️ {stuckSteps.length} step{stuckSteps.length > 1 ? 's' : ''} stuck for 7+ days
                  </div>
                  
                  {stuckSteps.map(step => (
                      <div key={step.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          marginBottom: 6,
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 8,
                      }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                  fontSize: 13, 
                                  fontWeight: 600, 
                                  color: C.t1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                              }}>
                                  {step.path_name}
                              </div>
                              <div style={{ 
                                  fontSize: 12, 
                                  color: C.t2, 
                                  marginTop: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                              }}>
                                  {step.title} · <span style={{ color: C.accent }}>{step.days_stuck} days</span>
                              </div>
                          </div>
                          <button 
                              onClick={() => {
                                  const path = paths.find(p => p.id === step.path_id);
                                  if (path) {
                                      setSelectedPath(path);
                                      setTimeout(() => {
                                          const stepNode = path.steps?.find(s => s.id === step.id);
                                          if (stepNode) setSelectedStep(stepNode);
                                      }, 100);
                                  }
                              }}
                              style={{
                                  background: C.accent,
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '5px 12px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: C.font,
                                  flexShrink: 0,
                              }}
                          >
                              View
                          </button>
                      </div>
                  ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${C.sep}`, flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: C.t1 }}>{selectedPath.name}</div>
                {selectedPath.description && <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>{selectedPath.description}</div>}
              </div>
              {/* <-- AI COACH BUTTON ADDED HERE --> */}
              <Button variant="ghost" onClick={() => setShowCoach(true)} style={{ border: `1px solid ${C.accent}`, color: C.accent }}>
                ✨ Ask Coach
              </Button>

              {selectedPath.steps.length > 1 && (
                <Button variant="secondary" size="sm" onClick={handleAutoArrange} title="Sort all chapters into a clean grid">⊞ Auto-arrange</Button>
              )}
              <Button onClick={() => setShowNewStep(true)}>+ Add Steps</Button>
              <Button variant="ghost" onClick={() => handleDeletePath(selectedPath.id)} style={{ border: `1px solid ${C.danger}`, color: C.danger }}>Delete</Button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {selectedPath.steps.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: 52, opacity: 0.3, marginBottom: 16 }}>🗺️</div>
                  <p style={{ color: C.t2, fontSize: 15, marginBottom: 8 }}>No steps yet</p>
                  <p style={{ color: C.t3, fontSize: 13, marginBottom: 24 }}>Paste a list of chapters or add them one by one</p>
                  <Button onClick={() => setShowNewStep(true)}>+ Add First Step</Button>
                </div>
              ) : (
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView style={{ background: C.bg }} defaultEdgeOptions={{ type: 'smoothstep' }}>
                  <Background color="rgba(255,255,255,0.05)" gap={24} />
                  <Controls style={{ background: C.sidebar, border: `1px solid ${C.sep}` }} />
                  <MiniMap style={{ background: C.sidebar }} nodeColor={n => STATUS_COLOR[n.data?.status] || '#636366'} />
                </ReactFlow>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 56, opacity: 0.3, marginBottom: 16 }}>🗺️</div>
            <p style={{ color: C.t2, fontSize: 15, marginBottom: 8 }}>No learning path selected</p>
            <Button onClick={() => setShowNewPath(true)}>+ Create First Path</Button>
          </div>
        )}
      </div>

      {selectedStep && <StepPanel step={selectedStep} pathName={selectedPath?.name || ''} onUpdateStatus={handleUpdateStatus} onAddToCalendar={handleAddToCalendar} onDelete={handleDeleteStep} onClose={() => setSelectedStep(null)} />}
      {bulkLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: C.card, borderRadius: C.radius + 2, padding: '24px 32px', color: C.t1, fontFamily: C.font, textAlign: 'center', border: `1px solid ${C.sep}` }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <p style={{ margin: 0, fontWeight: 600 }}>Creating steps…</p>
          </div>
        </div>
      )}
      {showNewPath && <NewPathModal onSave={handleCreatePath} onClose={() => setShowNewPath(false)} />}
      {showNewStep && selectedPath && <NewStepModal pathId={selectedPath.id} nextOrder={selectedPath.steps.length} onSave={handleCreateStep} onBulkSave={handleBulkCreate} onClose={() => setShowNewStep(false)} />}
      
      {/* ── AI COMPONENTS MOUNTED HERE ── */}
      <LearningCoach isOpen={showCoach} onClose={() => setShowCoach(false)} paths={paths} />
      {showAutoExtract && <AutoExtractModal onSave={handleAutoExtractSave} onClose={() => setShowAutoExtract(false)} />}
    </div>
  );
}