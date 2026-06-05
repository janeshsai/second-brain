from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from pgvector.django import CosineDistance
from ..models import Note, Bookmark
from ..serializers import NoteSerializer, BookmarkSerializer
from ..ai import get_query_embedding, rag_chat


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def semantic_search(request):
    query = request.query_params.get('q', '').strip()
    if not query:
        return Response({'notes': [], 'bookmarks': []})

    query_vector = get_query_embedding(query)
    note_results = []

    if query_vector:
        notes = Note.objects.filter(
            user=request.user, embedding__isnull=False
        ).annotate(
            distance=CosineDistance('embedding', query_vector)
        ).order_by('distance')[:5]
        note_results = NoteSerializer(notes, many=True).data

    bookmarks = Bookmark.objects.filter(user=request.user).filter(
        Q(title__icontains=query) | Q(content__icontains=query) | Q(url__icontains=query)
    )[:5]
    bookmark_results = BookmarkSerializer(bookmarks, many=True).data

    return Response({
        'notes':     note_results,
        'bookmarks': bookmark_results,
        'query':     query,
        'semantic':  query_vector is not None,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_chat(request):
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'No message'}, status=400)

    query_vector = get_query_embedding(message)
    relevant_notes = []

    if query_vector:
        relevant_notes = list(Note.objects.filter(
            user=request.user, embedding__isnull=False
        ).annotate(
            distance=CosineDistance('embedding', query_vector)
        ).order_by('distance')[:5])

    relevant_bookmarks = list(Bookmark.objects.filter(user=request.user).filter(
        Q(title__icontains=message) | Q(content__icontains=message)
    )[:3])

    answer = rag_chat(message, relevant_notes, relevant_bookmarks)
    if answer is None:
        return Response({'error': 'AI service unavailable'}, status=503)
    return Response({'answer': answer, 'message': message})
