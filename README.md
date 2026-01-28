🩺 EMBRACE – Your safe space for health

💡 Concept:
An all-in-one health tracking app that lets users record their symptoms, diet, lifestyle, and medications, and uses AI to find health patterns and give personalized suggestions.

🌿 Key Features:-

👤 User Login & Profile – secure signup, stores basic health details

🩺 Symptom Tracker – log daily symptoms, AI finds patterns & triggers

🍎 Diet Tracker – record meals, AI gives nutrition feedback

🧘 Lifestyle Tracker – track sleep, exercise, stress, hydration

💊 Medication Tracker – manage medicines, detect missed doses or side effects

🤖 AI Insights – combines all data to give weekly health summaries, risk levels & wellness tips

📊 Dashboard – view charts, progress, and AI-generated reports


#detailed explanation:- 

It is a **user-centric health tracking and AI-assisted insights platform** built with **FastAPI** and **Google Gemini (Vertex AI)**.
It enables users to log daily health data and receive **weekly health insights** through a **hybrid rule-based + GenAI system**.

The backend is designed with **safety, explainability, and user data isolation** as first-class principles.

## ✨ Key Highlights

* 🔐 JWT-based authentication
* 👤 Strict user-scoped data access
* 🩺 Multiple health trackers
* 📊 Weekly aggregation engine
* 🧠 Rule-based health intelligence
* 🤖 GenAI insights using Gemini (Vertex AI)
* 🛡️ Safe AI output validation
* 💬 Context-grounded health chatbot

## 🧠 System Design Philosophy

```
User Data
   ↓
Weekly Aggregation
   ↓
Rule-Based Analysis (deterministic truth)
   ↓
GenAI Explanation Layer (Gemini)
   ↓
Validated & Safe Output
```

* **Rules decide facts**
* **AI only explains patterns**
* Prevents hallucinations
* Suitable for health-related use cases

## 🏗️ Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Backend API | FastAPI (Python)                 |
| Database    | PostgreSQL (Async SQLAlchemy)    |
| Auth        | JWT (OAuth2 Password Flow)       |
| AI Model    | Gemini via Google Vertex AI      |
| Validation  | Pydantic v2                      |
| AI Safety   | Rule grounding + JSON validation |

## 🔐 Authentication

* JWT-based login
* All protected routes require authentication
* `get_current_user` dependency ensures:

  * user isolation
  * no cross-user data access

## 🩺 Health Trackers (CRUD)

All trackers are **user-dependent** and support full CRUD operations.

### 1️⃣ Symptom Tracker

* Daily symptom logging
* Used for weekly symptom frequency analysis

### 2️⃣ Diet Tracker

* Meal type
* Food items
* Calories
* Notes
* Used to detect high-calorie patterns

### 3️⃣ Medication Tracker

* Medication name
* Dosage & timing
* Used to detect missing or inconsistent logs

### 4️⃣ Lifestyle Tracker

* Sleep hours
* Exercise minutes
* Stress level
* Hydration
* Primary input for fatigue & stress analysis

Each tracker:

* Has a SQLAlchemy model
* Pydantic schemas
* FastAPI router
* `user_id` foreign key

## 📊 Weekly Aggregation Layer

### `weekly_summary`

* Aggregates **last 7 days** of:

  * symptoms
  * diet
  * medication
  * lifestyle
* Acts as the **single source of truth** for insights

This layer feeds both:

* rule-based logic
* AI explanations

## 📐 Rule-Based Insights Engine

### Purpose

* Convert weekly data into **health signals**
* Assign a **risk level**
* Provide explainable observations

### Signals Generated

* Low sleep days
* High stress days
* No exercise days
* High-calorie meals
* Symptom frequency
* Medication logging gaps

### Output

```json
{
  "signals": {...},
  "observations": [...],
  "risk_level": "low | medium | high",
  "risk_points": number,
  "confidence": "rule-based"
}
```

### Endpoint

```
GET /insights/weekly
```

---

## 🤖 GenAI Integration (Gemini)

* Integrated using **Google Vertex AI**
* Model: `gemini-2.5-flash-lite`
* Authentication via **Application Default Credentials**
* No API keys stored or used

### AI Service Layer

```
app/services/ai_service.py
```

Responsibilities:

* Centralize Gemini usage
* Enforce safety prompts
* Reusable across endpoints

## 🧠 AI Weekly Insights

### Endpoint

```
GET /ai/weekly-summary
```

### Flow

1. Weekly aggregation
2. Rule-based analysis
3. AI explanation using Gemini
4. Safe JSON parsing
5. Structured response

### Example Response

```json
{
  "signals": {...},
  "risk_level": "low",
  "risk_points": 0,
  "ai_insights": {
    "summary": "...",
    "key_patterns": [...],
    "suggestions": [...]
  },
  "ai_fallback": false
}
```

## 🛡️ AI Safety & Validation

* AI responses are expected in **strict JSON**
* Output is:

  * extracted
  * parsed
  * validated using Pydantic
* If parsing fails:

  * API does not crash
  * AI fallback is triggered

This prevents malformed or unsafe AI output.

## 💬 AI Health Chatbot

### Endpoint

```
POST /ai/chat
```

### Characteristics

* User-scoped
* Context-grounded
* No diagnosis
* No medical advice
* Calm, empathetic tone

### Context Provided to AI

* User’s weekly signals
* Risk level
* Observations

### Example Query

```json
{
  "message": "Why do I feel tired lately?"
}
```

