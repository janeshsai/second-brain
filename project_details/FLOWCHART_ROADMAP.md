# 🧠 SECOND BRAIN — COMPLETE PROJECT FLOWCHART & ROADMAP

---

## 1. PROJECT OVERVIEW

**One-line summary:** A personal full-stack AI-powered knowledge management app (Notes + Bookmarks + Habits + Calendar + Learning Paths + Agent Hub Dashboard) with semantic search and autonomous agents.

**Main goal:** Never lose a resource, never miss a habit, never forget what you learned — all connected through AI agents you can talk to.

---

## 2. CURRENT PROJECT STATUS

| Field | Value |
|---|---|
| **Current Phase** | Phase E — Agent Hub Dashboard (in progress) |
| **Current Active Task** | Build Dashboard.jsx — home page with habits, stats, stuck nudge, agent cards, quick-jump |
| **Immediate Next Task** | Phase F — New agents (Daily Brief, Note Connection, Bookmark Watcher, Resume Coach) |
| **Active Bug** | None |
| **Current Working Files** | `frontend/src/pages/Dashboard.jsx` (being created) |
| **Blocker** | None |

---

## 3. COMPLETED STEPS

### Phases 1–9 (Original Build)
- Django 6 + DRF backend, React 18 + Vite frontend
- PostgreSQL + pgvector on Neon.tech, JWT auth
- Notes (3-panel, Apple/Google Keep import, AI summarize)
- Bookmarks (categories, progress, auto-tag by URL)
- Habits (time sections, sub-items, numeric, DnD reorder, heatmap)
- Calendar (Month/Week/Day/Year views, recurring events)
- Learning (React Flow, AI course extractor, AI schedule generator)
- AppLayout shared sidebar with lucide icons
- Full AI integration (Gemini embedding, RAG chat, learning coach, bookmark agent)

### Code Quality & Architecture Refactor (Sessions 2026-06)

```
BACKEND REFACTOR ✅
✅ A1 — Deleted broken generate_schedule_plan duplicate from ai_agent.py
✅ A2 — Deleted dead ai_service.py
✅ A3 — Fixed N+1 streak query (single DB query using completed_dates set)
✅ A4 — Centralized Gemini model names (CHAT_MODEL, EMBED_MODEL in ai/config.py)
✅ A5 — Proper HTTP 503 status on AI failures (summarize, chat, coach)
✅ B1 — Split views.py (1100+ lines) → api/views/ package (8 domain files)
✅ B2 — Split ai_utils.py + ai_agent.py → api/ai/ package (config, embeddings, chat, agents, scheduler)
✅ B3 — Smoke tested: Django starts clean, all 51 URL routes load

FRONTEND REFACTOR ✅
✅ C  — Phase 10C stuck nudge confirmed working on Learning page
✅ D  — Extracted const C into shared theme.js (all 8 files updated)
✅     — Created ui/ component library: Button, Card, Input, Modal, Badge
✅ UI — Login/Register rewritten with design system (no alert(), real validation, glass card)
✅ UI — Habits: card hover lift, all modals use Button/Input/C.card
✅ UI — Notes: left accent border on selected note, Button/Input throughout
✅ UI — Learning: StepNode uses C.card, all modals + toolbar use Button/Input
✅ UI — Bookmarks + Calendar: refactored to use ui/ primitives

PHASE E — Agent Hub (in progress)
✅ E1 — AppLayout: 🧠 brain logo now navigates to '/' (home dashboard)
✅ E2 — App.jsx: '/' route now loads Dashboard instead of redirecting to /notes
⬜ E3 — Dashboard.jsx: home page (building now)
```

---

## 4. CURRENT BACKEND FILE STRUCTURE

```
backend/api/
  views/
    __init__.py       ← re-exports all (urls.py unchanged)
    base.py           ← health_check, RegisterView
    notes.py          ← NoteListCreate, NoteDetail, ai_search, summarize_note
    bookmarks.py      ← Bookmark*, Category*, bookmark_mark_opened, agent_command
    habits.py         ← Habit*, toggle, cascade, numeric, reorder, subitem*
    calendar.py       ← CalendarEvent*, calendar_day_view
    learning.py       ← LearningPath*, PathStep*, schedule, coach, extract, stuck_steps
    imports.py        ← import_apple_notes, import_google_keep
    ai_views.py       ← semantic_search, ai_chat
  ai/
    __init__.py       ← exports all public functions
    config.py         ← CHAT_MODEL, EMBED_MODEL, client (single source of truth)
    embeddings.py     ← get_embedding, get_query_embedding
    chat.py           ← generate_summary, rag_chat
    agents.py         ← agent_parse_command, generate_learning_strategy, extract_course_syllabus
    scheduler.py      ← generate_schedule_plan
```

---

## 5. AGENT ROADMAP

### Agents Already Working
| Agent | Endpoint | What it does |
|---|---|---|
| RAG Chat | POST /api/ai/chat/ | Answers questions from your notes + bookmarks |
| Learning Coach | POST /api/ai/coach/ | Study strategy based on paths + skills |
| Bookmark Agent | POST /api/ai/agent/ | Natural language bookmark updates |
| Note Summarizer | POST /api/notes/{id}/summarize/ | 3-5 bullet AI summary |
| Course Extractor | POST /api/ai/extract-course/ | URL or paste → learning path chapters |
| Schedule Generator | POST /api/ai/schedule/ | Generates study calendar from paths |

### Agents to Build (Phase F)
| Agent | What it does | How it works |
|---|---|---|
| **Daily Briefing Agent** | On-demand: habits due, next learning step, stuck items, stale bookmarks | New endpoint aggregates existing data + Gemini writes the brief |
| **Note Connection Agent** | On save, surfaces 3 most similar notes already in your brain | pgvector cosine search already exists — just needs a response trigger |
| **Bookmark Watcher** | Alerts for bookmarks not opened in N days | Query Bookmark.last_opened, surface on dashboard |
| **Resume Coach** | PDF upload → skill gap → auto-create learning path | pdfplumber parse + Gemini analysis + existing path create endpoint |

### Agents to Build (Phase G — Interactive Hub)
| Agent | What it does |
|---|---|
| **Habit Agent** | "Mark my morning tasks done" → calls toggle endpoints |
| **Agent Router** | Gemini classifies intent → picks the right agent |
| **Unified Hub Chat** | Floating chat on every page, routes to all agents |

---

## 6. NEXT STEPS (IN ORDER)

```
CURRENT
  ⬜ E3  — Build Dashboard.jsx (home page)

NEXT
  ⬜ F1  — Daily Briefing Agent (backend + dashboard card)
  ⬜ F2  — Note Connection Agent (surfaces related notes on save)
  ⬜ F3  — Bookmark Watcher (not opened in N days alert)
  ⬜ F4  — Resume Coach Agent (PDF → skill gap → learning path)

THEN
  ⬜ G1  — Habit Agent (natural language → toggle habits)
  ⬜ G2  — Agent Router (Gemini intent classifier)
  ⬜ G3  — Floating hub chat (on all pages)

LATER
  ⬜ Deploy — Vercel (frontend) + Render (backend) + CI/CD
  ⬜ Bookmark embeddings (VectorField on Bookmark model)
  ⬜ Mobile responsive layout (Tailwind migration)
  ⬜ TipTap rich text editor in Notes
```

---

## 7. TECH STACK (CURRENT)

| Layer | Tech |
|---|---|
| Backend | Django 6 + DRF, PostgreSQL + pgvector (Neon.tech), JWT auth |
| AI | Google Gemini — gemini-embedding-001 (768d vectors), gemini-2.5-flash (generation) |
| Frontend | React 18 + Vite, React Router v6, Axios + JWT interceptors |
| UI | Inline styles + shared theme.js + ui/ component library (Button, Card, Input, Modal, Badge) |
| Libraries | React Flow (learning canvas), react-big-calendar, @dnd-kit (habits DnD), lucide-react |
| Package mgr | uv (backend), npm (frontend) |

---

## 8. CRITICAL WARNINGS (don't break these)

```
⚠️ VectorField(dimensions=768) — NEVER change without re-embedding all notes
⚠️ weekdays field: 0=Monday (Python) NOT 0=Sunday (JS). Frontend converts.
⚠️ Soft delete habits (is_active=False) — never hard delete, preserves logs
⚠️ CHAT_MODEL and EMBED_MODEL defined only in api/ai/config.py — import from there
⚠️ ai_utils.py and ai_agent.py are DELETED — use api/ai/ package
⚠️ urls.py imports from api.views — the views/__init__.py re-exports everything
⚠️ embed_notes command imports from api.ai (not api.ai_utils)
```

---

## 9. DESIGN SYSTEM

```js
// frontend/src/theme.js — single source of truth for all colors
C.bg       = '#1C1C1E'     // page background
C.card     = 'rgba(255,255,255,0.04)'  // glass card surface
C.sidebar  = '#212124'     // sidebar bg
C.sep      = 'rgba(255,255,255,0.08)'  // borders
C.accent   = '#FFD60A'     // yellow — use sparingly, only on primary actions
C.t1/t2/t3 = white at 100/72/42% opacity  // text hierarchy
C.radius   = 14            // border radius
C.space    = { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }

// ui/ components: Button (primary/secondary/ghost/danger), Card, Input, Modal, Badge
// Rule: one page = one .jsx file. No splitting pages into sub-component files.
```
