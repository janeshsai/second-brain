from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (Note, Folder, Bookmark, BookmarkFolder, Category, Habit, HabitLog,  RoutineSubItem, RoutineSubItemLog, CalendarEvent, LearningPath, PathStep)
import datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class FolderSerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(source='notes.count', read_only=True)
    class Meta:
        model = Folder
        fields = ['id', 'name', 'note_count', 'created_at']
        read_only_fields = ['id', 'created_at']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'tags', 'folder', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class BookmarkFolderSerializer(serializers.ModelSerializer):
    bookmark_count = serializers.IntegerField(source='bookmarks.count', read_only=True)
    class Meta:
        model = BookmarkFolder
        fields = ['id', 'name', 'bookmark_count', 'created_at']
        read_only_fields = ['id', 'created_at']

class BookmarkSerializer(serializers.ModelSerializer):
    # Explicit allow_blank fixes the 400 when URL is empty
    url = serializers.URLField(max_length=2000, allow_blank=True, required=False)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    class Meta:
        model = Bookmark
        fields = [
            'id', 'url', 'title', 'content', 'progress',
            'category', 'category_name', 'folder',
            'is_favorite', 'created_at', 'updated_at', 'last_opened'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name']

#habit

class HabitLogSerializer(serializers.ModelSerializer):
    completion_rate = serializers.SerializerMethodField()

    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'completed', 'completed_at',
                  'actual_value', 'completion_rate']
        read_only_fields = ['id', 'completed_at']

    def get_completion_rate(self, obj):
        if obj.actual_value is not None and obj.habit.target_value:
            return min(obj.actual_value / obj.habit.target_value, 1.0)
        return 1.0 if obj.completed else 0.0


# routine

class RoutineSubItemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineSubItemLog
        fields = ['id', 'sub_item', 'date', 'completed', 'completed_at']
        read_only_fields = ['id', 'completed_at']


class RoutineSubItemSerializer(serializers.ModelSerializer):
    # Inject today's completion status so React doesn't need a second request
    completed_today = serializers.SerializerMethodField()
    log_id = serializers.SerializerMethodField()

    class Meta:
        model = RoutineSubItem
        fields = ['id', 'routine', 'name', 'order', 'completed_today', 'log_id']

    def get_completed_today(self, obj):
        today = datetime.date.today()
        log = RoutineSubItemLog.objects.filter(sub_item=obj, date=today).first()
        return log.completed if log else False

    def get_log_id(self, obj):
        today = datetime.date.today()
        log = RoutineSubItemLog.objects.filter(sub_item=obj, date=today).first()
        return log.id if log else None


class HabitSerializer(serializers.ModelSerializer):
    streak              = serializers.SerializerMethodField()
    completed_today     = serializers.SerializerMethodField()
    total_completions   = serializers.SerializerMethodField()
    sub_items           = RoutineSubItemSerializer(many=True, read_only=True)
    actual_today        = serializers.SerializerMethodField()
    completion_rate_today = serializers.SerializerMethodField()
    is_available_today  = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'frequency', 'color', 'time_of_day',
            'weekdays', 'target_value', 'is_active', 'created_at',
            'streak', 'completed_today', 'total_completions',
            'sub_items', 'actual_today', 'completion_rate_today',
            'is_available_today',
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_available_today(self, obj):
        """For weekly habits: is today one of the selected weekdays?"""
        if obj.frequency != 'weekly' or not obj.weekdays:
            return True
        today = datetime.date.today().weekday()  # 0=Monday
        selected = [int(d) for d in obj.weekdays.split(',') if d.strip().isdigit()]
        return today in selected

    def get_completed_today(self, obj):
        today = datetime.date.today()
        return HabitLog.objects.filter(habit=obj, date=today, completed=True).exists()

    def get_actual_today(self, obj):
        today = datetime.date.today()
        log = HabitLog.objects.filter(habit=obj, date=today).first()
        return log.actual_value if log else None

    def get_completion_rate_today(self, obj):
        today = datetime.date.today()
        log = HabitLog.objects.filter(habit=obj, date=today).first()
        if not log:
            return 0.0
        if log.actual_value is not None and obj.target_value:
            return min(log.actual_value / obj.target_value, 1.0)
        return 1.0 if log.completed else 0.0

    def get_total_completions(self, obj):
        return HabitLog.objects.filter(habit=obj, completed=True).count()

    def get_streak(self, obj):
        return obj.streak_count
    
    
class CalendarEventSerializer(serializers.ModelSerializer):
    linked_step_status = serializers.CharField(source='linked_step.status', read_only=True)

    class Meta:
        model = CalendarEvent
        # ADD 'linked_step' and 'linked_step_status' to the fields list!
        fields = [
            'id', 'title', 'event_type', 'notes', 'color',
            'date', 'start_time', 'end_time', 'time_of_day',
            'is_all_day', 'recurrence', 'recurrence_end', 'created_at',
            'linked_step', 'linked_step_status'
        ]
        read_only_fields = ['id', 'created_at', 'linked_step_status']

#learning

class PathStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathStep
        fields = ['id', 'path', 'title', 'description', 'resource_url',
                  'order', 'status', 'estimated_hours', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LearningPathSerializer(serializers.ModelSerializer):
    steps         = PathStepSerializer(many=True, read_only=True)
    total_steps   = serializers.IntegerField(source='steps.count', read_only=True)
    done_steps    = serializers.SerializerMethodField()

    class Meta:
        model = LearningPath
        fields = ['id', 'name', 'description', 'color', 'created_at',
                  'updated_at', 'steps', 'total_steps', 'done_steps']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_done_steps(self, obj):
        return obj.steps.filter(status='done').count()