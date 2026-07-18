from src.vector_store import VectorStore
from src.embeddings import EmbeddingGenerator
from src.retriever import SemanticRetriever

def main():
    print("=" * 60)
    print("QUICK SEARCH TEST ON SAVED FAISS INDEX")
    print("=" * 60)
    
    # 1. Initialize the embedding generator
    print("Loading embedding model...")
    embedder = EmbeddingGenerator()
    
    # 2. Load the existing vector store
    print("\nLoading FAISS index from disk...")
    store = VectorStore(embedding_dim=embedder.embedding_dim)
    
    if store.index is None or store.index.ntotal == 0:
        print("\n[WARNING] FAISS index is empty or not found. You need to run the ingestion pipeline first.")
        return
        
    print(f"[SUCCESS] Loaded FAISS index with {store.index.ntotal} vectors.")
    
    # 3. Perform a search
    retriever = SemanticRetriever(
        vector_store=store,
        embedding_generator=embedder,
        top_k=3,
    )
    
    query = "What is the MachineDataCheck program used for?"
    print(f'\nSearching for: "{query}"')
    
    results = retriever.retrieve(query)
    
    for i, res in enumerate(results, 1):
        print(f"\nResult {i} (Score: {res['score']:.4f})")
        print(f"Source: {res['metadata'].get('filename')} (Page {res['metadata'].get('page')})")
        # Print a short preview
        preview = res["page_content"][:150].encode('ascii', errors='replace').decode('ascii')
        print(f"Preview: {preview}...")

if __name__ == "__main__":
    main()
