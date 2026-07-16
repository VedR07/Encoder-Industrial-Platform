import time
from typing import Optional

from google import genai
from google.genai import types

from src.config import config
from src.prompt_builder import SYSTEM_INSTRUCTION
from src.utils import setup_logger

logger = setup_logger(__name__)


class LLMError(Exception):
    """Custom exception for LLM-related failures."""
    pass


class GeminiLLM:
    """
    Wrapper around the Google GenAI SDK for the Gemini model family.

    Reads the API key from the environment / .env file, validates it,
    and exposes a simple `generate()` method that accepts a prompt string
    and returns the model's text response.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout: Optional[int] = None,
    ):
        """
        Initializes the Gemini LLM client.

        Args:
            api_key: Google GenAI API key. Falls back to config / .env.
            model_name: Model identifier (default: gemini-2.5-flash).
            timeout: Request timeout in seconds.

        Raises:
            LLMError: If the API key is missing.
        """
        self.api_key = api_key or config.GEMINI_API_KEY
        self.model_name = model_name or config.GEMINI_MODEL
        self.timeout = timeout or config.GEMINI_TIMEOUT

        if not self.api_key:
            raise LLMError(
                "GEMINI_API_KEY is not set. "
                "Please add it to the .env file or pass it explicitly."
            )

        # Initialize the client
        self.client = genai.Client(api_key=self.api_key)

        logger.info(f"GeminiLLM initialized (model={self.model_name}, timeout={self.timeout}s)")

    def generate(self, prompt: str) -> str:
        """
        Sends a prompt to the Gemini API and returns the generated text.

        Args:
            prompt: The fully constructed prompt (context + question).

        Returns:
            The model's text response.

        Raises:
            LLMError: On API failure, timeout, or empty response.
        """
        if not prompt or not prompt.strip():
            raise LLMError("Prompt cannot be empty.")

        logger.info(f"Sending request to Gemini ({self.model_name})...")
        start_time = time.time()

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.2,      # Low temperature for factual accuracy
                    max_output_tokens=2048,
                ),
            )

            elapsed = time.time() - start_time

            # Extract the text from the response
            answer = response.text

            if not answer or not answer.strip():
                logger.warning(f"Gemini returned an empty response after {elapsed:.2f}s.")
                raise LLMError("Gemini returned an empty response.")

            logger.info(f"Gemini response received in {elapsed:.2f}s ({len(answer)} chars).")
            return answer

        except LLMError:
            raise  # Re-raise our own errors
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"Gemini API call failed after {elapsed:.2f}s: {e}")
            raise LLMError(f"Gemini API error: {e}") from e
