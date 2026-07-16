import os
import time
import hashlib
import json
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np
from langchain_core.documents import Document

from src.utils import setup_logger
from src.config import config

logger = setup_logger(__name__)

# Default persist directory for the FAISS index
DEFAULT_INDEX_DIR = config.BASE_DIR / "faiss_index"


class VectorStore:
    """
    Manages a FAISS vector index for storing and persisting document embeddings.
    
    Supports:
    - Creating a new index from scratch
    - Loading an existing saved index
    - Incremental additions with deduplication
    - Saving the index and metadata to disk
    """

    def __init__(self, embedding_dim: int, index_dir: str | Path = DEFAULT_INDEX_DIR):
        """
        Initializes the vector store.
        
        Args:
            embedding_dim (int): The dimensionality of the embedding vectors.
            index_dir (str | Path): Directory where the FAISS index and metadata will be saved.
        """
        self.embedding_dim = embedding_dim
        self.index_dir = Path(index_dir)
        self.index_path = self.index_dir / "index.faiss"
        self.metadata_path = self.index_dir / "metadata.json"

        self.index: Optional[faiss.IndexFlatIP] = None  # Inner-product (cosine on normalized vecs)
        self.documents: List[dict] = []  # Stores metadata + text for each indexed vector
        self._indexed_hashes: set = set()  # For deduplication

        # Attempt to load an existing index, otherwise create a new one
        if self.index_path.exists() and self.metadata_path.exists():
            self._load_index()
        else:
            self._create_index()

    def _create_index(self) -> None:
        """Creates a brand-new FAISS index."""
        logger.info(f"Creating new FAISS index (dimension={self.embedding_dim})")
        self.index = faiss.IndexFlatIP(self.embedding_dim)
        self.documents = []
        self._indexed_hashes = set()

    def _load_index(self) -> None:
        """Loads a previously saved FAISS index and its metadata from disk."""
        logger.info(f"Loading existing FAISS index from: {self.index_dir}")
        try:
            self.index = faiss.read_index(str(self.index_path))
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.documents = data.get("documents", [])
            self._indexed_hashes = set(data.get("hashes", []))
            logger.info(f"Index loaded successfully. Total vectors: {self.index.ntotal}")
        except Exception as e:
            logger.error(f"Failed to load index: {e}. Creating a new one.")
            self._create_index()

    def save_index(self) -> None:
        """Persists the FAISS index and metadata to disk."""
        self.index_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Saving FAISS index to: {self.index_dir}")
        try:
            faiss.write_index(self.index, str(self.index_path))
            with open(self.metadata_path, "w", encoding="utf-8") as f:
                json.dump({
                    "documents": self.documents,
                    "hashes": list(self._indexed_hashes)
                }, f, ensure_ascii=False)
            logger.info(f"Index saved. Total vectors: {self.index.ntotal}")
        except Exception as e:
            logger.error(f"Failed to save index: {e}")
            raise

    @staticmethod
    def _hash_content(text: str) -> str:
        """Generates a SHA-256 hash of the text for deduplication."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def add_documents(
        self, documents: List[Document], embeddings: List[List[float]]
    ) -> int:
        """
        Adds document embeddings to the FAISS index, skipping duplicates.
        
        Args:
            documents (List[Document]): The chunked LangChain Document objects.
            embeddings (List[List[float]]): Corresponding embedding vectors.
            
        Returns:
            int: Number of new vectors actually added (after dedup).
        """
        if len(documents) != len(embeddings):
            raise ValueError(
                f"Mismatch: {len(documents)} documents vs {len(embeddings)} embeddings."
            )

        new_vectors = []
        new_docs = []
        skipped = 0

        for doc, vec in zip(documents, embeddings):
            content_hash = self._hash_content(doc.page_content)
            if content_hash in self._indexed_hashes:
                skipped += 1
                continue

            self._indexed_hashes.add(content_hash)
            new_vectors.append(vec)
            new_docs.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata
            })

        if new_vectors:
            vectors_np = np.array(new_vectors, dtype="float32")
            self.index.add(vectors_np)
            self.documents.extend(new_docs)

        logger.info(
            f"Indexing complete. Added: {len(new_vectors)}, "
            f"Skipped (duplicates): {skipped}, "
            f"Total in index: {self.index.ntotal}"
        )
        return len(new_vectors)
