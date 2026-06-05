import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.utils import timezone
from ..models import Habit, HabitLog, RoutineSubItem, RoutineSubItemLog
from ..serializers import (
    HabitSerializer, HabitLogSerializer,
    RoutineSubItemSerializer, RoutineSubItemLogSerializer,
)


def recalculate_streak(habit):
    from datetime import timedelta
    today = datetime.date.today()

    completed_dates = set(
        HabitLog.objects.filter(habit=habit, completed=True)
        .values_list('date', flat=True)
    )

    streak = 0
    check  = today

    while True:
        if habit.frequency == 'weekly' and habit.weekdays:
            selected = [int(d) for d in habit.weekdays.split(',') if d.strip().isdigit()]
            if check.weekday() not in selected:
                check -= timedelta(days=1)
                continue

        if check in completed_dates:
            streak += 1
            check -= timedelta(days=1)
        else:
            break

    habit.streak_count = streak
    habit.save(update_fields=['streak_count'])
    return streak


class HabitListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(
            user=self.request.user, is_active=True
        ).order_by('order', 'created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
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

    log.completed  = not log.completed
    log.completed_at = timezone.now() if log.completed else None

    if actual_value is not None and log.completed:
        try:
            log.actual_value = int(actual_value)
            if habit.target_value and log.actual_value >= habit.target_value:
                log.completed = True
        except (ValueError, TypeError):
            pass

    log.save()
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
    new_state        = not log.completed
    log.completed    = new_state
    log.completed_at = timezone.now() if new_state else None
    log.save()

    for sub in habit.sub_items.all():
        sl, _ = RoutineSubItemLog.objects.get_or_create(sub_item=sub, date=today)
        sl.completed    = new_state
        sl.completed_at = timezone.now() if new_state else None
        sl.save()

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
    log.completed    = bool(habit.target_value and log.actual_value >= habit.target_value)
    log.completed_at = timezone.now() if log.completed else None
    log.save()

    recalculate_streak(habit)
    return Response(HabitSerializer(habit, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_subitem(request, pk):
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
    range_param = request.query_params.get('range', '3m')
    today       = datetime.date.today()

    if range_param == '1w':
        start_date = today - datetime.timedelta(days=7)
    elif range_param == '1m':
        start_date = today - datetime.timedelta(days=30)
    elif range_param == '3m':
        start_date = today - datetime.timedelta(days=90)
    else:
        earliest   = HabitLog.objects.filter(habit__user=request.user).order_by('date').first()
        start_date = earliest.date if earliest else today - datetime.timedelta(days=90)

    habits = Habit.objects.filter(user=request.user, is_active=True)
    result = []
    for habit in habits:
        logs = HabitLog.objects.filter(
            habit=habit, date__gte=start_date, date__lte=today
        ).order_by('date')
        result.append({
            'habit_id':    habit.id,
            'habit_name':  habit.name,
            'habit_color': habit.color,
            'target_value': habit.target_value,
            'logs': [
                {'date': str(l.date), 'completed': l.completed, 'actual_value': l.actual_value}
                for l in logs
            ]
        })

    return Response({'start_date': str(start_date), 'end_date': str(today), 'habits': result})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def habit_reorder(request):
    orders = request.data.get('orders', [])
    if not orders:
        return Response({'error': 'No orders provided'}, status=400)

    for item in orders:
        update_fields = {'order': item['order']}
        if 'time_of_day' in item:
            update_fields['time_of_day'] = item['time_of_day']
        Habit.objects.filter(id=item['id'], user=request.user).update(**update_fields)

    return Response({'success': True})


class SubItemListCreateView(generics.ListCreateAPIView):
    serializer_class = RoutineSubItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoutineSubItem.objects.filter(routine__user=self.request.user)

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
    try:
        sub_item = RoutineSubItem.objects.get(pk=pk, routine__user=request.user)
    except RoutineSubItem.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    today = datetime.date.today()
    log, _ = RoutineSubItemLog.objects.get_or_create(sub_item=sub_item, date=today)
    log.completed    = not log.completed
    log.completed_at = timezone.now() if log.completed else None
    log.save()

    return Response(RoutineSubItemSerializer(sub_item, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def promote_subitem(request, pk):
    try:
        sub = RoutineSubItem.objects.get(pk=pk, routine__user=request.user)
    except RoutineSubItem.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    habit = Habit.objects.create(
        user=request.user,
        name=sub.name,
        frequency=sub.routine.frequency,
        color=sub.routine.color,
        time_of_day=sub.routine.time_of_day,
        target_value=sub.routine.target_value,
        weekdays=sub.routine.weekdays,
        order=Habit.objects.filter(user=request.user).count(),
    )
    sub.delete()
    return Response(HabitSerializer(habit, context={'request': request}).data)
