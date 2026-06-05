import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

EMBED_MODEL = 'gemini-embedding-001'
CHAT_MODEL  = 'gemini-2.5-flash'

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
