import datetime
from django.db import models
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from ..models import LearningPath, PathStep, CalendarEvent
from ..serializers import LearningPathSerializer, PathStepSerializer
from ..ai import generate_learning_strategy, extract_course_syllabus, generate_schedule_plan


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
    try:
        path = LearningPath.objects.get(pk=pk, user=request.user)
    except LearningPath.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    raw_steps = request.data.get('steps', [])
    if not raw_steps:
        return Response({'error': 'No steps provided'}, status=400)

    current_max = path.steps.aggregate(models.Max('order'))['order__max'] or -1

    for i, title in enumerate(raw_steps):
        title = title.strip().lstrip('•-*123456789. ').strip()
        if not title:
            continue
        PathStep.objects.create(path=path, title=title, order=current_max + i + 1, status='todo')

    return Response(LearningPathSerializer(path, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_learning_coach(request):
    query  = request.data.get('query', 'What should I learn next?')
    advice = generate_learning_strategy(request.user, query)
    if advice is None:
        return Response({'error': 'AI service unavailable'}, status=503)
    return Response({'advice': advice})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_extract_course(request):
    url         = request.data.get('url', '')
    topic       = request.data.get('topic', '')
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
    path_ids       = request.data.get('path_ids', [])
    start_date_str = request.data.get('start_date', str(datetime.date.today()))
    hours_per_day  = float(request.data.get('hours_per_day', 1.5))
    skip_days      = request.data.get('skip_days', [5, 6])
    preferred_time = request.data.get('preferred_time', '09:00')

    if not path_ids:
        return Response({'error': 'No paths selected'}, status=400)

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

    return Response({'created': len(created), 'message': f'{len(created)} study sessions added to your calendar!'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stuck_steps(request):
    seven_days_ago = timezone.now() - timedelta(days=7)

    stuck = PathStep.objects.filter(
        path__user=request.user,
        status='in_progress',
        updated_at__lte=seven_days_ago
    ).select_related('path').order_by('updated_at')

    return Response([
        {
            'id':         step.id,
            'title':      step.title,
            'path_name':  step.path.name,
            'path_id':    step.path.id,
            'updated_at': step.updated_at.isoformat(),
            'days_stuck': (timezone.now() - step.updated_at).days,
        }
        for step in stuck
    ])
