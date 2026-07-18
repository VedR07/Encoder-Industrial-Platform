import time
from typing import List, Dict, Any, Optional

import numpy as np

from src.vector_store import VectorStore
from src.embeddings import EmbeddingGenerator
from src.utils import setup_logger

logger = setup_logger(__name__)


class RetrievalError(Exception):
    """Custom exception for retrieval pipeline errors."""
    pass


class SemanticRetriever:
    """
    Performs semantic similarity search over an indexed FAISS vector store.

    Accepts a natural-language query, embeds it using the same model that was
    used during indexing, and returns the Top-K most similar document chunks
    along with their similarity scores and full metadata.

    This class is the primary entry point for the retrieval stage of the
    RAG pipeline. It does NOT invoke an LLM — it stops after retrieving
    the relevant context chunks.
    """

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_generator: EmbeddingGenerator,
        top_k: int = 5,
    ):
        """
        Initializes the semantic retriever.

        Args:
            vector_store (VectorStore): The FAISS vector store containing indexed chunks.
            embedding_generator (EmbeddingGenerator): The embedding model instance
                (must be the same model used during indexing for consistent results).
            top_k (int): Default number of top results to retrieve per query.

        Raises:
            RetrievalError: If the vector store or embedding generator is invalid.
        """
        if vector_store is None:
            raise RetrievalError("VectorStore instance cannot be None.")
        if embedding_generator is None:
            raise RetrievalError("EmbeddingGenerator instance cannot be None.")
        if top_k < 1:
            raise RetrievalError(f"top_k must be >= 1, got {top_k}.")

        self.vector_store = vector_store
        self.embedding_generator = embedding_generator
        self.top_k = top_k

        logger.info(
            f"SemanticRetriever initialized (top_k={self.top_k}, "
            f"index_size={self.vector_store.index.ntotal if self.vector_store.index else 0})"
        )

    def _validate_query(self, query: str) -> str:
        """
        Validates and sanitizes the user query.

        Args:
            query (str): The raw user query.

        Returns:
            str: The cleaned query string.

        Raises:
            RetrievalError: If the query is empty or invalid.
        """
        if not isinstance(query, str):
            raise RetrievalError(f"Query must be a string, got {type(query).__name__}.")

        cleaned = query.strip()
        if not cleaned:
            raise RetrievalError("Query cannot be empty or whitespace-only.")

        return cleaned

    def retrieve(self, query: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Retrieves the most relevant document chunks for a given query.

        Workflow:
            1. Validate the query.
            2. Generate the query embedding.
            3. Search the FAISS index for the Top-K nearest neighbours.
            4. Package each result with its score, text, and full metadata.

        Args:
            query (str): The natural-language user query.
            top_k (int | None): Override the default top_k for this search.

        Returns:
            List[Dict[str, Any]]: A list of result dictionaries ordered by
            descending similarity. Each dictionary contains:
                - rank (int): 1-based rank of this result.
                - score (float): Cosine similarity score (higher = more similar).
                - page_content (str): The text of the retrieved chunk.
                - source (str): Source filename.
                - page (int | str): Page number from the original document.
                - chunk_id (str): Unique identifier of the chunk.
                - metadata (dict): The full, unmodified metadata dictionary.

        Raises:
            RetrievalError: On validation failure, empty index, or search error.
        """
        # --- Validate inputs ---
        cleaned_query = self._validate_query(query)
        k = top_k if top_k is not None else self.top_k

        if k < 1:
            raise RetrievalError(f"top_k must be >= 1, got {k}.")

        # --- Check index health ---
        if self.vector_store.index is None:
            logger.error("FAISS index is None. Has the index been loaded or created?")
            raise RetrievalError("FAISS index is not available. Please build or load an index first.")

        if self.vector_store.index.ntotal == 0:
            logger.warning("FAISS index is empty (0 vectors). No results can be returned.")
            return []

        # Clamp k to available vectors
        k = min(k, self.vector_store.index.ntotal)

        logger.info(f'Query: "{cleaned_query[:100]}"')
        logger.info(f"Searching FAISS index ({self.vector_store.index.ntotal} vectors) for top-{k} results...")

        start_time = time.time()

        try:
            # --- Embed the query ---
            query_vector = self.embedding_generator.embedding_model.embed_query(cleaned_query)
            query_np = np.array([query_vector], dtype="float32")

            # --- FAISS search ---
            scores, indices = self.vector_store.index.search(query_np, k)
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"Search failed after {elapsed:.4f}s: {e}")
            raise RetrievalError(f"Search execution failed: {e}") from e

        elapsed = time.time() - start_time

        # --- Package results ---
        results: List[Dict[str, Any]] = []
        for rank, (score, idx) in enumerate(zip(scores[0], indices[0]), start=1):
            if idx == -1:
                continue  # FAISS pads with -1 when fewer results exist

            doc_data = self.vector_store.documents[idx]
            metadata = doc_data.get("metadata", {})

            results.append({
                "rank": rank,
                "score": round(float(score), 4),
                "page_content": doc_data["page_content"],
                "source": metadata.get("filename", "N/A"),
                "page": metadata.get("page", "N/A"),
                "chunk_id": metadata.get("chunk_id", "N/A"),
                "metadata": metadata,
            })

        # --- Log outcome ---
        if results:
            logger.info(
                f"Retrieval SUCCESS: {len(results)} chunk(s) in {elapsed:.4f}s "
                f"(best score: {results[0]['score']:.4f})"
            )
        else:
            logger.warning(f"Retrieval returned 0 results in {elapsed:.4f}s.")

        return results
