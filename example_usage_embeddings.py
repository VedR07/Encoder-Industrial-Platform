from langchain_core.documents import Document
from src.chunker import DocumentChunker
from src.embeddings import EmbeddingGenerator

def main():
    print("=" * 60)
    print("MODULE 3 TEST: Embedding Generation")
    print("=" * 60)

    # Create two small dummy documents to simulate chunker output
    dummy_chunks = [
        Document(
            page_content=(
                "The SINAMICS G120C is a compact frequency converter for "
                "simple motor control applications. It supports V/f control "
                "and vector control modes."
            ),
            metadata={
                "filename": "G120C_manual.pdf",
                "file_type": ".pdf",
                "chunk_id": "aaa-111",
                "chunk_index": 0,
            },
        ),
        Document(
            page_content=(
                "Check the motor cable shielding. Ensure that the shield is "
                "connected to the grounding bar at both ends. Improper "
                "shielding may cause electromagnetic interference."
            ),
            metadata={
                "filename": "G120C_manual.pdf",
                "file_type": ".pdf",
                "chunk_id": "bbb-222",
                "chunk_index": 1,
            },
        ),
    ]

    print(f"\nInput chunks: {len(dummy_chunks)}")

    # Initialise the embedding generator (model loaded once here)
    generator = EmbeddingGenerator()

    # Generate embeddings
    results = generator.generate_embeddings(dummy_chunks)

    print(f"\n--- Results Preview ---")
    for doc, vec in results:
        print(f"\nChunk ID  : {doc.metadata.get('chunk_id')}")
        print(f"Filename  : {doc.metadata.get('filename')}")
        print(f"Vec length: {len(vec)}")
        print(f"Vec sample: {vec[:5]}")

    print("\n" + "=" * 60)
    print("EMBEDDING TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    main()
