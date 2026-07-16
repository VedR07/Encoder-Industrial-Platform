import time
from typing import Dict, Any, Optional

from src.embeddings import EmbeddingGenerator
from src.vector_store import VectorStore
from src.retriever import SemanticRetriever, RetrievalError
from src.prompt_builder import PromptBuilder
from src.llm import GeminiLLM, LLMError
from src.config import config
from src.utils import setup_logger

logger = setup_logger(__name__)


class RAGPipeline:
    """
    Orchestrates the full Retrieval-Augmented Generation pipeline:

        User Query
        -> Generate Query Embedding
        -> Retrieve Top-K Chunks from FAISS
        -> Build Prompt
        -> Send Prompt to Gemini
        -> Return Final Answer with Sources

    All components (embedder, vector store, retriever, prompt builder, LLM)
    are initialized once and reused across multiple queries.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        top_k: int = config.DEFAULT_TOP_K,
    ):
        """
        Initializes all pipeline components.

        Args:
            api_key: Google GenAI API key (falls back to .env).
            model_name: Gemini model identifier.
            top_k: Default number of chunks to retrieve per query.
        """
        logger.info("Initializing RAG Pipeline...")
        start = time.time()

        # 1. Embedding model
        self.embedder = EmbeddingGenerator()

        # 2. Vector store (loads existing FAISS index from disk)
        self.vector_store = VectorStore(embedding_dim=self.embedder.embedding_dim)
        if self.vector_store.index is None or self.vector_store.index.ntotal == 0:
            logger.warning("FAISS index is empty. Retrieval will return no results.")

        # 3. Retriever
        self.retriever = SemanticRetriever(
            vector_store=self.vector_store,
            embedding_generator=self.embedder,
            top_k=top_k,
        )

        # 4. Prompt builder
        self.prompt_builder = PromptBuilder()

        # 5. LLM
        self.llm = GeminiLLM(api_key=api_key, model_name=model_name)

        elapsed = time.time() - start
        logger.info(f"RAG Pipeline ready in {elapsed:.2f}s.")

    def query(self, question: str, top_k: Optional[int] = None) -> Dict[str, Any]:
        """
        Runs the full RAG pipeline for a user question.

        Args:
            question: The user's natural-language question.
            top_k: Override the default number of chunks to retrieve.

        Returns:
            A dictionary containing:
                - answer (str): The generated response.
                - sources (list): Metadata for each retrieved chunk.
                - num_chunks (int): Number of chunks used as context.
                - retrieval_time (float): Seconds spent on retrieval.
                - generation_time (float): Seconds spent on LLM generation.
                - total_time (float): End-to-end pipeline time.
        """
        pipeline_start = time.time()

        # --- Step 1: Retrieve ---
        retrieval_start = time.time()
        try:
            retrieved_chunks = self.retriever.retrieve(question, top_k=top_k)
        except RetrievalError as e:
            logger.error(f"Retrieval failed: {e}")
            return self._error_response(str(e), time.time() - pipeline_start)
        retrieval_time = time.time() - retrieval_start

        if not retrieved_chunks:
            logger.warning("No chunks retrieved. LLM will respond accordingly.")

        # --- Step 2: Build Prompt ---
        prompt = self.prompt_builder.build_prompt(question, retrieved_chunks)

        # --- Step 3: Generate Answer ---
        generation_start = time.time()
        try:
            answer = self.llm.generate(prompt)
        except LLMError as e:
            logger.error(f"LLM generation failed: {e}")
            return self._error_response(str(e), time.time() - pipeline_start)
        generation_time = time.time() - generation_start

        total_time = time.time() - pipeline_start

        # --- Step 4: Package Response ---
        sources = [
            {
                "source": c.get("source", "N/A"),
                "page": c.get("page", "N/A"),
                "chunk_id": c.get("chunk_id", "N/A"),
                "score": c.get("score", 0.0),
            }
            for c in retrieved_chunks
        ]

        logger.info(
            f"Pipeline complete: retrieval={retrieval_time:.2f}s, "
            f"generation={generation_time:.2f}s, total={total_time:.2f}s"
        )

        return {
            "answer": answer,
            "sources": sources,
            "num_chunks": len(retrieved_chunks),
            "retrieval_time": round(retrieval_time, 4),
            "generation_time": round(generation_time, 4),
            "total_time": round(total_time, 4),
        }

    @staticmethod
    def _error_response(error_msg: str, elapsed: float) -> Dict[str, Any]:
        """Returns a standardized error response dict."""
        return {
            "answer": f"An error occurred: {error_msg}",
            "sources": [],
            "num_chunks": 0,
            "retrieval_time": 0.0,
            "generation_time": 0.0,
            "total_time": round(elapsed, 4),
        }
