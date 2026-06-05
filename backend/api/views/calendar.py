import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.db import models
from ..models import CalendarEvent, Habit
from ..serializers import CalendarEventSerializer, HabitSerializer


class CalendarEventListCreateView(generics.ListCreateAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs    = CalendarEvent.objects.filter(user=self.request.user)
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
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'error': 'date param required'}, status=400)

    try:
        target_date = datetime.date.fromisoformat(date_str)
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=400)

    routines = Habit.objects.filter(user=request.user, is_active=True)

    events = CalendarEvent.objects.filter(user=request.user).filter(
        models.Q(date=target_date) |
        models.Q(recurrence='daily', date__lte=target_date) |
        models.Q(recurrence='weekly', date__week_day=target_date.isoweekday() % 7 + 1, date__lte=target_date) |
        models.Q(recurrence='monthly', date__day=target_date.day, date__lte=target_date)
    ).filter(
        models.Q(recurrence_end__isnull=True) | models.Q(recurrence_end__gte=target_date)
    )

    return Response({
        'date':     date_str,
        'routines': HabitSerializer(routines, many=True, context={'request': request}).data,
        'events':   CalendarEventSerializer(events, many=True).data,
    })
