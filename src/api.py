import os
import shutil
from pathlib import Path
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.rag_pipeline import RAGPipeline
from src.router import route_and_execute_query
from src.config import config
from src.utils import setup_logger

logger = setup_logger(__name__)

# Global RAG Pipeline instance
pipeline: Optional[RAGPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager: initializes the RAG Pipeline on server startup.
    """
    global pipeline
    logger.info("Initializing RAG Pipeline for FastAPI backend...")
    try:
        pipeline = RAGPipeline()
        logger.info("RAG Pipeline ready.")
    except Exception as e:
        logger.error(f"Failed to initialize RAG Pipeline on startup: {e}")
    yield
    logger.info("Shutting down API server...")


app = FastAPI(
    title="Industrial Encoder RAG & Backend API",
    description="Member 2 — RAG & Backend REST APIs for document upload, vector search, multi-turn chat, and LLM generation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request & Response Schemas ---

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user question or technical query.")
    top_k: Optional[int] = Field(default=None, description="Number of context chunks to retrieve.")


class SourceChunk(BaseModel):
    source: str
    page: Any
    chunk_id: str
    score: float
    text: Optional[str] = ""


class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    num_chunks: int
    retrieval_time: float
    generation_time: float
    total_time: float


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Full chat conversation history")
    top_k: Optional[int] = Field(default=None, description="Number of context chunks to retrieve")


class UploadResponse(BaseModel):
    status: str
    filename: str
    raw_pages: int
    total_chunks: int
    added_chunks: int
    total_index_size: int
    elapsed_seconds: float


# --- API Routes ---

@app.get("/health", summary="Health Check")
def health_check():
    """Returns the operational status of the backend API and FAISS vector index."""
    if pipeline is None:
        return {"status": "degraded", "message": "Pipeline not initialized"}
    
    ntotal = pipeline.vector_store.index.ntotal if pipeline.vector_store.index else 0
    return {
        "status": "online",
        "vector_index_size": ntotal,
        "data_directory": str(config.DATA_DIR),
        "supported_extensions": list(config.SUPPORTED_EXTENSIONS)
    }


@app.get("/stats", summary="Vector Store Statistics")
def get_stats():
    """Returns vector store metrics and loaded file summary."""
    if pipeline is None or pipeline.vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    documents = pipeline.vector_store.documents
    filenames = set(doc.get("metadata", {}).get("filename", "Unknown") for doc in documents)

    return {
        "total_vectors": pipeline.vector_store.index.ntotal if pipeline.vector_store.index else 0,
        "unique_documents": len(filenames),
        "indexed_filenames": sorted(list(filenames)),
        "embedding_dim": pipeline.embedder.embedding_dim,
        "model_name": pipeline.embedder.model_name
    }


@app.get("/documents", summary="List Ingested Documents")
def list_documents():
    """Lists files currently present in the data directory and vector store."""
    data_dir = config.DATA_DIR
    data_dir.mkdir(parents=True, exist_ok=True)
    
    files = []
    for f in data_dir.iterdir():
        if f.is_file() and f.suffix.lower() in config.SUPPORTED_EXTENSIONS:
            files.append({
                "filename": f.name,
                "size_bytes": f.stat().st_size,
                "extension": f.suffix.lower()
            })
            
    return {"data_directory": str(data_dir), "count": len(files), "files": files}


@app.post("/upload", response_model=UploadResponse, summary="Upload & Ingest Document")
async def upload_document(file: UploadFile = File(...)):
    """
    Ingests a document file (.pdf, .docx, .txt, .md).
    Saves file to data directory, parses text, breaks into chunks,
    generates embeddings, and updates FAISS vector store in real-time.
    """
    if pipeline is None:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")

    ext = Path(file.filename).suffix.lower()
    if ext not in config.SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: {list(config.SUPPORTED_EXTENSIONS)}"
        )

    # Ensure data directory exists
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    save_path = config.DATA_DIR / file.filename

    logger.info(f"Saving uploaded file to: {save_path}")
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    # Ingest and update vector store
    res = pipeline.ingest_file(save_path)
    if res.get("status") == "error":
        raise HTTPException(status_code=422, detail=res.get("message"))

    return res


@app.post("/query", response_model=QueryResponse, summary="Query RAG Pipeline")
async def query_pipeline(request: QueryRequest):
    """
    Executes a single RAG query:
    Retrieves Top-K relevant chunks, formats grounding prompt, sends to LLM,
    and returns response with citation sources and timing metrics.
    """
    if pipeline is None:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")

    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    res = pipeline.query(request.query, top_k=request.top_k)
    return res


@app.post("/chat", summary="Multi-turn Conversational Chat Endpoint")
async def chat_pipeline(request: ChatRequest):
    """
    Multi-turn conversation RAG endpoint.
    Combines conversation history + relevant document context for the latest question.
    """
    if pipeline is None:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")

    msg_dicts = [{"role": m.role, "content": m.content} for m in request.messages]
    res = pipeline.chat(msg_dicts, top_k=request.top_k)
    return res


@app.post("/agent-query", response_model=QueryResponse, summary="Agent-routed Query Endpoint")
async def agent_query_pipeline(request: QueryRequest):
    """
    Executes a query using the Multi-Agent Router (RCA, Compliance, or Copilot).
    Retrieves context, routes to the appropriate agent, and returns the specialized response.
    """
    if pipeline is None:
        raise HTTPException(status_code=503, detail="RAG Pipeline not ready")

    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    start_time = time.time()
    try:
        # Retrieve context from vector store
        docs = pipeline.vector_store.search(request.query, k=request.top_k or pipeline.top_k)
        retrieval_time = time.time() - start_time
        
        context_str = "\n\n".join([
            f"Source: {doc.metadata.get('filename', 'Unknown')}\n{doc.page_content}"
            for doc in docs
        ])
        
        # Route and execute via agent
        gen_start = time.time()
        agent_response = route_and_execute_query(request.query, context_str, pipeline.llm)
        generation_time = time.time() - gen_start
        total_time = time.time() - start_time

        sources = [
            SourceChunk(
                source=doc.metadata.get("filename", "Unknown"),
                page=doc.metadata.get("page", 0),
                chunk_id=doc.metadata.get("chunk_id", "0"),
                score=doc.metadata.get("score", 0.0),
                text=doc.page_content[:200] + "..." # return snippet
            ) for doc in docs
        ]

        return QueryResponse(
            answer=agent_response,
            sources=sources,
            num_chunks=len(sources),
            retrieval_time=retrieval_time,
            generation_time=generation_time,
            total_time=total_time
        )
    except Exception as e:
        logger.error(f"Agent Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
