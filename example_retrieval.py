"""
example_retrieval.py
--------------------
Demonstrates the semantic retrieval pipeline (Modules 1-5).
Loads the existing FAISS index, accepts sample queries, and prints
the Top-K most relevant chunks with their metadata.

Usage:
    .venv\\Scripts\\python example_retrieval.py
"""

from src.embeddings import EmbeddingGenerator
from src.vector_store import VectorStore
from src.retriever import SemanticRetriever, RetrievalError


def print_results(query: str, results: list) -> None:
    """Pretty-prints the retrieval results to the console."""
    print(f'\n{"=" * 70}')
    print(f'QUERY: "{query}"')
    print(f'{"=" * 70}')
    print(f"Retrieved {len(results)} chunk(s)\n")

    for res in results:
        print(f"--- Result #{res['rank']} ---")
        print(f"  Similarity Score : {res['score']:.4f}")
        print(f"  Source File      : {res['source']}")
        print(f"  Page Number      : {res['page']}")
        print(f"  Chunk ID         : {res['chunk_id']}")
        preview = res["page_content"][:250].encode("ascii", errors="replace").decode("ascii")
        print(f"  Text Preview     : {preview}...")
        print()


def main():
    print("=" * 70)
    print("INDUSTRIAL KNOWLEDGE RAG - SEMANTIC RETRIEVAL DEMO")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Load the embedding model (same one used during indexing)
    # ------------------------------------------------------------------
    print("\n[1/3] Loading embedding model...")
    embedder = EmbeddingGenerator()

    # ------------------------------------------------------------------
    # 2. Load the persisted FAISS index
    # ------------------------------------------------------------------
    print("[2/3] Loading FAISS vector index from disk...")
    store = VectorStore(embedding_dim=embedder.embedding_dim)

    if store.index is None or store.index.ntotal == 0:
        print("\n[ERROR] FAISS index is empty or not found.")
        print("Please run the ingestion pipeline first (example_usage_retrieval.py).")
        return

    print(f"[OK] FAISS index loaded: {store.index.ntotal} vectors.\n")

    # ------------------------------------------------------------------
    # 3. Initialize the retriever and run sample queries
    # ------------------------------------------------------------------
    print("[3/3] Running sample queries...\n")
    retriever = SemanticRetriever(
        vector_store=store,
        embedding_generator=embedder,
        top_k=5,
    )

    # Sample queries relevant to industrial Siemens documentation
    sample_queries = [
        "How to check machine data settings in SINUMERIK?",
        "What components are required for the MachineDataCheck program?",
        "What are the legal terms for using Siemens application examples?",
    ]

    for query in sample_queries:
        try:
            results = retriever.retrieve(query)
            print_results(query, results)
        except RetrievalError as e:
            print(f"\n[RETRIEVAL ERROR] {e}")

    # ------------------------------------------------------------------
    # Edge-case demonstration: empty query
    # ------------------------------------------------------------------
    print("-" * 70)
    print("Edge-case test: empty query")
    try:
        retriever.retrieve("   ")
    except RetrievalError as e:
        print(f"  Caught expected error: {e}")

    print("\n" + "=" * 70)
    print("RETRIEVAL DEMO COMPLETED SUCCESSFULLY")
    print("=" * 70)


if __name__ == "__main__":
    main()
