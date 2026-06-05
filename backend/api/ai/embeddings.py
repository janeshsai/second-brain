from google.genai import types
from .config import client, EMBED_MODEL


def get_embedding(text: str) -> list | None:
    if not text or not text.strip():
        return None
    try:
        result = client.models.embed_content(
            model=EMBED_MODEL,
            contents=text[:8000],
            config=types.EmbedContentConfig(
                task_type='RETRIEVAL_DOCUMENT',
                output_dimensionality=768,
            )
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f'Embedding error: {e}')
        return None


def get_query_embedding(query: str) -> list | None:
    if not query or not query.strip():
        return None
    try:
        result = client.models.embed_content(
            model=EMBED_MODEL,
            contents=query[:1000],
            config=types.EmbedContentConfig(
                task_type='RETRIEVAL_QUERY',
                output_dimensionality=768,
            )
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f'Query embed error: {e}')
        return None
