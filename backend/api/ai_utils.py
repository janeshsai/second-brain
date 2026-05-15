import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

EMBED_MODEL = 'gemini-embedding-001'

CHAT_MODEL  = 'gemini-2.5-flash'


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


def generate_summary(text: str, title: str = '') -> str:
    try:
        prompt = f"""Summarize this note in 3-5 bullet points. Be specific, not generic.

Title: {title}
Content: {text[:6000]}

Format: Start each bullet with •"""
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        return response.text
    except Exception as e:
        return f'Could not generate summary: {e}'


def rag_chat(question: str, context_notes: list, context_bookmarks: list) -> str:
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
        return f'AI error: {e}'


def agent_parse_command(command: str, bookmarks: list) -> dict | None:
    try:
        bm_list = '\n'.join(
            f"ID:{bm.id} | Title:{bm.title or 'untitled'} | URL:{bm.url or ''} | Progress:{bm.progress or 'none'} | Category:{bm.category.name if bm.category else 'none'}"
            for bm in bookmarks[:50]
        )
        prompt = f"""Parse this bookmark command and return ONLY JSON, no explanation.

Bookmarks:
{bm_list}

Command: "{command}"

Return JSON:
{{"bookmark_id": <number or null>, "action": "update_progress" | "mark_favorite" | "update_title" | "none", "value": "<new value>", "confidence": "high" | "medium" | "low"}}"""
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        text = response.text.strip().replace('```json','').replace('```','').strip()
        return json.loads(text)
    except Exception as e:
        print(f'Agent parse error: {e}')
        return None


def generate_schedule_plan(paths, start_date: str, hours_per_day: float,
                           skip_days: list, preferred_time: str) -> list:
    courses_ctx = ''
    for path in paths:
        pending = path.steps.filter(status__in=['todo', 'in_progress'])
        courses_ctx += f"\nCourse: {path.name} (color: {path.color or 'purple'})\n"
        for step in pending:
            est = step.estimated_hours or round(hours_per_day, 1)
            courses_ctx += f"  - {step.title} (~{est}h)\n"

    day_labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    skip_str = ', '.join(day_labels[d] for d in skip_days if 0 <= d <= 6)

    prompt = f"""You are a study planner. Create a realistic day-by-day schedule.

COURSES:
{courses_ctx}

RULES:
- Start date: {start_date}
- Max hours/day: {hours_per_day}
- Skip days: {skip_str or 'None'}
- Start time: {preferred_time}
- Spread chapters, do not cram all on day 1
- Alternate courses if multiple selected

Return ONLY a JSON array with these exact keys per item:
{{"date":"YYYY-MM-DD","start_time":"HH:MM","end_time":"HH:MM","path_name":"name","step_title":"chapter","title":"Course — Chapter","color":"purple","estimated_hours":1.5}}
ONLY the JSON array. No markdown, no explanation."""

    try:
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        text = response.text.strip().replace('```json','').replace('```','').strip()
        sessions = json.loads(text)
        return sessions if isinstance(sessions, list) else []
    except Exception as e:
        print(f'Schedule generation error: {e}')
        return []