import vertexai
from vertexai.preview.generative_models import GenerativeModel
from typing import Dict, Any
from app.core.config import settings

vertexai.init(project=settings.VERTEX_PROJECT_ID, location=settings.VERTEX_LOCATION)

class AIService:
    """
    Centralized Gemini service for MyHealthSense.
    This class will be reused by:
    - Weekly AI insights
    - Health chatbot
    """

    def __init__(self):
        self.model = GenerativeModel(settings.VERTEX_MODEL_NAME)

    def generate_weekly_health_insights(
        self,
        signals: Dict[str, Any],
        observations: list[str],
        risk_level: str
    ) -> Dict[str, Any]:
        """
        Generate AI-powered weekly health insights
        using rule-based signals as grounding.
        """

        prompt = f"""
You are a supportive wellness assistant.

IMPORTANT RULES:
- You are NOT a doctor.
- Do NOT diagnose diseases.
- Do NOT suggest medicines or treatments.
- Give only general wellness insights.
- Be calm, empathetic, and non-alarming.

User health context:
- Risk level: {risk_level}

Health signals (numeric summaries):
{signals}

Rule-based observations:
{observations}

TASK:
1. Summarize the user's week in 2–3 sentences.
2. Identify key contributing patterns.
3. Provide gentle, general wellness suggestions.

Return your response in STRICT JSON with this format:

{{
  "summary": "...",
  "key_patterns": ["...", "..."],
  "suggestions": ["...", "..."]
}}
"""

        response = self.model.generate_content(prompt)

        # Gemini returns text; frontend / router will parse JSON safely
        return {
            "raw_response": response.text
        }


    def chat_about_health(
        self,
        user_message: str,
        context: str,
        memory: str
    ) -> str:
        prompt = f"""
You are a practical AI health assistant named Amigo.

STRICT BEHAVIOR RULES:
- If the user greets (e.g., "hi", "hello", "hey"), respond with a short greeting ONLY.
- Do NOT give health tips unless the user explicitly asks for advice.
- Answer the user's question directly and only what is asked.
- Be concise, clear, and practical.
- Do NOT over-empatize.
- Do NOT ask follow-up questions unless absolutely required.
- Do NOT diagnose or suggest medicines.
- You are not a doctor.

WHEN giving advice:
- Provide 3–5 actionable points
- Use plain, everyday language
- Avoid motivational or fluffy language
- No disclaimers unless medically necessary

Conversation memory (for continuity, do not repeat):
{memory}

User health context (use ONLY if relevant to the question):
{context}

User message:
"{user_message}"

Response rules:
- If greeting → short friendly reply (1 sentence)
- If question → structured, point-to-point answer
- No unnecessary explanations
"""



        response = self.model.generate_content(prompt)
        return response.text
