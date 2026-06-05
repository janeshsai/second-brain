import hashlib
import io
import json
import zipfile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from ..models import Note, Folder


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_apple_notes(request):
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=400)

    import_folder, _ = Folder.objects.get_or_create(user=request.user, name='Apple Notes Import')
    created = updated = skipped = 0

    try:
        zip_bytes = io.BytesIO(uploaded_file.read())
        with zipfile.ZipFile(zip_bytes, 'r') as zf:
            md_files = [f for f in zf.namelist() if f.endswith('.md') or f.endswith('.txt')]

            if not md_files:
                return Response({'error': 'No .md or .txt files found in the zip.'}, status=400)

            for filepath in md_files:
                with zf.open(filepath) as f:
                    body = f.read().decode('utf-8', errors='ignore').strip().replace('\x00', '')

                if not body:
                    body = " "

                filename = filepath.split('/')[-1]
                title    = filename.replace('.md', '').replace('.txt', '')

                content_hash = hashlib.md5((title + '||' + body).encode()).hexdigest()

                existing = Note.objects.filter(
                    user=request.user, source_hash=content_hash, source_type='apple'
                ).first()
                if existing:
                    skipped += 1
                    continue

                title_match = Note.objects.filter(
                    user=request.user, title=title, source_type='apple'
                ).first()
                if title_match:
                    title_match.body        = body
                    title_match.source_hash = content_hash
                    title_match.save()
                    updated += 1
                else:
                    Note.objects.create(
                        user=request.user, folder=import_folder,
                        title=title, body=body,
                        source_hash=content_hash, source_type='apple'
                    )
                    created += 1

    except zipfile.BadZipFile:
        return Response({'error': 'Invalid zip file.'}, status=400)
    except Exception as e:
        print(f"Import Error: {e}")
        return Response({'error': str(e)}, status=500)

    return Response({
        'created': created, 'updated': updated, 'skipped': skipped,
        'message': f'Done: {created} new, {updated} updated, {skipped} unchanged'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_google_keep(request):
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=400)

    import_folder, _ = Folder.objects.get_or_create(user=request.user, name='Google Keep Import')
    created = updated = skipped = 0

    try:
        zip_bytes = io.BytesIO(uploaded_file.read())
        with zipfile.ZipFile(zip_bytes, 'r') as zf:
            json_files = [
                f for f in zf.namelist()
                if f.endswith('.json') and 'Keep' in f and not f.endswith('Labels.json')
            ]

            for filename in json_files:
                with zf.open(filename) as f:
                    try:
                        data = json.load(f)
                    except json.JSONDecodeError:
                        continue

                title        = data.get('title', '').strip()
                text_content = data.get('textContent', '').strip()
                list_items   = data.get('listContent', [])

                if list_items:
                    list_text = '\n'.join(
                        f"{'✓' if item.get('isChecked') else '•'} {item.get('text', '')}"
                        for item in list_items
                    )
                    body = (text_content + '\n\n' + list_text).strip() if text_content else list_text
                else:
                    body = text_content

                if data.get('isTrashed') or data.get('isArchived'):
                    skipped += 1
                    continue

                if not title and not body:
                    skipped += 1
                    continue

                tags         = ','.join(label.get('name', '') for label in data.get('labels', []))
                content_hash = hashlib.md5((title + '||' + body).encode()).hexdigest()

                existing = Note.objects.filter(
                    user=request.user, source_hash=content_hash, source_type='google_keep'
                ).first()
                if existing:
                    skipped += 1
                    continue

                title_match = Note.objects.filter(
                    user=request.user, title=title or 'Untitled', source_type='google_keep'
                ).first()
                if title_match:
                    title_match.body        = body
                    title_match.tags        = tags
                    title_match.source_hash = content_hash
                    title_match.save()
                    updated += 1
                else:
                    Note.objects.create(
                        user=request.user, folder=import_folder,
                        title=title or 'Untitled Keep Note', body=body, tags=tags,
                        source_hash=content_hash, source_type='google_keep'
                    )
                    created += 1

    except zipfile.BadZipFile:
        return Response({'error': 'Invalid zip. Download your data from takeout.google.com'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

    return Response({
        'created': created, 'updated': updated, 'skipped': skipped,
        'message': f'Done: {created} new, {updated} updated, {skipped} skipped'
    })
