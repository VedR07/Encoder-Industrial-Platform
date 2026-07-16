"""
Mock RAG Pipeline script to demonstrate the final output format.
Bypasses the Gemini API call since the API key is out of quota.
"""
from src.rag_pipeline import RAGPipeline
import time

def main():
    print("=" * 70)
    print("INDUSTRIAL KNOWLEDGE RAG - MOCKED LLM DEMONSTRATION")
    print("=" * 70)

    # Initialize the real pipeline (loads embedding model and FAISS index)
    print("\nInitializing pipeline (Loading FAISS & Embeddings)...")
    pipeline = RAGPipeline()
    
    question = "What is the MachineDataCheck program and what is it used for?"
    
    print(f'\n{"=" * 70}')
    print(f'QUESTION: {question}')
    print("=" * 70)

    # Run the real retrieval step
    retrieval_start = time.time()
    retrieved_chunks = pipeline.retriever.retrieve(question, top_k=5)
    retrieval_time = time.time() - retrieval_start
    
    # Mock the LLM generation step (since API is out of quota)
    generation_start = time.time()
    time.sleep(1.2) # Simulate network latency
    mock_answer = (
        "Based on the provided documents, the **MachineDataCheck** program is an application "
        "used for the verification of settings of a SINUMERIK control regarding different functions. "
        "It checks if the machine data settings are correctly configured for specific tasks, such as "
        "the TOP Surface settings on SINUMERIK ONE and 828D/840Dsl controllers. "
        "\n\nSource: `application_en_check_programm_AS_TS_TSp_TSpplus_ARM_V100.pdf` (Page 3)"
    )
    generation_time = time.time() - generation_start
    
    total_time = retrieval_time + generation_time

    # Print the final output exactly as the real pipeline would
    print("\nANSWER:")
    print(mock_answer)

    print(f"\n--- Sources ({len(retrieved_chunks)} chunks used) ---")
    for s in retrieved_chunks:
        source = s.get("source", "N/A")
        page = s.get("page", "N/A")
        score = s.get("score", 0.0)
        print(f"  - {source} (Page {page}) [score: {score:.4f}]")

    print(f"\n--- Timing ---")
    print(f"  Retrieval  : {retrieval_time:.4f}s  <-- THIS IS REAL FAISS SPEED")
    print(f"  Generation : {generation_time:.4f}s  <-- (Mocked LLM generation)")
    print(f"  Total      : {total_time:.4f}s")
    print("=" * 70)

if __name__ == "__main__":
    main()
