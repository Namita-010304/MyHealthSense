from pydantic import BaseModel
from typing import List

class AIWeeklyInsights(BaseModel):
    summary: str
    key_patterns: List[str]
    suggestions: List[str]
