import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
