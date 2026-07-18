import os
from pathlib import Path

# Important: We are testing the integration between Loader and Chunker
from src.loader import DocumentIngestor
from src.chunker import DocumentChunker
from src.config import config

def main():
    print("=" * 60)
    print("RAG PIPELINE INTEGRATION TEST: MODULE 1 & 2")
    print("=" * 60)
    
    data_path = Path(config.DATA_DIR)
    
    print("\n[Step 1] Initializing Document Ingestor...")
    ingestor = DocumentIngestor(data_dir=data_path)
    
    print("\n[Step 2] Executing Loader...")
    # This will load the test PDF file from the data directory
    documents = ingestor.ingest_directory()
    
    if not documents:
        print("[FAILED] No documents were loaded. Ensure the data directory has the test PDF.")
        return
        
    print(f"[SUCCESS] Loaded {len(documents)} document objects (pages/splits).")
    
    # Preview metadata of the first loaded object
    print("\nPreview of Loaded Document Metadata:")
    print(documents[0].metadata)
    
    print("\n[Step 3] Executing Text Cleaner and Chunker...")
    chunker = DocumentChunker(chunk_size=700, chunk_overlap=150)
    chunked_docs = chunker.process_documents(documents)
    
    if not chunked_docs:
        print("[FAILED] Chunker returned empty results.")
        return
        
    print(f"[SUCCESS] Generated {len(chunked_docs)} semantic chunks.")
    
    print("\n[Step 4] Final Output Verification (First 2 Chunks):")
    for i, chunk in enumerate(chunked_docs[:2]):
        print(f"\n--- Chunk {i+1} ---")
        print(f"Metadata : {chunk.metadata}")
        print(f"Length   : {len(chunk.page_content)} chars")
        print("Content  :")
        # Safely encode the content for Windows console
        content_preview = chunk.page_content[:250].encode('ascii', errors='replace').decode('ascii')
        print(f"{content_preview}...")
    
    print("\n" + "=" * 60)
    print("PIPELINE TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
