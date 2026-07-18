from src.loader import DocumentIngestor
from src.config import config
from pathlib import Path

def setup_dummy_data(data_path: Path):
    """Creates a dummy text file if the data directory is empty to demonstrate functionality."""
    data_path.mkdir(parents=True, exist_ok=True)
    sample_txt = data_path / "sample_equipment_manual.txt"
    
    if not sample_txt.exists():
        with open(sample_txt, "w", encoding="utf-8") as f:
            f.write(
                "Centrifugal Pump Model X-100\n\n"
                "1. General Information\n"
                "The X-100 is designed for heavy industrial fluid transfer.\n\n"
                "2. Maintenance Schedule\n"
                "- Inspect seals every 6 months.\n"
                "- Lubricate bearings every 3 months.\n"
            )
        print(f"Created sample document at: {sample_txt}")

def main():
    print("Initializing Document Ingestion Pipeline...")
    
    data_path = Path(config.DATA_DIR)
    setup_dummy_data(data_path)
    
    # Initialize the ingestor
    ingestor = DocumentIngestor(data_dir=data_path)
    
    # Run the ingestion process
    documents = ingestor.ingest_directory()
    
    # Display the result of the first parsed document
    print("\n--- Document Ingestion Result Preview ---")
    if documents:
        first_doc = documents[0]
        print(f"Filename : {first_doc.metadata.get('filename')}")
        print(f"File Type: {first_doc.metadata.get('file_type')}")
        print(f"Source   : {first_doc.metadata.get('source')}")
        
        if 'page' in first_doc.metadata:
            print(f"Page     : {first_doc.metadata.get('page')}")
        
        print("\nContent Snippet:")
        print("-" * 40)
        print(first_doc.page_content[:150] + "...")
        print("-" * 40)
    else:
        print("No documents were loaded. Please add supported files to the 'data/' directory.")

if __name__ == "__main__":
    main()
