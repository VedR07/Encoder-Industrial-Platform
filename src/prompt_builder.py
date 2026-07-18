from typing import List, Dict, Any

from src.utils import setup_logger

logger = setup_logger(__name__)

# System prompt that enforces grounded, citation-backed responses
SYSTEM_INSTRUCTION = (
    "You are an Industrial Knowledge Intelligence Assistant. "
    "You help engineers, maintenance personnel, operators, and field technicians "
    "find accurate information from industrial documents.\n\n"
    "RULES:\n"
    "1. Answer ONLY using the provided context below. Do NOT use prior knowledge.\n"
    "2. If the answer is not present in the context, respond with: "
    "\"I couldn't find enough information in the provided documents.\"\n"
    "3. Write clear, concise, and professional answers.\n"
    "4. When possible, cite the source document name and page number.\n"
    "5. Do not invent, assume, or hallucinate any information.\n"
)


class PromptBuilder:
    """
    Constructs structured prompts for the LLM by combining the user query
    with retrieved document chunks and their source metadata.
    """

    @staticmethod
    def build_context_block(retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Formats the retrieved chunks into a numbered context block for the prompt.

        Args:
            retrieved_chunks: List of result dicts from SemanticRetriever.retrieve().

        Returns:
            A formatted string containing all context chunks with source attribution.
        """
        if not retrieved_chunks:
            return "[No relevant context was retrieved from the document database.]"

        context_parts: List[str] = []
        for chunk in retrieved_chunks:
            source = chunk.get("source", "Unknown")
            page = chunk.get("page", "N/A")
            rank = chunk.get("rank", "?")
            score = chunk.get("score", 0.0)
            text = chunk.get("page_content", "")

            header = (
                f"[Context {rank}] "
                f"Source: {source} | Page: {page} | Relevance: {score:.2f}"
            )
            context_parts.append(f"{header}\n{text}")

        return "\n\n---\n\n".join(context_parts)

    @staticmethod
    def build_prompt(
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
    ) -> str:
        """
        Builds the final user prompt combining the context and the question.

        Args:
            query: The user's natural-language question.
            retrieved_chunks: List of result dicts from SemanticRetriever.

        Returns:
            The fully constructed prompt string to send to the LLM.
        """
        context_block = PromptBuilder.build_context_block(retrieved_chunks)

        prompt = (
            f"CONTEXT (retrieved from industrial documents):\n"
            f"{'=' * 60}\n"
            f"{context_block}\n"
            f"{'=' * 60}\n\n"
            f"QUESTION:\n{query}\n\n"
            f"ANSWER:"
        )

        logger.info(
            f"Prompt built: {len(retrieved_chunks)} context chunk(s), "
            f"{len(prompt)} characters total."
        )
        return prompt
