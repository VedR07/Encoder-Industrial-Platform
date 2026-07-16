import time
from typing import List, Tuple

import numpy as np
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from src.utils import setup_logger

logger = setup_logger(__name__)

# Default embedding model — compact, fast, and high-quality for retrieval tasks.
DEFAULT_MODEL_NAME = "BAAI/bge-small-en-v1.5"

class EmbeddingGenerator:
    """
    Generates vector embeddings for chunked LangChain Documents using a
    HuggingFace sentence-transformer model.

    The model is loaded once during initialization and reused for all
    subsequent embedding calls, avoiding repeated model loading overhead.
    """

    def __init__(self, model_name: str = DEFAULT_MODEL_NAME):
        """
        Initializes the embedding generator and loads the HuggingFace model.

        Args:
            model_name (str): The HuggingFace model identifier to use.
        """
        self.model_name = model_name
        logger.info(f"Loading embedding model: {self.model_name}")

        try:
            self.embedding_model = HuggingFaceEmbeddings(
                model_name=self.model_name,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True, "batch_size": 64}
            )
            # Determine embedding dimension with a probe
            sample_embedding = self.embedding_model.embed_query("probe")
            self.embedding_dim = len(sample_embedding)
            logger.info(f"Embedding model loaded successfully. Dimension: {self.embedding_dim}")
        except Exception as e:
            logger.error(f"Failed to load embedding model '{self.model_name}': {e}")
            raise

    def generate_embeddings(
        self, documents: List[Document]
    ) -> List[Tuple[Document, List[float]]]:
        """
        Generates embeddings for a list of chunked Documents.

        Args:
            documents (List[Document]): Chunked LangChain Document objects.

        Returns:
            List[Tuple[Document, List[float]]]: A list of (document, embedding_vector)
            tuples preserving the original document and its metadata.
        """
        if not documents:
            logger.warning("No documents provided for embedding generation.")
            return []

        logger.info(f"Generating embeddings for {len(documents)} chunk(s)...")
        start_time = time.time()

        texts = [doc.page_content for doc in documents]

        try:
            # embed_documents handles internal batching via encode_kwargs
            embeddings = self.embedding_model.embed_documents(texts)
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise

        elapsed = time.time() - start_time

        results: List[Tuple[Document, List[float]]] = list(zip(documents, embeddings))

        # Summary
        logger.info("--- Embedding Summary ---")
        logger.info(f"Total chunks processed : {len(documents)}")
        logger.info(f"Embedding model        : {self.model_name}")
        logger.info(f"Embedding dimension    : {self.embedding_dim}")
        logger.info(f"Time taken             : {elapsed:.2f} seconds")
        logger.info("-------------------------")

        return results
