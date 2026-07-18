import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Google Gemini API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# In testing environments there may be no .env file.
# We warn instead of crashing so tests can still run with mocked calls.
if not GOOGLE_API_KEY:
    import warnings
    warnings.warn(
        "GOOGLE_API_KEY is not set. "
        "The app will not be able to make real LLM calls. "
        "Add it to your .env file before running the server.",
        stacklevel=2
    )
else:
    # Set it in the environment for LangChain to pick up automatically
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
