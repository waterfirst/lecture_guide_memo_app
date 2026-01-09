import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

try:
    print("Starting list...")
    models = genai.list_models()
    for m in models:
        print(f"DEBUG: {m.name}")
except Exception as e:
    print(f"Error: {e}")
