from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField

class Folder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="folders")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    # Folder is optional — notes can exist without a folder
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name="notes")
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # auto-updates on every save
    embedding = VectorField(dimensions=768, null=True, blank=True)

    source_hash   = models.CharField(max_length=64, blank=True, null=True)
    source_type   = models.CharField(max_length=20, blank=True, null=True)  # 'apple' | 'google_keep' | null

    def __str__(self):
        return self.title or "Untitled"
    
#bookmark

class BookmarkFolder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmark_folders")
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)

    class Meta:
        # Prevents two categories with same name for the same user
        unique_together = ('user', 'name')

    def __str__(self):
        return self.name


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    folder = models.ForeignKey(BookmarkFolder, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookmarks")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookmarks")

    # All fields are optional — user can save just a raw note if they want
    url = models.URLField(max_length=2000, blank=True)
    title = models.CharField(max_length=500, blank=True)
    content = models.TextField(blank=True)       # notes/random info about this bookmark
    progress = models.CharField(max_length=255, blank=True)  # "Chapter 42", "45%", "Video 3 of 12"
    is_favorite = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_opened = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title or self.url or "Untitled Bookmark"
    
#habbit

class Habit(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    COLOR_CHOICES = [
        ('yellow', '#FFD60A'),
        ('blue', '#0A84FF'),
        ('green', '#32D74B'),
        ('red', '#FF453A'),
        ('purple', '#BF5AF2'),
        ('orange', '#FF9F0A'),
    ]
    TIME_OF_DAY_CHOICES = [
        ('anytime','Anytime'),
        ('morning','Morning'),
        ('afternoon','Afternoon'),
        ('evening','Evening'),
        ('night','Night'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    color = models.CharField(max_length=10, choices=COLOR_CHOICES, default='yellow')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    time_of_day = models.CharField(
        max_length=10, choices=TIME_OF_DAY_CHOICES, default='anytime'
    )
    target_value = models.PositiveIntegerField(null=True, blank=True)
    weekdays    = models.CharField(max_length=20, blank=True, default='')
    streak_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()          # The day this log belongs to
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    actual_value = models.PositiveIntegerField(null=True, blank=True)
    class Meta:
        # One log entry per habit per day — no duplicates
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.name} — {self.date}"


class RoutineSubItem(models.Model):
    """A child item inside a routine — e.g. 'Dolo tablet before breakfast'"""
    routine = models.ForeignKey(
        Habit, on_delete=models.CASCADE, related_name='sub_items'
    )
    name = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.routine.name} → {self.name}"


class RoutineSubItemLog(models.Model):
    """Tracks whether a sub-item was completed on a specific date"""
    sub_item = models.ForeignKey(
        RoutineSubItem, on_delete=models.CASCADE, related_name='logs'
    )
    date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('sub_item', 'date')

    def __str__(self):
        return f"{self.sub_item.name} — {self.date}"


class CalendarEvent(models.Model):
    """One-time or recurring events: meetings, reminders, learning sessions, tasks"""
    EVENT_TYPES = [
        ('meeting',          'Meeting'),
        ('reminder',         'Reminder'),
        ('learning_session', 'Learning Session'),
        ('task',             'Task'),
        ('exercise',         'Exercise'),
        ('other',            'Other'),
    ]
    RECURRENCE_CHOICES = [
        ('none',    'None'),
        ('daily',   'Daily'),
        ('weekly',  'Weekly'),
        ('monthly', 'Monthly'),
    ]
    TIME_OF_DAY = [
        ('morning',   'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening',   'Evening'),
        ('allday',    'All Day'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    title      = models.CharField(max_length=255)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other')
    notes      = models.TextField(blank=True)
    color      = models.CharField(max_length=10, default='blue')

    # Timing
    date       = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time   = models.TimeField(null=True, blank=True)
    time_of_day = models.CharField(max_length=10, choices=TIME_OF_DAY, default='allday')
    is_all_day  = models.BooleanField(default=False)

    # Recurrence
    recurrence      = models.CharField(max_length=10, choices=RECURRENCE_CHOICES, default='none')
    recurrence_end  = models.DateField(null=True, blank=True)

    # Optional link to a learning path step (for "GCP Chapter 4 at 9AM")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    linked_step = models.ForeignKey('PathStep', on_delete=models.SET_NULL, null=True, blank=True, related_name='calendar_events')

    def __str__(self):
        return f"{self.title} — {self.date}"
    
#learning
class LearningPath(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_paths')
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    color       = models.CharField(max_length=10, default='blue')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PathStep(models.Model):
    STATUS_CHOICES = [
        ('todo',        'To Do'),
        ('in_progress', 'In Progress'),
        ('done',        'Done'),
    ]
    path         = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='steps')
    title        = models.CharField(max_length=255)
    description  = models.TextField(blank=True)
    resource_url = models.URLField(max_length=2000, blank=True)
    order        = models.PositiveIntegerField(default=0)
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='todo')
    estimated_hours = models.FloatField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.path.name} → {self.title}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    resume_text = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    last_analyzed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Skill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    level = models.IntegerField(default=0) # 0 to 100
    category = models.CharField(max_length=100, blank=True) # e.g., 'Backend', 'Cloud'

    class Meta:
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.name} ({self.level}%)"