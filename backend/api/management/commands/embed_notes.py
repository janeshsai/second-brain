from django.core.management.base import BaseCommand
from api.models import Note
from api.ai import get_embedding


class Command(BaseCommand):
    help = 'Generate Gemini embeddings for all notes missing them'

    def handle(self, *args, **options):
        notes = Note.objects.filter(embedding__isnull=True)
        total = notes.count()
        self.stdout.write(f'Found {total} notes without embeddings')

        for i, note in enumerate(notes):
            embedding = get_embedding(f"{note.title}\n{note.body}")
            if embedding:
                note.embedding = embedding
                note.save(update_fields=['embedding'])
                self.stdout.write(f'[{i+1}/{total}] ✓ {note.title[:50]}')
            else:
                self.stdout.write(f'[{i+1}/{total}] ✗ FAILED: {note.title[:50]}')

        self.stdout.write(self.style.SUCCESS('Done!'))