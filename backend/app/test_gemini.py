import vertexai
from vertexai.preview.generative_models import GenerativeModel

PROJECT_ID = "gothic-client-477206-h9"
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

model = GenerativeModel("gemini-2.5-flash-lite")

response = model.generate_content(
    "Hi Gemini, say hello poetically."
)

print(response.text)
