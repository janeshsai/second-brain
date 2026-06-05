import json
from .config import client, CHAT_MODEL


def generate_schedule_plan(paths, start_date: str, hours_per_day: float,
                           skip_days: list, preferred_time: str) -> list:
    courses_ctx = ''
    for path in paths:
        pending = path.steps.filter(status__in=['todo', 'in_progress'])
        courses_ctx += f"\nCourse: {path.name} (color: {path.color or 'purple'})\n"
        for step in pending:
            est = step.estimated_hours or round(hours_per_day, 1)
            courses_ctx += f"  - {step.title} (~{est}h)\n"

    day_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        sessions = json.loads(text)
        return sessions if isinstance(sessions, list) else []
    except Exception as e:
        print(f'Schedule generation error: {e}')
        return []
