"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api.views import (
    health_check, RegisterView,
    NoteListCreateView, NoteDetailView,
    FolderListCreateView, FolderDetailView,
    BookmarkListCreateView, BookmarkDetailView,
    BookmarkFolderListCreateView, BookmarkFolderDetailView,
    CategoryListCreateView, CategoryDetailView,
    bookmark_mark_opened,
    HabitListCreateView, HabitDetailView,
    habit_toggle, #habit_history,
    SubItemListCreateView, SubItemDetailView, subitem_toggle,
    CalendarEventListCreateView, CalendarEventDetailView,
    calendar_day_view,LearningPathListCreateView, LearningPathDetailView,
    PathStepListCreateView, PathStepDetailView,path_bulk_steps, import_apple_notes, import_google_keep,
    ai_search, ai_learning_coach, ai_extract_course, habit_cascade_complete, habit_log_numeric,add_subitem, all_habits_history,
    semantic_search, summarize_note, ai_chat, agent_command,
    ai_generate_schedule, ai_confirm_schedule,stuck_steps,habit_reorder,promote_subitem,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),

    path('api/register/', RegisterView.as_view()),
    path('api/login/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    path('api/notes/', NoteListCreateView.as_view()),
    path('api/notes/<int:pk>/', NoteDetailView.as_view()),
    path('api/folders/', FolderListCreateView.as_view()),
    path('api/folders/<int:pk>/', FolderDetailView.as_view()),

    path('api/bookmarks/', BookmarkListCreateView.as_view()),
    path('api/bookmarks/<int:pk>/', BookmarkDetailView.as_view()),
    path('api/bookmarks/<int:pk>/opened/', bookmark_mark_opened),
    path('api/bookmark-folders/', BookmarkFolderListCreateView.as_view()),
    path('api/bookmark-folders/<int:pk>/', BookmarkFolderDetailView.as_view()),
    path('api/categories/', CategoryListCreateView.as_view()),
    path('api/categories/<int:pk>/', CategoryDetailView.as_view()),

    path('api/habits/', HabitListCreateView.as_view()),
    path('api/habits/<int:pk>/', HabitDetailView.as_view()),
    path('api/habits/<int:pk>/toggle/', habit_toggle),
    #path('api/habits/<int:pk>/history/', habit_history),

    path('api/subitems/', SubItemListCreateView.as_view()),
    path('api/subitems/<int:pk>/', SubItemDetailView.as_view()),
    path('api/subitems/<int:pk>/toggle/', subitem_toggle),

    path('api/events/', CalendarEventListCreateView.as_view()),
    path('api/events/<int:pk>/', CalendarEventDetailView.as_view()),
    path('api/calendar/day/', calendar_day_view),

    path('api/paths/', LearningPathListCreateView.as_view()),
    path('api/paths/<int:pk>/', LearningPathDetailView.as_view()),
    path('api/steps/', PathStepListCreateView.as_view()),
    path('api/steps/<int:pk>/', PathStepDetailView.as_view()),
    path('api/paths/<int:pk>/bulk-steps/', path_bulk_steps),
    path('api/import/apple/', import_apple_notes),
    path('api/import/google-keep/', import_google_keep),
    path('api/search/', ai_search),
    path('api/ai/coach/', ai_learning_coach),
    path('api/ai/extract-course/', ai_extract_course),
    path('api/habits/<int:pk>/cascade/', habit_cascade_complete),
    path('api/habits/<int:pk>/numeric/', habit_log_numeric),
    path('api/habits/<int:pk>/add-subitem/', add_subitem),
    path('api/habits/history/all/', all_habits_history),
    path('api/ai/search/', semantic_search),
    path('api/ai/chat/', ai_chat),
    path('api/ai/agent/', agent_command),
    path('api/notes/<int:pk>/summarize/', summarize_note),
    path('api/ai/schedule/', ai_generate_schedule),
    path('api/ai/schedule/confirm/', ai_confirm_schedule),
    path('api/steps/stuck/', stuck_steps),
    path('api/habits/reorder/', habit_reorder),
    path('api/subitems/<int:pk>/promote/', promote_subitem),
]