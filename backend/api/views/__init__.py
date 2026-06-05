from .base import health_check, RegisterView
from .notes import (
    FolderListCreateView, FolderDetailView,
    NoteListCreateView, NoteDetailView,
    ai_search, summarize_note,
)
from .bookmarks import (
    CategoryListCreateView, CategoryDetailView,
    BookmarkFolderListCreateView, BookmarkFolderDetailView,
    BookmarkListCreateView, BookmarkDetailView,
    bookmark_mark_opened, agent_command,
)
from .habits import (
    HabitListCreateView, HabitDetailView,
    habit_toggle, habit_cascade_complete, habit_log_numeric,
    add_subitem, all_habits_history, habit_reorder,
    SubItemListCreateView, SubItemDetailView, subitem_toggle,
    promote_subitem,
)
from .calendar import (
    CalendarEventListCreateView, CalendarEventDetailView,
    calendar_day_view,
)
from .learning import (
    LearningPathListCreateView, LearningPathDetailView,
    PathStepListCreateView, PathStepDetailView,
    path_bulk_steps,
    ai_learning_coach, ai_extract_course,
    ai_generate_schedule, ai_confirm_schedule,
    stuck_steps,
)
from .imports import import_apple_notes, import_google_keep
from .ai_views import semantic_search, ai_chat
