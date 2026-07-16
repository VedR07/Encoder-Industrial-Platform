"""Single-query test to verify Gemini connectivity after quota cooldown."""
from src.rag_pipeline import RAGPipeline

pipeline = RAGPipeline()
result = pipeline.query("What is MachineDataCheck?")

print("\nANSWER:")
print(result["answer"])
print(f"\nSources: {len(result['sources'])}")
for s in result["sources"]:
    print(f"  - {s['source']} (Page {s['page']}) [score: {s['score']}]")
print(f"\nTiming: retrieval={result['retrieval_time']}s, generation={result['generation_time']}s")
