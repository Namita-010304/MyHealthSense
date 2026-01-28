import json
from typing import Optional
from app.schemas.ai_insights_schema import AIWeeklyInsights

def parse_ai_json(raw_text: str) -> Optional[AIWeeklyInsights]:
    """
    Safely parse Gemini JSON output.
    Returns None if parsing fails.
    """
    try:
        # Try extracting JSON block
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1

        if start == -1 or end == -1:
            return None

        json_str = raw_text[start:end]
        data = json.loads(json_str)

        return AIWeeklyInsights(**data)

    except Exception:
        return None
