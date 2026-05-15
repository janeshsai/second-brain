from django.contrib import admin
from .models import (Note, Folder, Bookmark, BookmarkFolder, Category,
                     Habit, HabitLog, RoutineSubItem, RoutineSubItemLog, CalendarEvent,LearningPath, PathStep)

for model in [Note, Folder, Bookmark, BookmarkFolder, Category,
              Habit, HabitLog, RoutineSubItem, RoutineSubItemLog, CalendarEvent,LearningPath, PathStep]:
    admin.site.register(model)