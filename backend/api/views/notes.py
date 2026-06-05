from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from pgvector.django import CosineDistance
from ..models import Note, Folder
from ..serializers import NoteSerializer, FolderSerializer
from ..ai import get_embedding, get_query_embedding, generate_summary


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
        title  = self.request.data.get('title', '')
        body   = self.request.data.get('body', '')
        vector = get_embedding(f"{title}\n{body}")
        serializer.save(user=self.request.user, embedding=vector)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        title  = self.request.data.get('title', '')
        body   = self.request.data.get('body', '')
        vector = get_embedding(f"{title}\n{body}")
        serializer.save(embedding=vector)

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_search(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])

    query_vector = get_embedding(query)
    if not query_vector:
        return Response({'error': 'AI service unavailable'}, status=503)

    results = Note.objects.filter(user=request.user) \
        .exclude(embedding__isnull=True) \
        .annotate(distance=CosineDistance('embedding', query_vector)) \
        .order_by('distance')[:5]

    return Response(NoteSerializer(results, many=True).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def summarize_note(request, pk):
    try:
        note = Note.objects.get(pk=pk, user=request.user)
    except Note.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    summary = generate_summary(note.body, note.title)
    if summary is None:
        return Response({'error': 'AI service unavailable'}, status=503)
    return Response({'summary': summary})
