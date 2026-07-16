from pathlib import Path

from src.loader import DocumentIngestor
from src.chunker import DocumentChunker
from src.embeddings import EmbeddingGenerator
from src.vector_store import VectorStore
from src.retriever import SemanticRetriever
from src.config import config


def main():
    print("=" * 60)
    print("RAG PIPELINE TEST: MODULES 1-4 (End-to-End Retrieval)")
    print("=" * 60)

    # ------------------------------------------------------------------
    # STEP 1: Ingest documents
    # ------------------------------------------------------------------
    print("\n[Step 1] Ingesting documents...")
    ingestor = DocumentIngestor(data_dir=config.DATA_DIR)
    documents = ingestor.ingest_directory()

    if not documents:
        print("[FAILED] No documents loaded.")
        return

    print(f"[SUCCESS] Loaded {len(documents)} page(s).")

    # ------------------------------------------------------------------
    # STEP 2: Chunk documents
    # ------------------------------------------------------------------
    print("\n[Step 2] Chunking documents...")
    chunker = DocumentChunker(chunk_size=700, chunk_overlap=150)
    chunks = chunker.process_documents(documents)
    print(f"[SUCCESS] Generated {len(chunks)} chunks.")

    # ------------------------------------------------------------------
    # STEP 3: Generate embeddings
    # ------------------------------------------------------------------
    print("\n[Step 3] Generating embeddings...")
    embedder = EmbeddingGenerator()
    results = embedder.generate_embeddings(chunks)

    docs_list = [r[0] for r in results]
    vecs_list = [r[1] for r in results]
    print(f"[SUCCESS] Generated {len(vecs_list)} embeddings (dim={embedder.embedding_dim}).")

    # ------------------------------------------------------------------
    # STEP 4: Index into FAISS
    # ------------------------------------------------------------------
    print("\n[Step 4] Indexing into FAISS...")
    store = VectorStore(embedding_dim=embedder.embedding_dim)
    added = store.add_documents(docs_list, vecs_list)
    store.save_index()
    print(f"[SUCCESS] Indexed {added} new vectors. Total in store: {store.index.ntotal}")

    # ------------------------------------------------------------------
    # STEP 5: Semantic retrieval
    # ------------------------------------------------------------------
    print("\n[Step 5] Running semantic search...")
    retriever = SemanticRetriever(
        vector_store=store,
        embedding_generator=embedder,
        top_k=5,
    )

    sample_query = "How to check machine data settings in SINUMERIK?"
    print(f'Query: "{sample_query}"\n')

    hits = retriever.retrieve(sample_query)

    print(f"--- Top {len(hits)} Results ---")
    for i, hit in enumerate(hits, start=1):
        meta = hit["metadata"]
        print(f"\nResult {i}:")
        print(f"  Score    : {hit['score']:.4f}")
        print(f"  Source   : {meta.get('filename', 'N/A')}")
        print(f"  Page     : {meta.get('page', 'N/A')}")
        print(f"  Chunk ID : {meta.get('chunk_id', 'N/A')}")
        preview = hit["page_content"][:200].encode("ascii", errors="replace").decode("ascii")
        print(f"  Preview  : {preview}...")

    print("\n" + "=" * 60)
    print("END-TO-END RETRIEVAL TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    main()
