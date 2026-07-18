import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists
load_dotenv()

class Config:
    """
    Centralized configuration for the RAG Pipeline.
    Loads values from environment variables or falls back to defaults.
    """
    # Base directory of the project (assuming this file is in src/)
    BASE_DIR = Path(__file__).resolve().parent.parent
    
    # Data directory where source documents are placed
    DATA_DIR = Path(os.getenv("RAG_DATA_DIR", BASE_DIR / "data"))
    
    # Supported file extensions for document ingestion
    SUPPORTED_EXTENSIONS = {
        ".pdf",
        ".docx",
        ".txt",
        ".md"
    }

    # --- LLM Configuration ---
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "60"))

    # --- Retrieval Configuration ---
    DEFAULT_TOP_K = int(os.getenv("RAG_TOP_K", "5"))

    # --- Server API Configuration ---
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))

# Global configuration instance
config = Config()

