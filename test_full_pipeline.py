"""
Non-interactive end-to-end RAG pipeline test.
Tests the full flow: query -> retrieve -> prompt -> Gemini -> answer.
"""
from src.rag_pipeline import RAGPipeline


def main():
    print("=" * 70)
    print("RAG PIPELINE END-TO-END TEST (Module 6)")
    print("=" * 70)

    print("\nInitializing pipeline...")
    try:
        pipeline = RAGPipeline()
    except Exception as e:
        print(f"[INIT ERROR] {e}")
        return

    queries = [
        "What is the MachineDataCheck program and what is it used for?",
        "What components are needed to run this application example?",
    ]

    for q in queries:
        print(f'\n{"=" * 70}')
        print(f'QUESTION: {q}')
        print("=" * 70)

        result = pipeline.query(q)

        print(f"\nANSWER:\n{result['answer']}")

        print(f"\n--- Sources ({result['num_chunks']} chunks) ---")
        for s in result["sources"]:
            print(f"  - {s['source']} (Page {s['page']}) [score: {s['score']:.4f}]")

        print(f"\n--- Timing ---")
        print(f"  Retrieval  : {result['retrieval_time']:.2f}s")
        print(f"  Generation : {result['generation_time']:.2f}s")
        print(f"  Total      : {result['total_time']:.2f}s")

    print("\n" + "=" * 70)
    print("END-TO-END TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()
