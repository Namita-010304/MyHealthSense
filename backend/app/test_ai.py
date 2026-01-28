from services.ai_service import AIService
ai = AIService()

result = ai.generate_weekly_health_insights(
    signals={"low_sleep_days": 4, "high_stress_days": 3},
    observations=[
        "Sleep was below recommended levels on multiple days.",
        "Stress levels were elevated during the week."
    ],
    risk_level="medium"
)

print(result["raw_response"])
