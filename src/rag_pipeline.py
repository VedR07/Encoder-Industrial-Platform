import time
from pathlib import Path
from typing import Dict, Any, List, Optional

from src.loader import DocumentIngestor
from src.chunker import DocumentChunker
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

        User Query / File Upload
        -> Document Ingestion & Chunking
        -> Embedding Generation & Vector Store Persistence
        -> Semantic Search Retrieval
        -> Prompt Construction
        -> LLM Response Generation (Gemini or Ollama)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        top_k: int = config.DEFAULT_TOP_K,
    ):
        logger.info("Initializing RAG Pipeline...")
        start = time.time()

        # 1. Document loader and chunker
        self.ingestor = DocumentIngestor()
        self.chunker = DocumentChunker()

        # 2. Embedding generator
        self.embedder = EmbeddingGenerator()

        # 3. Vector store
        self.vector_store = VectorStore(embedding_dim=self.embedder.embedding_dim)
        if self.vector_store.index is None or self.vector_store.index.ntotal == 0:
            logger.warning("FAISS index is currently empty.")

        # 4. Semantic Retriever
        self.retriever = SemanticRetriever(
            vector_store=self.vector_store,
            embedding_generator=self.embedder,
            top_k=top_k,
        )

        # 5. Prompt builder
        self.prompt_builder = PromptBuilder()

        # 6. LLM Client (Gemini)
        self.llm = GeminiLLM(api_key=api_key, model_name=model_name)

        elapsed = time.time() - start
        logger.info(f"RAG Pipeline initialized in {elapsed:.2f}s.")

    def ingest_file(self, file_path: str | Path) -> Dict[str, Any]:
        """
        Ingests, chunks, embeds, and indexes a single uploaded document.
        """
        start = time.time()
        docs = self.ingestor.ingest_file(file_path)
        if not docs:
            return {"status": "error", "message": "Failed to extract text or unsupported file type", "added_chunks": 0}

        chunks = self.chunker.process_documents(docs)
        if not chunks:
            return {"status": "error", "message": "No valid text chunks generated", "added_chunks": 0}

        doc_embeddings = self.embedder.generate_embeddings(chunks)
        chunk_docs = [pair[0] for pair in doc_embeddings]
        vecs = [pair[1] for pair in doc_embeddings]

        added_count = self.vector_store.add_documents(chunk_docs, vecs)
        self.vector_store.save_index()
        elapsed = time.time() - start

        logger.info(f"Ingested file '{Path(file_path).name}': {added_count} new vector chunks indexed in {elapsed:.2f}s.")
        return {
            "status": "success",
            "filename": Path(file_path).name,
            "raw_pages": len(docs),
            "total_chunks": len(chunks),
            "added_chunks": added_count,
            "total_index_size": self.vector_store.index.ntotal if self.vector_store.index else 0,
            "elapsed_seconds": round(elapsed, 2)
        }

    def ingest_directory(self) -> Dict[str, Any]:
        """
        Scans data directory and ingests all supported documents into the vector store.
        """
        start = time.time()
        docs = self.ingestor.ingest_directory()
        if not docs:
            return {"status": "warning", "message": "No documents found in data directory", "added_chunks": 0}

        chunks = self.chunker.process_documents(docs)
        if not chunks:
            return {"status": "warning", "message": "No text chunks produced", "added_chunks": 0}

        doc_embeddings = self.embedder.generate_embeddings(chunks)
        chunk_docs = [pair[0] for pair in doc_embeddings]
        vecs = [pair[1] for pair in doc_embeddings]

        added_count = self.vector_store.add_documents(chunk_docs, vecs)
        self.vector_store.save_index()
        elapsed = time.time() - start

        return {
            "status": "success",
            "raw_documents": len(docs),
            "total_chunks": len(chunks),
            "added_chunks": added_count,
            "total_index_size": self.vector_store.index.ntotal if self.vector_store.index else 0,
            "elapsed_seconds": round(elapsed, 2)
        }

    def query(self, question: str, top_k: Optional[int] = None) -> Dict[str, Any]:
        """
        Runs full RAG pipeline for a user question.
        """
        pipeline_start = time.time()

        # 1. Retrieve
        retrieval_start = time.time()
        try:
            retrieved_chunks = self.retriever.retrieve(question, top_k=top_k)
        except RetrievalError as e:
            logger.error(f"Retrieval failed: {e}")
            return self._error_response(str(e), time.time() - pipeline_start)
        retrieval_time = time.time() - retrieval_start

        sources = [
            {
                "source": c.get("source", "N/A"),
                "page": c.get("page", "N/A"),
                "chunk_id": c.get("chunk_id", "N/A"),
                "score": c.get("score", 0.0),
                "text": c.get("page_content", "")
            }
            for c in retrieved_chunks
        ]

        # 2. Build Prompt
        prompt = self.prompt_builder.build_prompt(question, retrieved_chunks)

        # 3. Generate
        generation_start = time.time()
        try:
            answer = self.llm.generate(prompt)
        except LLMError as e:
            logger.error(f"LLM generation failed: {e}")
            # If rate limited or API error, fallback to context summary so pipeline remains operational
            if "RESOURCE_EXHAUSTED" in str(e) or "429" in str(e):
                answer = f"[LLM Rate Limited / Quota Exceeded]\nRetrieved {len(sources)} context chunks successfully:\n" + \
                         "\n".join([f"- {s['source']} (Page {s['page']}): {s['text'][:150]}..." for s in sources])
            else:
                answer = f"An error occurred during response generation: {e}"
        generation_time = time.time() - generation_start

        total_time = time.time() - pipeline_start

        return {
            "answer": answer,
            "sources": sources,
            "num_chunks": len(retrieved_chunks),
            "retrieval_time": round(retrieval_time, 4),
            "generation_time": round(generation_time, 4),
            "total_time": round(total_time, 4),
        }


    def chat(self, messages: List[Dict[str, str]], top_k: Optional[int] = None) -> Dict[str, Any]:
        """
        Multi-turn chat endpoint combining conversation history with RAG retrieval.
        """
        if not messages:
            return self._error_response("Messages list cannot be empty", 0.0)

        latest_query = messages[-1].get("content", "").strip()
        if not latest_query:
            return self._error_response("Latest message content cannot be empty", 0.0)

        # Build context from previous conversation turns
        history_str = ""
        if len(messages) > 1:
            history_lines = []
            for msg in messages[:-1]:
                role = msg.get("role", "user").capitalize()
                content = msg.get("content", "")
                history_lines.append(f"{role}: {content}")
            history_str = "\n".join(history_lines)

        full_query_with_history = latest_query
        if history_str:
            full_query_with_history = f"Conversation History:\n{history_str}\n\nCurrent User Question: {latest_query}"

        res = self.query(full_query_with_history, top_k=top_k)
        res["question"] = latest_query
        return res

    @staticmethod
    def _error_response(error_msg: str, elapsed: float) -> Dict[str, Any]:
        return {
            "answer": f"An error occurred: {error_msg}",
            "sources": [],
            "num_chunks": 0,
            "retrieval_time": 0.0,
            "generation_time": 0.0,
            "total_time": round(elapsed, 4),
        }

