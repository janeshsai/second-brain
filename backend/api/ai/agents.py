import json
from google.genai import types
from .config import client, CHAT_MODEL


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
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f'Agent parse error: {e}')
        return None


def generate_learning_strategy(user, query) -> str | None:
    from ..models import LearningPath, Skill, UserProfile

    paths   = LearningPath.objects.filter(user=user)
    skills  = Skill.objects.filter(user=user)
    profile = UserProfile.objects.filter(user=user).first()

    context = "USER CONTEXT:\n"
    if profile and profile.resume_text:
        context += f"Resume/Background: {profile.resume_text[:1000]}...\n"

    context += "\nCurrent Skills:\n"
    for s in skills:
        context += f"- {s.name}: {s.level}/100\n"

    context += "\nCurrent Learning Paths Progress:\n"
    for p in paths:
        done  = p.steps.filter(status='done').count()
        total = p.steps.count()
        context += f"- {p.name} ({done}/{total} steps done)\n"
        upcoming = p.steps.filter(status__in=['todo', 'in_progress'])[:3]
        for step in upcoming:
            context += f"  * Upcoming: {step.title}\n"

    prompt = f"""
    You are an expert tech learning coach. Review the user's context below.
    {context}

    User Request: "{query}"

    Provide a concise, highly strategic recommendation. Should they switch paths?
    What specific chapter should they tackle next to balance their skills?
    """

    try:
        response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
        return response.text
    except Exception as e:
        print(f'Coach error: {e}')
        return None


def extract_course_syllabus(url="", topic="", pasted_text="") -> list:
    if pasted_text:
        source_context = f"Here is the raw text of the course syllabus/page:\n\n{pasted_text}"
    else:
        source_context = f"Attempt to read the course at this URL: {url}"

    topic_hint = f"\nTopic hint from user: '{topic}'" if topic else ""

    prompt = f"""
    {source_context}{topic_hint}

    Extract the syllabus, table of contents, or learning modules from this information.
    You MUST return a JSON object with a single key "chapters".
    The value of "chapters" must be an array of objects.
    Each object must have exactly two keys: "title" (string) and "description" (string).
    """

    try:
        response = client.models.generate_content(
            model=CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(response.text)
        if isinstance(data, dict) and "chapters" in data:
            return data["chapters"]
        elif isinstance(data, list):
            return data
        return []
    except Exception as e:
        print(f'Extraction error: {e}')
        return []
