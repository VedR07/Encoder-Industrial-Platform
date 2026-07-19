from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

# Load API key securely from .env — must happen before any LangChain imports
from app.config import GOOGLE_API_KEY

from app.router import process_query_with_agents
from app.data_loader import get_retriever

# Initialize FastAPI app
app = FastAPI(
    title="Encoder Industrial Platform API",
    description="AI-powered multi-agent backend for RCA, Compliance, and Knowledge Copilot queries.",
    version="1.0.0"
)

# Allow frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the retriever once on startup
retriever = None

@app.on_event("startup")
async def startup_event():
    global retriever
    retriever = get_retriever()
    print("Vector store retriever initialized and ready.")

# Request schema
class QueryRequest(BaseModel):
    query: str

# Response schema
class QueryResponse(BaseModel):
    agent: str
    response: str

@app.get("/")
def root():
    return {"status": "Encoder Industrial Platform API is running."}

@app.post("/query", response_model=QueryResponse)
async def query_agent(request: QueryRequest):
    """
    Main endpoint to process a user query.
    Automatically routes to the correct agent (RCA, Compliance, or Copilot)
    and returns a structured response grounded in the knowledge base.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # Retrieve relevant context from vector store
        docs = retriever.invoke(request.query)
        context = "\n\n".join([
            f"Source: {doc.metadata.get('source_file', 'Unknown')}\n{doc.page_content}"
            for doc in docs
        ])

        # Process through agent router
        response = process_query_with_agents(query=request.query, context=context)

        return QueryResponse(agent="auto-routed", response=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Industrial Encoder RAG Backend on http://0.0.0.0:{port}")
    print(f"Swagger API Documentation available at http://localhost:{port}/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )
