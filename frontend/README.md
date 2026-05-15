# 🧠 Second Brain

A personal knowledge management system that stores your notes, bookmarks, habits, calendar, and learning paths — all searchable and connected through AI.

Built with Django + React. Powered by Gemini AI and pgvector semantic search.

---

## What It Does

Second Brain is a single-user personal productivity app that unifies everything you want to remember and learn:

- **Notes** — write and auto-save notes with folders, tags, and AI summarization
- **Bookmarks** — save URLs and notes with progress tracking (e.g. "Chapter 42", "Episode 5")
- **Habits** — daily/weekly habit tracking with streaks, sub-items, and a full history heatmap
- **Calendar** — manage events and routines with Month, Week, Day, and Year views
- **Learning** — visualize courses as interactive flowcharts and generate AI study schedules
- **AI Search** — semantic search across all your notes and bookmarks via ⌘K

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Django 6.0.4 + Django REST Framework |
| Database | PostgreSQL + pgvector (Neon.tech) |
| AI | Google Gemini (`google-genai` SDK) |
| Auth | JWT (`djangorestframework-simplejwt`) |
| Icons | lucide-react |
| Calendar | react-big-calendar + date-fns |
| Learning | React Flow (`reactflow`) |
| Package manager | `uv` (backend), `npm` (frontend) |

---

## Project Structure

```
second-brain-workspace/
├── backend/
│   ├── core/
│   │   ├── settings.py          # Django config
│   │   └── urls.py              # All URL routes
│   ├── api/
│   │   ├── models.py            # All database models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # All API views
│   │   ├── ai_utils.py          # Gemini AI (embeddings, RAG, agent)
│   │   ├── ai_agent.py          # Learning coach + course extractor
│   │   └── management/
│   │       └── commands/
│   │           └── embed_notes.py   # Backfill note embeddings
│   ├── .env                     # API keys (never commit)
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AppLayout.jsx    # Shared sidebar navigation
    │   │   ├── AISearch.jsx     # ⌘K search modal
    │   │   ├── Skeleton.jsx     # Loading states
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Notes.jsx
    │   │   ├── Bookmarks.jsx
    │   │   ├── Habits.jsx
    │   │   ├── Calendar.jsx
    │   │   └── Learning.jsx
    │   ├── utils/
    │   │   └── linkify.jsx
    │   ├── api.js               # Axios + JWT interceptors
    │   └── App.jsx
    └── .env
```

---

## Setup

### Prerequisites

- Python 3.13+
- Node.js 18+
- [`uv`](https://github.com/astral-sh/uv) — Python package manager
- A [Neon.tech](https://neon.tech) PostgreSQL database with pgvector enabled
- A [Google AI Studio](https://aistudio.google.com) API key

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/second-brain.git
cd second-brain
```

---

### 2. Backend setup

```bash
cd backend
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
GEMINI_API_KEY=AIza...
SECRET_KEY=your-django-secret-key
DEBUG=True
```

Install dependencies and run migrations:

```bash
uv run python manage.py migrate
uv run python manage.py createsuperuser   # optional, for /admin
```

Backfill AI embeddings for existing notes (run once):

```bash
uv run python manage.py embed_notes
```

Start the development server:

```bash
uv run python manage.py runserver
# Runs at http://127.0.0.1:8000
```

---

### 3. Frontend setup

```bash
cd frontend
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Install dependencies and start:

```bash
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon.tech recommended) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development, `False` for production |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (`http://127.0.0.1:8000` for local) |

---

## Features

### Notes
- Apple Notes-style 3-panel layout (folders → list → editor)
- Auto-saves as you type (800ms debounce)
- Folder organization
- `#hashtag` auto-detection for tagging
- Import from **Apple Notes** (Markdown/HTML zip) and **Google Keep** (Takeout zip)
- Duplicate detection on re-import via MD5 hash
- AI summarization per note (Gemini)

### Bookmarks
- Save URLs or plain notes
- Progress tracking ("Chapter 42", "Episode 5 of 12")
- Category system (auto-tagged by URL domain pattern)
- Favorites, folders, grid/list view
- Quick-add: paste a URL → press Enter
- Last-opened tracking

**Auto-tag rules by domain:**

| Domain pattern | Category |
|---|---|
| youtube.com, vimeo.com | Video |
| mangadex.org, webtoons.com | Manga |
| coursera.org, udemy.com | Course |
| github.com, npmjs.com | Tool |
| arxiv.org | Research |
| medium.com, dev.to | Article |

### Habits
- Daily and weekly habit tracking
- **Weekly habits** — select which days (Mon/Wed/Fri etc.), grayed out on off-days
- **Numeric habits** — set a target (e.g. 20 push-ups), log actual count, partial circle fill shows progress
- **Sub-items** — expand a habit to see/toggle individual items (e.g. "Morning Meds → Med1, Med2, Med3"), marking parent cascades all children
- Time-of-day grouping (Anytime, Morning, Afternoon, Evening, Night)
- Streak tracking with 🔥 counter
- **Past Track heatmap** — scrollable horizontal grid (1W / 1M / 3M / All time), inactivity periods collapsed
- Optimistic UI — circle fills instantly, no loading delay
- Add any habit to Calendar with one click

### Calendar
- Month, Week, Day, and Year views (Year view is custom 4×3 mini-month grid)
- Create and edit events (type, color, recurrence, notes)
- Recurring events (daily, weekly, monthly)
- Habits appear as all-day items
- **Detail panel** — click events to pin them for side-by-side comparison
- Mini-calendar in panel for quick navigation

### Learning Paths
- Visual flowchart per course (React Flow — draggable, zoomable, with MiniMap)
- Step statuses: To Do / In Progress / Done (color-coded edges)
- **Bulk paste** — paste a chapter list from any website, creates all steps at once
- Auto-arrange button resets to clean 4-column grid
- **AI Course Extractor** — paste a URL or syllabus text, Gemini extracts chapters
- **Add to Calendar** — schedule any chapter as a learning session
- **AI Study Planner** — 4-step modal: select courses → set hours/days → Gemini generates schedule → review and add to Calendar

### AI (⌘K)
- **Semantic Search** — finds notes by meaning, not just keywords (pgvector cosine similarity)
- **Ask AI** — RAG chat that answers from your actual notes and bookmarks
- **Quick Command** — natural language bookmark updates ("manga one piece chapter 65")
- **Learning Coach** — asks Gemini for a study strategy based on your current paths
- **Note Summarizer** — 3-5 bullet summary of any note

---

## API Overview

All endpoints are prefixed with `/api/`. Full list in `backend/core/urls.py`.

### Auth
```
POST  /api/register/
POST  /api/login/
POST  /api/token/refresh/
```

### Notes
```
GET   /api/notes/?folder=<id>
POST  /api/notes/
PUT   /api/notes/<pk>/
DELETE /api/notes/<pk>/
POST  /api/notes/<pk>/summarize/
GET   /api/folders/
POST  /api/folders/
```

### Bookmarks
```
GET   /api/bookmarks/?folder=&category=&search=&favorites=true
POST  /api/bookmarks/
PUT   /api/bookmarks/<pk>/
POST  /api/bookmarks/<pk>/opened/
GET   /api/categories/
```

### Habits
```
GET   /api/habits/
POST  /api/habits/
PUT   /api/habits/<pk>/
POST  /api/habits/<pk>/toggle/
POST  /api/habits/<pk>/cascade/
POST  /api/habits/<pk>/numeric/
POST  /api/habits/<pk>/add-subitem/
GET   /api/habits/history/all/?range=1w|1m|3m|all
POST  /api/subitems/<pk>/toggle/
DELETE /api/subitems/<pk>/
```

### Calendar
```
GET   /api/events/?start=YYYY-MM-DD&end=YYYY-MM-DD
POST  /api/events/
PUT   /api/events/<pk>/
DELETE /api/events/<pk>/
GET   /api/calendar/day/?date=YYYY-MM-DD
```

### Learning
```
GET   /api/paths/
POST  /api/paths/
DELETE /api/paths/<pk>/
POST  /api/paths/<pk>/bulk-steps/
PATCH /api/steps/<pk>/
DELETE /api/steps/<pk>/
```

### AI
```
GET   /api/ai/search/?q=your query
POST  /api/ai/chat/
POST  /api/ai/agent/
POST  /api/ai/coach/
POST  /api/ai/extract-course/
POST  /api/ai/schedule/
POST  /api/ai/schedule/confirm/
```

### Import
```
POST  /api/import/apple/         # multipart/form-data, .zip file
POST  /api/import/google-keep/   # multipart/form-data, .zip file
```

---

## Database Models

```
Folder          → user, name
Note            → user, folder, title, body, tags, embedding(768d), source_hash

BookmarkFolder  → user, name
Category        → user, name
Bookmark        → user, folder, category, url, title, content, progress,
                  is_favorite, last_opened

Habit           → user, name, frequency, color, time_of_day, target_value,
                  weekdays, is_active
HabitLog        → habit, date, completed, actual_value     [unique: habit+date]
RoutineSubItem  → routine(Habit), name, order
RoutineSubItemLog → sub_item, date, completed              [unique: sub_item+date]

CalendarEvent   → user, title, event_type, date, start_time, end_time,
                  recurrence, color, linked_step

LearningPath    → user, name, description, color
PathStep        → path, title, status, order, estimated_hours, resource_url
```

The `Note.embedding` field uses pgvector (`VectorField(dimensions=768)`) to enable semantic search via cosine similarity.

---

## AI Setup Details

The app uses the new `google-genai` SDK (not `google-generativeai`).

```python
# backend/api/ai_utils.py
EMBED_MODEL = 'gemini-embedding-001'   # 768 dims — confirmed working
CHAT_MODEL  = 'gemini-2.5-flash'       # generation
```

After first setup, backfill embeddings for existing notes:
```bash
uv run python manage.py embed_notes
```

New notes are embedded automatically on save.

---

## Authentication Flow

```
Register  →  POST /api/register/  →  creates User
Login     →  POST /api/login/     →  returns {access, refresh} JWT tokens
                                     stored in localStorage

Every request:
  Axios request interceptor → attaches Authorization: Bearer <access>

On 401 response:
  Axios response interceptor → calls /api/token/refresh/
  If refresh succeeds → retries original request
  If refresh fails    → clears tokens → redirects to /login
```

Access token lifetime: 1 day. Refresh token lifetime: 7 days.

---

## Design System

All pages use a shared color constant object:

```javascript
const C = {
  bg:      '#1C1C1E',              // main background (macOS dark)
  sidebar: '#2C2C2E',              // panel/card background
  sep:     'rgba(84,84,88,0.55)', // separator lines
  accent:  '#FFD60A',              // yellow — primary action color
  t1:      '#FFFFFF',              // primary text
  t2:      'rgba(235,235,245,0.6)',  // secondary text
  t3:      'rgba(235,235,245,0.28)', // tertiary/muted text
  danger:  '#FF453A',              // red
  success: '#32D74B',              // green
  font: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif",
}
```

Styling is done with React inline styles throughout. No Tailwind in page components. The navigation sidebar (`AppLayout.jsx`) uses lucide-react SVG icons.

---

## Planned Agents (Roadmap)

| Agent | Description | Status |
|---|---|---|
| Learning Planner | AI schedule generator → Calendar | ✅ Built |
| Learning Coach | Gemini strategy advice on current paths | ✅ Built |
| Bookmark Watcher | "Not opened in N days" reminders + weekly digest | 🔜 Planned |
| Resume Coach | PDF upload → skill gap → auto-create Learning Path | 🔜 Planned |
| Calendar Scheduler | Free slot detection + auto-schedule study blocks | 🔜 Planned |
| RAG Memory | Proactive "3 weeks ago you bookmarked..." surfacing | 🔜 Planned |
| Habit Tracker AI | Scheduling suggestions from habit history | 🔜 Planned |
| Agent Hub | Floating chatbot button on every page → all agents | 🔜 Planned |

---

## Deployment (Planned)

| Service | Platform |
|---|---|
| Frontend | Vercel (auto-deploy from GitHub) |
| Backend | Render (Python/Django web service) |
| Database | Neon.tech (already live, serverless PostgreSQL) |

---

## Contributing

This is a personal productivity tool built for single-user use. Not currently accepting external contributions, but feel free to fork and adapt for your own Second Brain.

---

## License

Personal use. Not licensed for redistribution.
