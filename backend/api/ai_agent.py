import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .models import LearningPath, Skill, UserProfile

load_dotenv()

# We use Gemini 1.5 Flash for agent reasoning (it's fast and handles large context)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_learning_strategy(user, query):
    """
    Acts as the Learning Coach. Analyzes skills, resume, and current paths.
    """
    # 1. Gather all the user's data to send to the AI
    paths = LearningPath.objects.filter(user=user)
    skills = Skill.objects.filter(user=user)
    profile = UserProfile.objects.filter(user=user).first()
    
    # 2. Build the context string
    context = "USER CONTEXT:\n"
    if profile and profile.resume_text:
        context += f"Resume/Background: {profile.resume_text[:1000]}...\n"
        
    context += "\nCurrent Skills:\n"
    for s in skills:
        context += f"- {s.name}: {s.level}/100\n"
        
    context += "\nCurrent Learning Paths Progress:\n"
    for p in paths:
        done = p.steps.filter(status='done').count()
        total = p.steps.count()
        context += f"- {p.name} ({done}/{total} steps done)\n"
        # List the next 3 uncompleted steps
        upcoming = p.steps.filter(status__in=['todo', 'in_progress'])[:3]
        for step in upcoming:
            context += f"  * Upcoming: {step.title}\n"
            
    # 3. Create the prompt instruction
    prompt = f"""
    You are an expert tech learning coach. Review the user's context below.
    {context}
    
    User Request: "{query}"
    
    Provide a concise, highly strategic recommendation. Should they switch paths? 
    What specific chapter should they tackle next to balance their skills?
    """
    
    # 4. Call Gemini
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Coach error: {e}")
        return "Sorry, I am having trouble thinking right now. Try again!"

def extract_course_syllabus(url="", topic="", pasted_text=""):
    """
    Generates a JSON array of chapters from either a URL or pasted text.
    """
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
            model='gemini-2.5-flash',
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
        print(f"Extraction error: {e}")
        return []



def generate_schedule_plan(paths, start_date: str, hours_per_day: float,
                            skip_days: list, preferred_time: str) -> list:
    """
    Calls Gemini to generate a day-by-day study schedule.
    Returns a list of session objects.
    """
    import json as _json

    # Build course context for Gemini
    courses_ctx = ''
    for path in paths:
        pending = path.steps.filter(status__in=['todo', 'in_progress'])
        color = path.color or 'purple'
        courses_ctx += f"\nCourse: {path.name} (color: {color})\n"
        for step in pending:
            est = step.estimated_hours or round(hours_per_day, 1)
            courses_ctx += f"  - {step.title} (~{est}h)\n"

    skip_labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    skip_str = ', '.join(skip_labels[d] for d in skip_days if 0 <= d <= 6)

    prompt = f"""You are a study planner. Create a realistic day-by-day schedule for these courses.

COURSES AND CHAPTERS:
{courses_ctx}

CONSTRAINTS:
- Start date: {start_date}
- Max hours per study day: {hours_per_day}
- Skip these days (no study): {skip_str or 'None'}
- Preferred start time: {preferred_time}
- Do NOT schedule more than {hours_per_day} hours on any single day
- Spread chapters across days logically — don't cram everything on day 1
- Alternate between courses if multiple are selected, to avoid burnout

Return ONLY a JSON array. Each item must have exactly these keys:
{{
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "path_name": "course name",
  "step_title": "chapter name",
  "title": "CourseName — ChapterName",
  "color": "purple",
  "estimated_hours": 1.5
}}
No explanation, no markdown, ONLY the JSON array."""

    try:
        model = genai.GenerativeModel(CHAT_MODEL)
        response = model.generate_content(prompt)
        text = response.text.strip().replace('```json','').replace('```','').strip()
        sessions = _json.loads(text)
        if isinstance(sessions, list):
            return sessions
        return []
    except Exception as e:
        print(f'Schedule generation error: {e}')
        return []