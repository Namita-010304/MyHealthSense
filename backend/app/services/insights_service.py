from typing import Dict, List

def generate_rule_based_insights(summary: Dict) -> Dict:
    insights: List[str] = []
    risk_points = 0

    diets = summary.get("diet_entries", [])
    symptoms = summary.get("symptoms", [])
    medications = summary.get("medications", [])
    lifestyle = summary.get("lifestyle", [])

    signals = {}

    # Check if user has any data at all
    has_any_data = len(diets) > 0 or len(symptoms) > 0 or len(medications) > 0 or len(lifestyle) > 0

    # ---- Lifestyle signals ----
    signals["low_sleep_days"] = sum(
        1 for l in lifestyle
        if l.sleep_hours is not None and l.sleep_hours < 6
    )
    if signals["low_sleep_days"] >= 3:
        insights.append(
            f"You slept less than 6 hours on {signals['low_sleep_days']} days."
        )
        risk_points += 2

    signals["high_stress_days"] = sum(
        1 for l in lifestyle
        if l.stress_level is not None and l.stress_level >= 4
    )
    if signals["high_stress_days"] >= 3:
        insights.append(
            f"High stress levels were recorded on {signals['high_stress_days']} days."
        )
        risk_points += 2

    signals["no_exercise_days"] = sum(
        1 for l in lifestyle
        if l.exercise_minutes is None or l.exercise_minutes == 0
    )
    if signals["no_exercise_days"] >= 4:
        insights.append(
            "You had little to no exercise on most days this week."
        )
        risk_points += 1

    # ---- Medication signals ----
    signals["medication_entries"] = len(medications)
    if signals["medication_entries"] == 0 and has_any_data:
        insights.append(
            "No medication records were logged this week."
        )
        risk_points += 2

    # ---- Diet signals ----
    signals["high_calorie_meals"] = sum(
        1 for d in diets
        if d.calories is not None and d.calories > 700
    )
    if signals["high_calorie_meals"] >= 4:
        insights.append(
            f"You logged {signals['high_calorie_meals']} high-calorie meals."
        )
        risk_points += 1

    # ---- Symptom signals ----
    signals["symptom_count"] = len(symptoms)
    if signals["symptom_count"] >= 4:
        insights.append(
            f"You reported symptoms {signals['symptom_count']} times this week."
        )
        risk_points += 2

    # ---- Risk level ----
    if risk_points <= 2:
        risk_level = "low"
    elif risk_points <= 5:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "signals": signals,
        "insights": insights,
        "risk_level": risk_level,
        "risk_points": risk_points,
        "confidence": "rule-based"
    }
