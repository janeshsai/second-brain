from .config import client, CHAT_MODEL


def generate_summary(text: str, title: str = '') -> str | None:
    try:
        prompt = f"""Summarize this note in 3-5 bullet points. Be specific, not generic.

Title: {title}
Content: {text[:6000]}

Format: Start each bullet with •"""
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        return response.text
    except Exception as e:
        print(f'Summary error: {e}')
        return None


def rag_chat(question: str, context_notes: list, context_bookmarks: list) -> str | None:
    try:
        notes_ctx = ''
        for i, note in enumerate(context_notes[:5]):
            notes_ctx += f"\n[Note {i+1}: {note.title}]\n{note.body[:800]}\n"

        bm_ctx = ''
        for i, bm in enumerate(context_bookmarks[:3]):
            bm_ctx += f"\n[Bookmark {i+1}: {bm.title or bm.url}]\n"
            if bm.content:  bm_ctx += f"Notes: {bm.content[:400]}\n"
            if bm.progress: bm_ctx += f"Progress: {bm.progress}\n"
            if bm.url:      bm_ctx += f"URL: {bm.url}\n"

        prompt = f"""You are a personal assistant with access to the user's Second Brain.
Answer using ONLY the context below. Cite which note or bookmark you used.
If not found, say "I couldn't find that in your notes."

NOTES:
{notes_ctx or 'None found.'}

BOOKMARKS:
{bm_ctx or 'None found.'}

QUESTION: {question}

Answer:"""
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        return response.text
    except Exception as e:
        print(f'RAG chat error: {e}')
        return None
