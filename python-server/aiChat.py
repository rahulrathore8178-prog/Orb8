# import requests
# import json

# # The model answers narrow, typed questions about the state. Your code owns the workflow.
# response = requests.post(
#   url="https://openrouter.ai/api/alpha/decisions",
#   headers={
#     "Authorization": "Bearer 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",
#     "Content-Type": "application/json",
#     "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
#     "X-OpenRouter-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
#   },
#   data=json.dumps({
#     "model": "~typesafe/jev-latest",
#     "state": "Help! My payouts have been failing for 3 days.",
#     "questions": {
#       "is_urgent": {
#         "type": "noul",
#         "instructions": "Does this message convey urgency?",
#         "criteria": {
#           "true": "Explicitly time-sensitive",
#           "false": "No urgency expressed"
#         }
#       },
#       "department": {
#         "type": "choice",
#         "instructions": "Which team should handle this?",
#         "criteria": {
#           "billing": "Payments, invoicing, refunds",
#           "technical": "Bugs, outages, integrations",
#           "sales": "Pricing, upgrades, new accounts"
#         }
#       },
#       "frustration": {
#         "type": "score",
#         "instructions": "How frustrated is the customer?",
#         "criteria": ["Calm", "Frustrated", "Very angry"]
#       }
#     }
#   })
# )

# answers = response.json()["answers"]
# print("response:", response.json())
# # noul is a probability from 0 (no) to 1 (yes); choice and score carry the full distribution.
# print(f"Urgency: {answers['is_urgent']['noul']}")
# print(f"Department: {answers['department']['choice']}, Probabilities: {answers['department']['probabilities']}")
# print(f"Frustration: {answers['frustration']['score']}")

# if answers["is_urgent"]["noul"] > 0.8 and answers["department"]["choice"] == "billing":
#   pass  # escalate_to_billing(...)

import traceback

from huggingface_hub import InferenceClient

# Put your repository name here. 
# Hugging Face routes this to their free serverless compute automatically.
client = InferenceClient(
    model="VivekMandal9650/igris-qwen3-8b-qlora", 
    token="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" 
)

try:
    response = client.text_generation("Hello, who are you?", max_new_tokens=50)
    print(response)
except Exception as e:
    print(type(e).__name__, repr(e))
    traceback.print_exc()
