"""
example_chat.py
---------------
Demonstrates the complete RAG pipeline: query -> retrieve -> prompt -> Gemini -> answer.

Usage:
    1. Ensure your .env file contains:  GEMINI_API_KEY=your_key_here
    2. Run:  .venv\\Scripts\\python example_chat.py
"""

from src.rag_pipeline import RAGPipeline


def print_response(result: dict) -> None:
    """Pretty-prints the RAG pipeline response."""
    print("\n" + "=" * 70)
    print("ANSWER")
    print("=" * 70)
    print(result["answer"])

    print(f"\n--- Sources ({result['num_chunks']} chunks used) ---")
    for s in result["sources"]:
        print(f"  - {s['source']} (Page {s['page']}) [score: {s['score']:.4f}]")

    print(f"\n--- Timing ---")
    print(f"  Retrieval   : {result['retrieval_time']:.2f}s")
    print(f"  Generation  : {result['generation_time']:.2f}s")
    print(f"  Total       : {result['total_time']:.2f}s")
    print("=" * 70)


def main():
    print("=" * 70)
    print("INDUSTRIAL KNOWLEDGE RAG - INTERACTIVE CHAT")
    print("=" * 70)

    # Initialize the pipeline (loads embedding model, FAISS index, and Gemini client)
    try:
        pipeline = RAGPipeline()
    except Exception as e:
        print(f"\n[ERROR] Failed to initialize pipeline: {e}")
        print("Make sure your .env file contains:  GEMINI_API_KEY=your_key_here")
        return

    print("\nPipeline ready. Type your question (or 'quit' to exit).\n")

    while True:
        try:
            question = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        result = pipeline.query(question)
        print_response(result)
        print()


if __name__ == "__main__":
    main()
