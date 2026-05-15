from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (Note, Folder, Bookmark, BookmarkFolder, Category, 
    Habit, HabitLog, RoutineSubItem, RoutineSubItemLog, CalendarEvent,
    LearningPath, PathStep)
from .serializers import (
    UserSerializer, NoteSerializer, FolderSerializer,
    BookmarkSerializer, BookmarkFolderSerializer, CategorySerializer,
    HabitSerializer, HabitLogSerializer,
    RoutineSubItemSerializer, RoutineSubItemLogSerializer, CalendarEventSerializer,
    LearningPathSerializer, PathStepSerializer
)
import datetime
import hashlib
import json
import zipfile
import io
from django.db import models
#from .ai_service import get_embedding
from pgvector.django import CosineDistance
from .ai_agent import generate_learning_strategy, extract_course_syllabus
from .ai_utils import get_embedding, get_query_embedding, generate_summary, rag_chat, agent_parse_command
from django.utils import timezone
from datetime import timedelta



# Add this dict at the top of views.py (outside any class)
URL_TAG_RULES = {
    'youtube.com': 'Video',    'youtu.be': 'Video',
    'vimeo.com': 'Video',
    'mangadex.org': 'Manga',   'mangaplus.shueisha': 'Manga',
    'tcbscans.': 'Manga',      'webtoons.com': 'Manga',
    'coursera.org': 'Course',  'udemy.com': 'Course',
    'edx.org': 'Course',       'freecodecamp.org': 'Course',
    'pluralsight.com': 'Course','linkedin.com/learning': 'Course',
    'arxiv.org': 'Research',   'scholar.google': 'Research',
    'medium.com': 'Article',   'dev.to': 'Article',
    'substack.com': 'Article', 'blog.': 'Article',
    'github.com': 'Tool',      'npmjs.com': 'Tool',
    'pypi.org': 'Tool',        'hub.docker.com': 'Tool',
    'netflix.com': 'Video',    'twitch.tv': 'Video',
}

def recalculate_streak(habit):
    """Walk backwards from today to find consecutive completed days."""
    from datetime import timedelta
    today = datetime.date.today()
    streak = 0
    check = today
    
    while True:
        # For weekly habits, check if this day is in their selected weekdays
        if habit.frequency == 'weekly' and habit.weekdays:
            selected = [int(d) for d in habit.weekdays.split(',') if d.strip().isdigit()]
            if check.weekday() not in selected:
                # Skip this day but continue checking previous days
                check -= timedelta(days=1)
                continue
        
        if HabitLog.objects.filter(habit=habit, date=check, completed=True).exists():
            streak += 1
            check -= timedelta(days=1)
        else:
            break
    
    habit.streak_count = streak
    habit.save(update_fields=['streak_count'])
    return streak

def auto_detect_category(url: str, user) -> 'Category | None':
    """
    Match URL against known patterns → return or create matching Category.
    Returns None if no pattern matches or URL is blank.
    """
    if not url:
        return None
    url_lower = url.lower()
    for pattern, cat_name in URL_TAG_RULES.items():
        if pattern in url_lower:
            # get_or_create so user can customize later without breaking
            cat, _ = Category.objects.get_or_create(
                user=user,
                name=cat_name
            )
            return cat
    return None

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "message": "Backend is connected to the Brain!"})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

class FolderListCreateView(generics.ListCreateAPIView):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user).order_by('name')
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user).order_by('-updated_at')
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            qs = qs.filter(folder_id=folder_id)
        return qs
    def perform_create(self, serializer):
        # 1. Grab the text the user submitted
        title = self.request.data.get('title', '')
        body = self.request.data.get('body', '')
        
        # 2. Ask Gemini for the mathematical meaning of the note
        vector = get_embedding(f"{title}\n{body}")
        
        # 3. Save the note WITH the vector
        serializer.save(user=self.request.user, embedding=vector)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_update(self, serializer):
        # When a note is edited, we must recalculate its meaning
        title = self.request.data.get('title', '')
        body = self.request.data.get('body', '')
        vector = get_embedding(f"{title}\n{body}")
        serializer.save(embedding=vector)

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')
    def perform_create(self, serializer):
        # Normalize to Title Case — prevents "manga" and "Manga" coexisting
        name = self.request.data.get('name', '').strip().title()
        serializer.save(user=self.request.user, name=name)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class BookmarkFolderListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkFolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return BookmarkFolder.objects.filter(user=self.request.user).order_by('name')
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookmarkFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookmarkFolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return BookmarkFolder.objects.filter(user=self.request.user)

class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Bookmark.objects.filter(user=self.request.user).order_by('-updated_at')
        folder_id   = self.request.query_params.get('folder')
        category_id = self.request.query_params.get('category')
        search      = self.request.query_params.get('search')
        favorites   = self.request.query_params.get('favorites')
        if folder_id:   qs = qs.filter(folder_id=folder_id)
        if category_id: qs = qs.filter(category_id=category_id)
        if favorites == 'true': qs = qs.filter(is_favorite=True)
        if search:
            qs = qs.filter(title__icontains=search) | \
                 qs.filter(content__icontains=search) | \
                 qs.filter(url__icontains=search)
        return qs
    def perform_create(self, serializer):
        url = self.request.data.get('url', '')
        # Only auto-tag if user didn't pick a category manually
        category = serializer.validated_data.get('category', None)
        if not category:
            category = auto_detect_category(url, self.request.user)
        serializer.save(user=self.request.user, category=category)

class BookmarkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bookmark_mark_opened(request, pk):
    try:
        bm = Bookmark.objects.get(pk=pk, user=request.user)
        bm.last_opened = timezone.now()
        bm.save()
        return Response(BookmarkSerializer(bm).data)
    except Bookmark.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    
#habit

class HabitListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(
            user=self.request.user, is_active=True
        ).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # Soft delete — mark inactive instead of actually deleting
        # This preserves your historical log data
        instance.is_active = False
        instance.save()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def habit_toggle(request, pk):
    try:
        habit = Habit.objects.get(pk=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    today = datetime.date.today()
    log, _ = HabitLog.objects.get_or_create(habit=habit, date=today)

    actual_value = request.data.get('actual_value', None)

    log.completed = not log.completed
    log.completed_at = timezone.now() if log.completed else None

    if actual_value is not None and log.completed:
        try:
            log.actual_value = int(actual_value)
            if habit.target_value and log.actual_value >= habit.target_value:
                log.completed = True
        except (ValueError, TypeError):
            pass

    log.save()
    
    # Recalculate streak after toggle
    recalculate_streak(habit)
    
    return Response(HabitSerializer(habit, context={'request': request}).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def habit_cascade_complete(request, pk):
    try:
        habit = Habit.objects.get(pk=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    today = datetime.date.today()
    log, _ = HabitLog.objects.get_or_create(habit=habit, date=today)
    new_state = not log.completed
    log.completed = new_state
    log.completed_at = timezone.now() if new_state else None
    log.save()

    for sub in habit.sub_items.all():
        sl, _ = RoutineSubItemLog.objects.get_or_create(sub_item=sub, date=today)
        sl.completed = new_state
        sl.completed_at = timezone.now() if new_state else None
        sl.save()

    # Recalculate streak after cascade toggle
    recalculate_streak(habit)

    return Response(HabitSerializer(habit, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def habit_log_numeric(request, pk):
    try:
        habit = Habit.objects.get(pk=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    raw = request.data.get('actual_value')
    if raw is None:
        return Response({'error': 'actual_value required'}, status=400)

    today = datetime.date.today()
    log, _ = HabitLog.objects.get_or_create(habit=habit, date=today)
    log.actual_value = int(raw)
    log.completed = bool(habit.target_value and log.actual_value >= habit.target_value)
    log.completed_at = timezone.now() if log.completed else None
    log.save()

    # Recalculate streak after numeric log
    recalculate_streak(habit)

    return Response(HabitSerializer(habit, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_subitem(request, pk):
    """Add a sub-item to a habit. Returns updated habit with all sub-items."""
    try:
        habit = Habit.objects.get(pk=pk, user=request.user)
    except Habit.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    name = request.data.get('name', '').strip()
    if not name:
        return Response({'error': 'Name required'}, status=400)

    RoutineSubItem.objects.create(
        routine=habit,
        name=name,
        order=habit.sub_items.count()
    )
    return Response(HabitSerializer(habit, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_habits_history(request):
    """
    Returns logs for ALL active habits in a date range.
    ?range=1w | 1m | 3m | all
    Also returns the first-ever log date so frontend knows where to start.
    Inactivity collapsing is handled on the frontend.
    """
    range_param = request.query_params.get('range', '3m')
    today = datetime.date.today()

    if range_param == '1w':
        start_date = today - datetime.timedelta(days=7)
    elif range_param == '1m':
        start_date = today - datetime.timedelta(days=30)
    elif range_param == '3m':
        start_date = today - datetime.timedelta(days=90)
    else:  # 'all'
        earliest = HabitLog.objects.filter(
            habit__user=request.user
        ).order_by('date').first()
        start_date = earliest.date if earliest else today - datetime.timedelta(days=90)

    habits = Habit.objects.filter(user=request.user, is_active=True)

    result = []
    for habit in habits:
        logs = HabitLog.objects.filter(
            habit=habit,
            date__gte=start_date,
            date__lte=today
        ).order_by('date')

        result.append({
            'habit_id': habit.id,
            'habit_name': habit.name,
            'habit_color': habit.color,
            'target_value': habit.target_value,
            'logs': [
                {
                    'date': str(l.date),
                    'completed': l.completed,
                    'actual_value': l.actual_value,
                }
                for l in logs
            ]
        })

    return Response({
        'start_date': str(start_date),
        'end_date': str(today),
        'habits': result,
    })

# ── Sub-items CRUD ─────────────────────────────────────────────────────────────
class SubItemListCreateView(generics.ListCreateAPIView):
    serializer_class = RoutineSubItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return sub-items for habits owned by this user
        return RoutineSubItem.objects.filter(
            routine__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save()


class SubItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RoutineSubItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoutineSubItem.objects.filter(routine__user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def subitem_toggle(request, pk):
    """Toggle a single sub-item complete/incomplete for today."""
    try:
        sub_item = RoutineSubItem.objects.get(pk=pk, routine__user=request.user)
    except RoutineSubItem.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    today = datetime.date.today()
    log, _ = RoutineSubItemLog.objects.get_or_create(sub_item=sub_item, date=today)
    log.completed = not log.completed
    log.completed_at = timezone.now() if log.completed else None
    log.save()

    return Response(RoutineSubItemSerializer(sub_item, context={'request': request}).data)


# ── Calendar Events CRUD ───────────────────────────────────────────────────────
class CalendarEventListCreateView(generics.ListCreateAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CalendarEvent.objects.filter(user=self.request.user)
        # Filter by date range so we only fetch what's visible on the calendar
        start = self.request.query_params.get('start')
        end   = self.request.query_params.get('end')
        if start: qs = qs.filter(date__gte=start)
        if end:   qs = qs.filter(date__lte=end)
        return qs.order_by('date', 'start_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CalendarEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CalendarEvent.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendar_day_view(request):
    """
    Returns everything for a single date:
    - All routines (habits) with their sub-items and today's completion
    - All calendar events on that date
    Groups them into morning / afternoon / evening / allday buckets.
    """
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'error': 'date param required'}, status=400)

    try:
        target_date = datetime.date.fromisoformat(date_str)
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=400)

    # Get all active routines for this user
    routines = Habit.objects.filter(user=request.user, is_active=True)

    # Get all calendar events on this date
    # Also include recurring events that started on or before this date
    events = CalendarEvent.objects.filter(user=request.user).filter(
        # Either on this exact date
        models.Q(date=target_date) |
        # Or daily recurrence that started before/on this date
        models.Q(recurrence='daily', date__lte=target_date) |
        # Or weekly recurrence on the same weekday
        models.Q(recurrence='weekly', date__week_day=target_date.isoweekday() % 7 + 1, date__lte=target_date) |
        # Or monthly recurrence on the same day of month
        models.Q(recurrence='monthly', date__day=target_date.day, date__lte=target_date)
    ).filter(
        # Respect recurrence_end if set
        models.Q(recurrence_end__isnull=True) | models.Q(recurrence_end__gte=target_date)
    )

    return Response({
        'date': date_str,
        'routines': HabitSerializer(routines, many=True, context={'request': request}).data,
        'events': CalendarEventSerializer(events, many=True).data,
    })


#learning

class LearningPathListCreateView(generics.ListCreateAPIView):
    serializer_class   = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LearningPathDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user)


class PathStepListCreateView(generics.ListCreateAPIView):
    serializer_class   = PathStepSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PathStep.objects.filter(path__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class PathStepDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PathStepSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PathStep.objects.filter(path__user=self.request.user)
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def path_bulk_steps(request, pk):
    """
    Accepts a list of step titles and creates them all at once.
    Body: { "steps": ["Chapter 1: Intro", "Chapter 2: Networking", ...] }
    """
    try:
        path = LearningPath.objects.get(pk=pk, user=request.user)
    except LearningPath.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    raw_steps = request.data.get('steps', [])
    if not raw_steps:
        return Response({'error': 'No steps provided'}, status=400)

    # Find the current highest order so new steps continue from there
    current_max = path.steps.aggregate(models.Max('order'))['order__max'] or -1

    created = []
    for i, title in enumerate(raw_steps):
        title = title.strip().lstrip('•-*123456789. ').strip()
        if not title:
            continue
        step = PathStep.objects.create(
            path=path,
            title=title,
            order=current_max + i + 1,
            status='todo'
        )
        created.append(step)

    # Return updated full path
    return Response(LearningPathSerializer(path, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_apple_notes(request):
    """
    Accepts a .zip file containing Apple Notes exported as Markdown (.md) or Text (.txt).
    """
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=400)

    import_folder, _ = Folder.objects.get_or_create(
        user=request.user,
        name='Apple Notes Import'
    )

    created = updated = skipped = 0

    try:
        zip_bytes = io.BytesIO(uploaded_file.read())
        with zipfile.ZipFile(zip_bytes, 'r') as zf:
            md_files = [f for f in zf.namelist() if f.endswith('.md') or f.endswith('.txt')]

            if not md_files:
                return Response({'error': 'No .md or .txt files found in the zip.'}, status=400)

            for filepath in md_files:
                with zf.open(filepath) as f:
                    # FIX: Add .replace('\x00', '') to strip illegal null bytes
                    body = f.read().decode('utf-8', errors='ignore').strip().replace('\x00', '')

                # Prevent empty notes from crashing the hash
                if not body:
                    body = " " 

                filename = filepath.split('/')[-1] 
                title = filename.replace('.md', '').replace('.txt', '')

                content_fingerprint = title + '||' + body
                content_hash = hashlib.md5(content_fingerprint.encode()).hexdigest()

                existing = Note.objects.filter(
                    user=request.user,
                    source_hash=content_hash,
                    source_type='apple'
                ).first()

                if existing:
                    skipped += 1
                    continue

                title_match = Note.objects.filter(
                    user=request.user,
                    title=title,
                    source_type='apple'
                ).first()

                if title_match:
                    title_match.body = body
                    title_match.source_hash = content_hash
                    title_match.save()
                    updated += 1
                else:
                    Note.objects.create(
                        user=request.user,
                        folder=import_folder,
                        title=title,
                        body=body,
                        source_hash=content_hash,
                        source_type='apple'
                    )
                    created += 1

    except zipfile.BadZipFile:
        return Response({'error': 'Invalid zip file.'}, status=400)
    except Exception as e:
        # Improved error message for debugging
        print(f"Import Error: {str(e)}") 
        return Response({'error': str(e)}, status=500)

    return Response({
        'created': created,
        'updated': updated,
        'skipped': skipped,
        'message': f'Done: {created} new, {updated} updated, {skipped} unchanged'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_google_keep(request):
    """
    Accepts Google Takeout ZIP for Keep notes.
    Google Keep exports as JSON files inside a Takeout/Keep/ folder.
    Each .json file is one note.
    """
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=400)

    import_folder, _ = Folder.objects.get_or_create(
        user=request.user,
        name='Google Keep Import'
    )

    created = updated = skipped = 0

    try:
        zip_bytes = io.BytesIO(uploaded_file.read())
        with zipfile.ZipFile(zip_bytes, 'r') as zf:
            # Google Takeout puts Keep notes in Takeout/Keep/*.json
            json_files = [f for f in zf.namelist()
                         if f.endswith('.json') and 'Keep' in f and not f.endswith('Labels.json')]

            for filename in json_files:
                with zf.open(filename) as f:
                    try:
                        data = json.load(f)
                    except json.JSONDecodeError:
                        continue

                # Google Keep JSON structure
                title = data.get('title', '').strip()
                text_content = data.get('textContent', '').strip()

                # Handle checklist notes (Google Keep list items)
                list_items = data.get('listContent', [])
                if list_items:
                    list_text = '\n'.join(
                        f"{'✓' if item.get('isChecked') else '•'} {item.get('text', '')}"
                        for item in list_items
                    )
                    body = (text_content + '\n\n' + list_text).strip() if text_content else list_text
                else:
                    body = text_content

                # Skip archived or trashed notes
                if data.get('isTrashed') or data.get('isArchived'):
                    skipped += 1
                    continue

                if not title and not body:
                    skipped += 1
                    continue

                # Extract labels as tags
                labels = data.get('labels', [])
                tags = ','.join(label.get('name', '') for label in labels)

                content_fingerprint = title + '||' + body
                content_hash = hashlib.md5(content_fingerprint.encode()).hexdigest()

                existing = Note.objects.filter(
                    user=request.user,
                    source_hash=content_hash,
                    source_type='google_keep'
                ).first()

                if existing:
                    skipped += 1
                    continue

                title_match = Note.objects.filter(
                    user=request.user,
                    title=title or 'Untitled',
                    source_type='google_keep'
                ).first()

                if title_match:
                    title_match.body = body
                    title_match.tags = tags
                    title_match.source_hash = content_hash
                    title_match.save()
                    updated += 1
                else:
                    Note.objects.create(
                        user=request.user,
                        folder=import_folder,
                        title=title or 'Untitled Keep Note',
                        body=body,
                        tags=tags,
                        source_hash=content_hash,
                        source_type='google_keep'
                    )
                    created += 1

    except zipfile.BadZipFile:
        return Response({'error': 'Invalid zip. Download your data from takeout.google.com'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

    return Response({
        'created': created,
        'updated': updated,
        'skipped': skipped,
        'message': f'Done: {created} new, {updated} updated, {skipped} skipped'
    })




@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_search(request):
    """
    Takes a query, embeds it, and finds the most mathematically similar notes.
    """
    query = request.query_params.get('q', '')
    if not query:
        return Response([])

    # 1. Convert the user's search term into a vector
    query_vector = get_embedding(query)
    
    if not query_vector:
        return Response({'error': 'AI Service unavailable'}, status=500)

    # 2. Use PostgreSQL pgvector to find the closest matches
    # CosineDistance measures the angle between vectors. Smaller distance = closer meaning.
    results = Note.objects.filter(user=request.user) \
        .exclude(embedding__isnull=True) \
        .annotate(distance=CosineDistance('embedding', query_vector)) \
        .order_by('distance')[:5]  # Only return the top 5 matches

    return Response(NoteSerializer(results, many=True).data)

#learning agent


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_learning_coach(request):
    query = request.data.get('query', 'What should I learn next?')
    advice = generate_learning_strategy(request.user, query)
    return Response({'advice': advice})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_extract_course(request):
    url = request.data.get('url', '')
    topic = request.data.get('topic', '')
    pasted_text = request.data.get('pasted_text', '') 
    
    if not url and not pasted_text:
        return Response({'error': 'Please provide a URL or paste the syllabus text.'}, status=400)
        
    syllabus = extract_course_syllabus(url, topic, pasted_text) 
    
    if not syllabus:
        return Response({'error': 'Could not extract chapters.'}, status=400)
        
    return Response({'chapters': syllabus})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_generate_schedule(request):
    """
    Step 1: Generate a study schedule from selected learning paths.
    Does NOT create calendar events yet — returns a plan for user approval.
    
    Body: {
      path_ids: [1, 2],
      start_date: "2026-05-07",
      hours_per_day: 1.5,
      skip_days: [5, 6],        # 0=Mon, 6=Sun — days to avoid
      preferred_time: "09:00",  # preferred session start time
    }
    """
    from .ai_utils import generate_schedule_plan

    path_ids       = request.data.get('path_ids', [])
    start_date_str = request.data.get('start_date', str(datetime.date.today()))
    hours_per_day  = float(request.data.get('hours_per_day', 1.5))
    skip_days      = request.data.get('skip_days', [5, 6])  # default: skip Sat/Sun
    preferred_time = request.data.get('preferred_time', '09:00')

    if not path_ids:
        return Response({'error': 'No paths selected'}, status=400)

    # Load selected paths with their pending steps
    paths = LearningPath.objects.filter(
        id__in=path_ids, user=request.user
    ).prefetch_related('steps')

    if not paths.exists():
        return Response({'error': 'Paths not found'}, status=404)

    plan = generate_schedule_plan(
        paths=paths,
        start_date=start_date_str,
        hours_per_day=hours_per_day,
        skip_days=skip_days,
        preferred_time=preferred_time,
    )

    return Response({'sessions': plan, 'generated': True})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_confirm_schedule(request):
    """
    Step 2: User approved the plan — create CalendarEvent records.
    
    Body: {
      sessions: [
        {
          title: "GCP Course — Chapter 1: Intro",
          date: "2026-05-07",
          start_time: "09:00",
          end_time: "10:30",
          path_id: 1,
          step_title: "Chapter 1: Intro",
          color: "purple"
        }, ...
      ]
    }
    """
    sessions = request.data.get('sessions', [])
    if not sessions:
        return Response({'error': 'No sessions to confirm'}, status=400)

    created = []
    for s in sessions:
        event = CalendarEvent.objects.create(
            user=request.user,
            title=s.get('title', 'Study Session'),
            event_type='learning_session',
            date=s['date'],
            start_time=s.get('start_time'),
            end_time=s.get('end_time'),
            notes=f"Course: {s.get('path_name', '')}\nChapter: {s.get('step_title', '')}",
            color=s.get('color', 'purple'),
            recurrence='none',
        )
        created.append(event.id)

    return Response({
        'created': len(created),
        'message': f'{len(created)} study sessions added to your calendar!'
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def semantic_search(request):
    query = request.query_params.get('q', '').strip()
    if not query:
        return Response({'notes': [], 'bookmarks': []})

    query_vector = get_query_embedding(query)
    note_results = []
    bookmark_results = []

    if query_vector:
        notes = Note.objects.filter(
            user=request.user, embedding__isnull=False
        ).annotate(
            distance=CosineDistance('embedding', query_vector)
        ).order_by('distance')[:5]
        note_results = NoteSerializer(notes, many=True).data

    # Keyword fallback for bookmarks
    from django.db.models import Q
    bookmarks = Bookmark.objects.filter(user=request.user).filter(
        Q(title__icontains=query) | Q(content__icontains=query) | Q(url__icontains=query)
    )[:5]
    bookmark_results = BookmarkSerializer(bookmarks, many=True).data

    return Response({
        'notes': note_results,
        'bookmarks': bookmark_results,
        'query': query,
        'semantic': query_vector is not None,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def summarize_note(request, pk):
    try:
        note = Note.objects.get(pk=pk, user=request.user)
    except Note.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    summary = generate_summary(note.body, note.title)
    return Response({'summary': summary})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_chat(request):
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'No message'}, status=400)

    query_vector = get_query_embedding(message)
    relevant_notes = []
    relevant_bookmarks = []

    if query_vector:
        relevant_notes = list(Note.objects.filter(
            user=request.user, embedding__isnull=False
        ).annotate(distance=CosineDistance('embedding', query_vector)
        ).order_by('distance')[:5])

    from django.db.models import Q
    relevant_bookmarks = list(Bookmark.objects.filter(user=request.user).filter(
        Q(title__icontains=message) | Q(content__icontains=message)
    )[:3])

    answer = rag_chat(message, relevant_notes, relevant_bookmarks)
    return Response({'answer': answer, 'message': message})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def agent_command(request):
    command = request.data.get('command', '').strip()
    if not command:
        return Response({'error': 'No command'}, status=400)

    bookmarks = list(Bookmark.objects.filter(
        user=request.user
    ).select_related('category'))
    parsed = agent_parse_command(command, bookmarks)

    if not parsed or not parsed.get('bookmark_id') or parsed.get('action') == 'none':
        return Response({'success': False, 'message': "Couldn't identify which bookmark to update."})

    try:
        bm = Bookmark.objects.get(pk=parsed['bookmark_id'], user=request.user)
        if parsed['action'] == 'update_progress':
            bm.progress = parsed['value']
            bm.save()
            return Response({'success': True, 'message': f'Updated "{bm.title or bm.url}" → "{parsed["value"]}"', 'bookmark': BookmarkSerializer(bm).data})
        elif parsed['action'] == 'mark_favorite':
            bm.is_favorite = True
            bm.save()
            return Response({'success': True, 'message': f'Marked "{bm.title or bm.url}" as favorite'})
    except Bookmark.DoesNotExist:
        return Response({'success': False, 'message': 'Bookmark not found'})

    return Response({'success': False, 'message': 'Unknown action'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stuck_steps(request):
    """
    Returns steps that have been 'in_progress' for 7+ days.
    """
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    stuck = PathStep.objects.filter(
        path__user=request.user,
        status='in_progress',
        updated_at__lte=seven_days_ago
    ).select_related('path').order_by('updated_at')
    
    return Response([
        {
            'id': step.id,
            'title': step.title,
            'path_name': step.path.name,
            'path_id': step.path.id,
            'updated_at': step.updated_at.isoformat(),
            'days_stuck': (timezone.now() - step.updated_at).days,
        }
        for step in stuck
    ])