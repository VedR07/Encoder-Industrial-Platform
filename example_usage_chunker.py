from langchain_core.documents import Document
from src.chunker import DocumentChunker

def main():
    print("Initializing Module 2: Text Cleaning & Chunking")
    
    # Create a dummy industrial document with messy text and excessive whitespace
    dummy_text = (
        "Centrifugal Pump Model X-100\n\n"
        "1. General Information\n"
        "The X-100 is designed for heavy industrial fluid transfer.\n\n"
        "2. Maintenance Schedule\n"
        "- Inspect seals every 6 months.\n"
        "- Lubricate bearings every 3 months.\n\n"
        # Adding artificial bad formatting to test cleaning
        "  " * 50 + "3. Troubleshooting:    If the pump vibrates excessively,    check the alignment of the motor. \n\n\n\n\n"
        "4. Parts List\n"
        "Part A: Impeller\n"
        "Part B: Casing\n"
        "Part C: Shaft\n"
    )
    
    # To ensure we get multiple chunks, we'll artificially pad the text
    dummy_text += "\n\n5. Extended Notes\n" + ("This is some technical filler text to trigger the text splitter. " * 30)
    
    # Simulate a document returned from the loader
    documents = [
        Document(
            page_content=dummy_text, 
            metadata={"filename": "pump_manual.txt", "file_type": ".txt", "source": "/data/pump_manual.txt"}
        )
    ]
    
    print("\n--- Original Document Preview ---")
    print(f"Length: {len(dummy_text)} characters")
    
    # Initialize the chunker with the requested parameters
    chunker = DocumentChunker(chunk_size=700, chunk_overlap=150)
    
    # Process the documents
    chunked_docs = chunker.process_documents(documents)
    
    print("\n--- Chunking Results Preview ---")
    for chunk in chunked_docs:
        print(f"\nChunk ID    : {chunk.metadata.get('chunk_id')}")
        print(f"Chunk Index : {chunk.metadata.get('chunk_index')}")
        print(f"Source File : {chunk.metadata.get('filename')}")
        print(f"Length      : {len(chunk.page_content)} chars")
        print("-" * 40)
        print(chunk.page_content)
        print("-" * 40)

if __name__ == "__main__":
    main()
