# 🧠 SECOND BRAIN — COMPLETE PROJECT FLOWCHART & ROADMAP

---

## 1. PROJECT OVERVIEW

**One-line summary:** A personal full-stack AI-powered knowledge management app (Notes + Bookmarks + Habits + Calendar + Learning Paths) with semantic search and autonomous agents.

**Main goal:** Never lose a resource, never miss a habit, never forget what you learned — all connected through AI.

---

## 2. CURRENT PROJECT STATUS

| Field | Value |
|---|---|
| **Current Phase** | Phase 8 complete, BUG-005 active, pre-deployment |
| **Current Active Task** | Fix BUG-005 — orphaned emoji span in AppLayout.jsx search button |
| **Immediate Next Task** | Run `embed_notes` → test AI Search → Phase 10C stuck nudge |
| **Active Bug** | BUG-005: Lines 100-103 in AppLayout.jsx have `🔎` emoji span alongside lucide `<Search>` SVG — delete lines 100-103 |
| **Current Working Files** | `frontend/src/components/AppLayout.jsx` |
| **Blocker** | BUG-005 must be fixed before clean deployment |

---

## 3. COMPLETED STEPS (CHRONOLOGICAL)

```mermaid
timeline
    title Second Brain — Completed Development Timeline
    
    section Foundation
        Phase 1 : Django + React + Neon.tech connected
                : Health check endpoint working
                : JWT auth (Register + Login + auto-refresh)
                : ProtectedRoute + Axios interceptors
    
    section Core Pages
        Phase 2 : Notes page v1 (basic CRUD)
                : Notes page v2 (Apple Notes 3-panel, auto-save, folders, tags)
        Phase 3 : Bookmarks page (categories, progress, grid/list, quick-add)
        Phase 4 : Habits page v1 (checklist, streaks, 90-day heatmap)
        Phase 5 : Calendar page (Month/Week/Day + custom Year view, events CRUD, panel)
        Phase 6 : Learning page (React Flow, paths/steps CRUD, bulk paste)
    
    section Infrastructure
        Phase 7 : AppLayout shared sidebar (replaces per-page nav)
                : Apple Notes HTML zip import
                : Google Keep Takeout JSON import
                : MD5 deduplication on import
    
    section AI Integration
        Phase 8 : ai_utils.py (Gemini embedding + RAG + agent)
                : Semantic search via pgvector cosine distance
                : RAG chat (answers from your notes)
                : Bookmark agent commands
                : Note summarizer
                : Learning coach (Gemini strategy)
                : Course extractor (URL or paste)
                : embed_notes management command
    
    section Feature Upgrades
        Phase 9 : Habits full overhaul (time sections, sub-items, numeric, weekly days, heatmap all-time)
                : Bookmark URL auto-tagging by domain
                : AppLayout hover-expand sidebar + lucide SVG icons
                : AI Schedule Generator (4-step modal in Learning)
```

---

### Completed Features Checklist

```
INFRASTRUCTURE
✅ Django 6.0.4 + DRF backend
✅ React 18 + Vite frontend
✅ PostgreSQL + pgvector on Neon.tech
✅ JWT auth with auto-refresh (no silent logouts)
✅ CORS configured
✅ Axios interceptors (attach token + refresh on 401)
✅ ProtectedRoute auth guard
✅ AppLayout hover-expand sidebar (64px → 160px)
✅ lucide-react SVG icons in sidebar (replacing macOS-hijacked emoji)
✅ ⌘K global search shortcut

NOTES PAGE ✅
✅ Apple Notes 3-panel layout (folders | list | editor)
✅ Auto-save with 800ms debounce
✅ Folder organization
✅ #hashtag auto-detection
✅ Apple Notes HTML zip import
✅ Google Keep JSON zip import
✅ MD5 deduplication on re-import
✅ AI summarize button (Gemini)
✅ Skeleton loaders

BOOKMARKS PAGE ✅
✅ Grid + list view toggle
✅ Category system (auto-seeded: Article, Course, Manga, Research, Tool, Video)
✅ URL domain auto-tagging (youtube→Video, mangadex→Manga, etc.)
✅ Progress tracking ("Chapter 42", "45%", "Episode 5 of 12")
✅ Favorites system
✅ Folder organization
✅ Quick-add (paste URL → Enter)
✅ Last-opened tracking
✅ Optimistic updates on edit/create

HABITS PAGE ✅
✅ Daily + weekly habit types
✅ Weekly day picker (Mon/Tue/Wed/Thu/Fri/Sat/Sun)
✅ Weekly habits gray/locked on non-selected days
✅ Numeric habits (target + actual, partial circle fill)
✅ Sub-items (expand/collapse accordion, cascade toggle marks all children)
✅ Time-of-day sections (Anytime → Morning → Afternoon → Evening → Night)
✅ Each section collapsible with arrow
✅ Optimistic toggle (0ms perceived lag)
✅ pendingRef double-click guard
✅ Streak tracking with 🔥 counter
✅ Past Track heatmap (horizontal, all habits vertical, 1W/1M/3M/All)
✅ Inactivity collapsing in heatmap (>2 consecutive inactive days = collapsed)
✅ Start from first-ever log date (not arbitrary 90 days)
✅ Add-to-calendar per habit
✅ 3-dots menu per habit (Edit / Log Number / Add to Calendar / Delete)
✅ Global ⋮ options menu (view toggle + past track toggle)
✅ Table view (circles on RIGHT side)
✅ Card view (circles on LEFT side)
✅ Numeric modal via 3-dots (only shows when habit has target_value)
✅ Skeleton loaders

CALENDAR PAGE ✅
✅ Month / Week / Day views (react-big-calendar)
✅ Custom Year view (4×3 mini-month grid, own implementation)
✅ View-aware navigation (arrows respect current view)
✅ Event CRUD with modal (type, color, date, time, recurrence, notes)
✅ Recurring events (daily, weekly, monthly)
✅ Habits appear as all-day items on calendar
✅ Right detail panel (accumulates clicked events, doesn't replace)
✅ Mini-calendar in panel for quick navigation
✅ Event popup (when panel is off, click shows overlay)
✅ Apple dark mode CSS overrides for react-big-calendar

LEARNING PAGE ✅
✅ Learning paths CRUD
✅ Path steps CRUD
✅ React Flow canvas (draggable nodes, smoothstep edges, arrows)
✅ Status color coding (todo=grey, in_progress=orange, done=green)
✅ Step status update from detail panel
✅ Bulk paste steps (strips bullets/numbers automatically)
✅ Auto-arrange button (4-column grid reset)
✅ Node position persistence via useRef (no re-render lag during drag)
✅ Add step to Calendar (creates learning_session event)
✅ AI Course Extractor (URL or paste text → Gemini → chapters)
✅ AI Learning Coach (Gemini strategy advice)
✅ AI Schedule Generator (4-step modal: select → preferences → review → confirm)
✅ MiniMap + Controls

AI FEATURES ✅
✅ gemini-embedding-001 (768 dims, confirmed working on user's key)
✅ gemini-2.5-flash for generation
✅ pgvector cosine distance search
✅ Semantic search endpoint
✅ RAG chat (context from top-5 most similar notes)
✅ Bookmark agent command (natural language → update progress/favorite)
✅ Note summarizer (3-5 bullets)
✅ Learning coach (Gemini + path data)
✅ Schedule generator (Gemini → JSON sessions array)
✅ embed_notes management command (backfill existing notes)

BUGS FIXED
✅ BUG-002: text-embedding-004 not found → gemini-embedding-001
✅ BUG-003: gemini-2.0-flash quota=0 → gemini-2.5-flash
✅ BUG-004: Duplicate get_embedding import in views.py line 22
✅ Habit toggle 2-3s lag → optimistic update + pendingRef
✅ JWT silent logout → Axios response interceptor auto-refresh
✅ React Flow edge errors → explicit handle IDs on StepNode
✅ 🗺️ emoji rendering as macOS Maps icon → replaced with 📚 → replaced with lucide GraduationCap
✅ Pages clipped at half screen → root divs changed to height:100%, flex:1
✅ react-big-calendar dark mode → custom CSS injection
```

---

## 4. CURRENT FLOW POSITION

```mermaid
flowchart LR
    A[✅ Phase 1-8\nAll Pages + AI Built] --> B[✅ Phase 9\nHabits + Bookmarks\nOverhaul]
    B --> C{🔴 BUG-005\nActive}
    C -->|Delete lines 100-103\nAppLayout.jsx| D[⚡ CURRENT\nFix emoji span\nin search button]
    D --> E[Run embed_notes\nbackfill command]
    E --> F[Test AI Search\n⌘K verification]
    F --> G[Phase 10C\nStuck 7+ days nudge]

    style C fill:#FF453A,color:#fff
    style D fill:#FFD60A,color:#000
    style E fill:#2C2C2E,color:#fff
    style F fill:#2C2C2E,color:#fff
    style G fill:#2C2C2E,color:#fff
```

---

### BUG-005 Exact Fix

**File:** `frontend/src/components/AppLayout.jsx`

**Action:** Delete lines 100-103 (the orphaned `🔎` emoji span):

```jsx
// DELETE THESE 4 LINES (100-103):
<span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1, 
    display: 'inline-block', fontVariantEmoji: 'emoji', userSelect: 'none' }}>
    🔎
</span>

// KEEP lines 104-109 (the lucide Search SVG — this is correct):
<Search
    size={18}
    strokeWidth={1.8}
    color="rgba(235,235,245,0.6)"
    style={{ flexShrink: 0 }}
/>
```

---

## 5. FUTURE ROADMAP

```mermaid
flowchart TD
    START([🟡 CURRENT POSITION\nBUG-005 Active]) --> FIX[Fix BUG-005\nDelete emoji span]
    FIX --> EMBED[Run embed_notes\nBackfill existing notes]
    EMBED --> TEST[Test AI Search\n⌘K → verify semantic results]
    TEST --> P10C

    subgraph PHASE_10C ["Phase 10C — Stuck Nudge (20 min)"]
        P10C[On Learning page load:\nCheck steps with status=in_progress\nAND updated_at < now-7days\nShow yellow banner with step name]
    end

    subgraph PHASE_DND ["Drag & Drop — @dnd-kit"]
        DND1[Habits list reorder\nup/down drag]
        DND2[Drag habit onto another\n→ becomes sub-item]
        DND3[Learning steps\nreorder in flowchart]
        DND4[Drag task → Calendar icon\n→ date picker modal]
        DND1 --> DND2 --> DND3
        DND4:::later
    end

    subgraph PHASE_DEPLOY ["Deploy Checkpoint"]
        DEP1[Vercel — Frontend]
        DEP2[Render — Backend]
        DEP3[GitHub Actions CI/CD]
        DEP1 --> DEP2 --> DEP3
    end

    subgraph PHASE_11 ["Phase 11 — Bookmark Watcher Agent"]
        P11A[Not opened in N days\nreminder strip in Bookmarks]
        P11B[Weekly brain digest\non-demand Gemini summary]
        P11C[New chapter check\nwhere APIs exist]
        P11A --> P11B --> P11C
    end

    subgraph PHASE_12 ["Phase 12 — Resume Coach Agent"]
        P12A[PDF upload\npdfplumber parse]
        P12B[Gemini skill gap analysis\nvs target job description]
        P12C[Auto-create Learning Path\nfrom identified gaps]
        P12A --> P12B --> P12C
    end

    subgraph PHASE_15 ["Phase 15 — Agent Hub"]
        P15A[Floating chatbot button\non every page]
        P15B[All agents accessible\nfrom one chat interface]
        P15C[Autonomous agent routing\nGemini decides which agent]
        P15A --> P15B --> P15C
    end

    subgraph PHASE_13 ["Phase 13 — Calendar Scheduler Agent (Complex)"]
        P13A[Free slot detection\nanalyze existing events]
        P13B[Auto-schedule study blocks\nin empty slots]
        P13C[Missed session\nreschedule logic]
        P13D[Pre-session briefing\n5-min context from notes]
        P13E[Post-session\nauto-log as HabitLog]
        P13F[In-app + email reminders]
        P13A --> P13B --> P13C --> P13D --> P13E --> P13F
    end

    subgraph PHASE_FUTURE ["Future / Long-term"]
        F1[TipTap rich text editor\nin Notes with @mention]
        F2[Celery for background jobs\nweekly digest email]
        F3[Mobile responsive layout]
        F4[System flowchart page\nAgent 8 — linked data viz]
        F5[Multi-user SaaS\nif personal use validated]
    end

    P10C --> PHASE_DND
    PHASE_DND --> PHASE_DEPLOY
    PHASE_DEPLOY --> PHASE_11
    PHASE_11 --> PHASE_12
    PHASE_12 --> PHASE_15
    PHASE_15 --> PHASE_13
    PHASE_13 --> PHASE_FUTURE

    classDef later fill:#636366,color:#fff,stroke-dasharray:5
    classDef done fill:#32D74B,color:#000
    classDef active fill:#FFD60A,color:#000
    classDef bug fill:#FF453A,color:#fff
```

---

### Full Roadmap Table

| Phase | Feature | Priority | Complexity | Status |
|---|---|---|---|---|
| BUG-005 | Delete emoji span AppLayout.jsx | 🔴 Critical | Trivial | Active |
| Post-BUG | Run embed_notes command | 🔴 High | Trivial | Blocked by BUG-005 |
| 10C | Stuck 7+ days nudge on Learning | 🟡 High | Low (20 min) | Not started |
| DND-1 | Habit list reorder (@dnd-kit) | 🟡 High | Low | Not started |
| DND-2 | Drag habit → sub-task of another | 🟡 Medium | Medium | Not started |
| DND-3 | Learning steps reorder | 🟡 Medium | Low (React Flow built-in) | Not started |
| DND-4 | Drag task → Calendar icon | 🔵 Low | High | Later |
| Deploy | Vercel + Render + CI/CD | 🔴 High | Medium (2h) | Not started |
| 11A | Bookmark "not opened in N days" | 🟡 Medium | Low | Not started |
| 11B | Weekly brain digest | 🟡 Medium | Low | Not started |
| 12A | Resume PDF upload + parse | 🟡 High | Medium | Not started |
| 12B | Gemini skill gap analysis | 🟡 High | Low (prompt) | Not started |
| 12C | Auto-create Learning Path | 🟡 High | Low | Not started |
| 15 | Agent Hub floating chatbot | 🟡 High | Medium | Not started |
| 13A | Calendar free slot detection | 🔵 Medium | High | Not started |
| 13B | Auto-schedule study blocks | 🔵 Medium | High | Not started |
| 13C | Missed session reschedule | 🔵 Low | High | Not started |
| 13D | Pre-session briefing | 🔵 Low | Medium | Not started |
| 13E | Post-session habit log | 🔵 Low | Medium | Not started |
| 13F | In-app + email reminders | 🔵 Low | High (Celery) | Not started |
| Future | TipTap @mention in Notes | 🔵 Low | High | Not started |
| Future | Mobile responsive layout | 🔵 Low | High | Not started |
| Future | System flowchart page | 🔵 Low | Medium | Not started |
| Future | Multi-user SaaS | ⚪ Idea | Very High | Not started |

---

## 6. MODULE RELATIONSHIP FLOWCHART

```mermaid
flowchart TD
    subgraph FRONTEND ["Frontend — React 18 + Vite (localhost:5173)"]
        AL[AppLayout.jsx\nShared sidebar nav\nHover-expand 64→160px\nlucide-react icons]
        AI_S[AISearch.jsx\n⌘K modal\nSearch + Chat + Agent]
        
        N[Notes.jsx\n3-panel editor\nFolders + Tags + Import\nAI summarize]
        B[Bookmarks.jsx\nGrid/list\nProgress + Categories\nURL auto-tag]
        H[Habits.jsx\nTime sections\nSub-items + Numeric\nHeatmap]
        C[Calendar.jsx\nMonth/Week/Day/Year\nEvents + Routines\nDetail panel]
        L[Learning.jsx\nReact Flow canvas\nBulk paste\nAI schedule]
        
        AL --> N & B & H & C & L
        AI_S --> N & B
    end

    subgraph BACKEND ["Backend — Django 6.0.4 (127.0.0.1:8000)"]
        VIEWS[views.py\nAll API endpoints]
        MODELS[models.py\nAll DB models]
        SERIAL[serializers.py\nDRF serializers]
        AI_U[ai_utils.py\nGemini embedding\nRAG chat + agent\nSchedule planner]
        AI_A[ai_agent.py\nLearning coach\nCourse extractor]
        
        VIEWS --> MODELS & SERIAL & AI_U & AI_A
    end

    subgraph DATABASE ["Database — PostgreSQL + pgvector (Neon.tech)"]
        NOTE_T[(Note\n+embedding 768d)]
        BM_T[(Bookmark)]
        HABIT_T[(Habit + HabitLog\n+ SubItem + SubItemLog)]
        CAL_T[(CalendarEvent)]
        PATH_T[(LearningPath\n+ PathStep)]
    end

    subgraph AI ["AI — Google Gemini"]
        EMB[gemini-embedding-001\n768 dimensions\nSemantic vectors]
        GEN[gemini-2.5-flash\nChat + summarize\nSchedule + extract]
    end

    FRONTEND <-->|REST API\nJWT Bearer| BACKEND
    BACKEND <-->|pgvector\nORM| DATABASE
    BACKEND <-->|google-genai SDK| AI
    NOTE_T <-->|cosine distance| EMB
```

---

## 7. API DEPENDENCY FLOW

```mermaid
flowchart LR
    subgraph AUTH ["Authentication Flow"]
        R[POST /api/register/] --> L2[POST /api/login/]
        L2 --> T[localStorage\naccess + refresh tokens]
        T --> INT[Axios interceptor\nattaches Bearer]
        INT -->|401| REF[POST /api/token/refresh/]
        REF -->|fail| LOGOUT[Force /login]
    end

    subgraph NOTES_FLOW ["Notes → AI"]
        NC[POST /api/notes/] -->|auto-embed| EMB2[get_embedding\nGemini API]
        EMB2 --> VEC[(VectorField\n768 dims)]
        VEC -->|cosine search| SEM[GET /api/ai/search/]
        NC --> SUM[POST /api/notes/pk/summarize/]
        SUM --> GEM[gemini-2.5-flash]
    end

    subgraph HABIT_FLOW ["Habits → Calendar"]
        HT[POST /api/habits/pk/toggle/] --> OPT[Optimistic UI\n0ms lag]
        HC[POST /api/habits/pk/cascade/] --> ALL[Marks all sub-items]
        HN[POST /api/habits/pk/numeric/] --> RATE[completion_rate\n= actual/target capped 1.0]
        HAB_CAL[Add to Calendar] --> CEV[POST /api/events/]
    end

    subgraph LEARN_FLOW ["Learning → AI → Calendar"]
        EXT[POST /api/ai/extract-course/] --> BULK[POST /api/paths/pk/bulk-steps/]
        SCH[POST /api/ai/schedule/] --> GEM2[gemini-2.5-flash\ngenerates JSON sessions]
        GEM2 --> REVIEW[Frontend review modal\nuser removes unwanted]
        REVIEW --> CONF[POST /api/ai/schedule/confirm/]
        CONF --> EVENTS[Creates CalendarEvent\nfor each session]
    end
```

---

## 8. DEVELOPMENT PHASES OVERVIEW

```mermaid
gantt
    title Second Brain — Development Phases
    dateFormat  YYYY-MM-DD
    axisFormat  Phase %d

    section Completed
    Foundation + Auth           :done, p1, 2026-01-01, 7d
    Notes Page                  :done, p2, after p1, 7d
    Bookmarks Page              :done, p3, after p2, 5d
    Habits Page v1              :done, p4, after p3, 5d
    Calendar Page               :done, p5, after p4, 7d
    Learning Page               :done, p6, after p5, 7d
    AppLayout + Imports         :done, p7, after p6, 5d
    AI Integration              :done, p8, after p7, 7d
    Habits v2 + Overhauls       :done, p9, after p8, 10d

    section Active
    BUG-005 Fix                 :active, bug5, 2026-05-08, 1d

    section Immediate Next
    embed_notes + AI verify     :near1, after bug5, 1d
    Phase 10C stuck nudge       :near2, after near1, 1d
    Drag and Drop               :near3, after near2, 5d
    Deploy Checkpoint           :near4, after near3, 2d

    section Short-term
    Phase 11 Bookmark Watcher   :s1, after near4, 5d
    Phase 12 Resume Coach       :s2, after s1, 7d

    section Medium-term
    Phase 15 Agent Hub          :m1, after s2, 7d
    Phase 13 Calendar Scheduler :m2, after m1, 14d

    section Long-term
    TipTap + @mention           :l1, after m2, 10d
    Mobile Responsive           :l2, after l1, 7d
    System Flowchart Page       :l3, after l2, 5d
```

---

## 9. IMPORTANT DECISIONS QUICK REFERENCE

| Decision | Choice | Why |
|---|---|---|
| Backend framework | Django + DRF | ORM, admin, JWT mature ecosystem |
| Database | PostgreSQL + pgvector | Relational + vector search in one DB |
| DB host | Neon.tech | Free, serverless, pgvector supported |
| Frontend | React 18 + Vite | Already on resume, SPA sufficient |
| Styling | Inline styles per page | Precise control, no class conflicts |
| Embedding model | `gemini-embedding-001` | Only model that worked on user's API key |
| Chat model | `gemini-2.5-flash` | Free tier, sufficient quality |
| Gemini SDK | `google-genai` (new) | User already installed this |
| JWT storage | localStorage | Simple for single-user personal tool |
| Habit delete | Soft delete (is_active=False) | Preserves HabitLog history |
| Weekdays convention | 0=Monday (Python) | Matches datetime.weekday() |
| Inactivity collapse threshold | >2 days (3+) | 1-2 days = normal weekly habit gap |
| Drag library | @dnd-kit (planned) | Modern, Notion/Linear standard |
| Background jobs | No Celery yet | Not needed until Agent 3 |

---

## 10. TECH DEBT & WARNINGS

```mermaid
flowchart TD
    TD1[⚠️ streak_count computed\nper request N DB queries\nFix: store as Habit column]
    TD2[⚠️ ai_service.py\nOLD file, superseded by ai_utils.py\nCan be deleted]
    TD3[⚠️ embed_notes not run yet\nExisting notes have no embeddings\nAI Search returns empty]
    TD4[⚠️ weekdays 0=Monday convention\nDiffers from JS getDay 0=Sunday\nFrontend converts — critical]
    TD5[⚠️ VectorField dimensions=768\nNEVER change without full re-embed\nCrashes pgvector queries]
    TD6[⚠️ BUG-001 pending\nFavicon 404 for localhost URLs\nin Bookmarks.jsx]

    style TD1 fill:#FF9F0A,color:#000
    style TD2 fill:#636366,color:#fff
    style TD3 fill:#FF453A,color:#fff
    style TD4 fill:#FF453A,color:#fff
    style TD5 fill:#FF453A,color:#fff
    style TD6 fill:#FF9F0A,color:#000
```

---

## 11. START FROM HERE — NEW CHAT CONTEXT HANDOFF

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 START FROM HERE — PASTE THIS INTO NEW CHAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: Second Brain — personal full-stack PKM app
DEVELOPER: Janesh (Secunderabad, India, macOS, Chrome)

STACK:
- Frontend: React 18 + Vite, inline styles (NOT Tailwind in pages), 
  React Router v6, Axios + JWT interceptors, React Flow, react-big-calendar, 
  lucide-react, @dnd-kit (planned)
- Backend: Django 6.0.4 + DRF, djangorestframework-simplejwt
- DB: PostgreSQL + pgvector on Neon.tech (VectorField dimensions=768)
- AI: google-genai SDK (new, NOT google-generativeai)
      gemini-embedding-001 (768 dims — CONFIRMED WORKING)
      gemini-2.5-flash (generation)
- Package manager: uv (backend), npm (frontend)

DESIGN SYSTEM (copy-pasted at top of every page file):
const C = {
  bg:'#1C1C1E', sidebar:'#2C2C2E', sep:'rgba(84,84,88,0.55)',
  accent:'#FFD60A', t1:'#FFFFFF', t2:'rgba(235,235,245,0.6)',
  t3:'rgba(235,235,245,0.28)', danger:'#FF453A', success:'#32D74B',
  font:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',system-ui,sans-serif"
}

COMPLETED: Notes ✅ Bookmarks ✅ Habits ✅ Calendar ✅ Learning ✅ 
           AppLayout ✅ AI Search/Chat/Agent ✅ JWT auto-refresh ✅
           Optimistic habit toggle ✅ Past track heatmap ✅ 
           AI Schedule Generator ✅ Import Apple/Google Keep ✅

ACTIVE BUG — BUG-005:
File: frontend/src/components/AppLayout.jsx
Problem: Search button has orphaned emoji span (🔎) on lines 100-103 
         alongside correct lucide <Search> SVG on lines 104-109
Fix: DELETE lines 100-103 (the emoji span only)

IMMEDIATE NEXT STEPS (in order):
1. Fix BUG-005 (delete lines 100-103 in AppLayout.jsx)
2. Verify sidebar looks correct (hard refresh browser Cmd+Shift+R)
3. Run: uv run python manage.py embed_notes
4. Test AI Search from ⌘K bar
5. Phase 10C: "Stuck 7+ days" nudge on Learning page load
   - Check PathStep.status='in_progress' AND updated_at < now-7days
   - Show yellow banner: "{step.title} stuck for 7+ days. Resume?"
6. Add @dnd-kit drag-and-drop (habits list reorder, then sub-task drag)
7. Deploy: Vercel (frontend) + Render (backend)

CRITICAL WARNINGS:
⚠️ weekdays field: 0=Monday (Python) NOT 0=Sunday (JS). 
   Frontend converts: js_getDay()==0 ? 6 : js_getDay()-1
⚠️ VectorField(dimensions=768) — NEVER change without re-embedding all notes
⚠️ Soft delete habits (is_active=False) — never hard delete, preserves logs
⚠️ ai_service.py = old file, ignore. ai_utils.py = active AI module
⚠️ Each page has its OWN sidebar (folders/categories) separate from AppLayout

USER PREFERENCES:
- Explain WHY for each code change
- Knowledge Check question at end of each major step  
- Bug tracking: BUG-001, BUG-002 IDs. Resolved bugs → store in memory only
- Don't reprint full files unless necessary
- Confirm plan before generating code
- One page = one .jsx file with all sub-components inside

PLANNED ORDER:
1. BUG-005 fix         
2. embed_notes run
3. Phase 10C nudge (20 min)
4. Drag-and-drop @dnd-kit 
5. Deploy Vercel + Render  
6. Phase 11 Bookmark Watcher  ← YOU ARE HERE
7. Phase 12 Resume Coach
8. Phase 15 Agent Hub chatbot
9. Phase 13 Calendar Scheduler Agent (most complex)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
