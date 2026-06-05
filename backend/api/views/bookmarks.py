from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.utils import timezone
from ..models import Bookmark, BookmarkFolder, Category
from ..serializers import BookmarkSerializer, BookmarkFolderSerializer, CategorySerializer
from ..ai import agent_parse_command

URL_TAG_RULES = {
    'youtube.com': 'Video',    'youtu.be': 'Video',
    'vimeo.com': 'Video',
    'mangadex.org': 'Manga',   'mangaplus.shueisha': 'Manga',
    'tcbscans.': 'Manga',      'webtoons.com': 'Manga',
    'coursera.org': 'Course',  'udemy.com': 'Course',
    'edx.org': 'Course',       'freecodecamp.org': 'Course',
    'pluralsight.com': 'Course', 'linkedin.com/learning': 'Course',
    'arxiv.org': 'Research',   'scholar.google': 'Research',
    'medium.com': 'Article',   'dev.to': 'Article',
    'substack.com': 'Article', 'blog.': 'Article',
    'github.com': 'Tool',      'npmjs.com': 'Tool',
    'pypi.org': 'Tool',        'hub.docker.com': 'Tool',
    'netflix.com': 'Video',    'twitch.tv': 'Video',
}


def auto_detect_category(url: str, user):
    if not url:
        return None
    url_lower = url.lower()
    for pattern, cat_name in URL_TAG_RULES.items():
        if pattern in url_lower:
            cat, _ = Category.objects.get_or_create(user=user, name=cat_name)
            return cat
    return None


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
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
        if folder_id:             qs = qs.filter(folder_id=folder_id)
        if category_id:           qs = qs.filter(category_id=category_id)
        if favorites == 'true':   qs = qs.filter(is_favorite=True)
        if search:
            qs = qs.filter(title__icontains=search) | \
                 qs.filter(content__icontains=search) | \
                 qs.filter(url__icontains=search)
        return qs

    def perform_create(self, serializer):
        url      = self.request.data.get('url', '')
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
