"""
test_backend_api.py
-------------------
Integration test suite for Member 2 — RAG & Backend REST APIs.
Tests /health, /stats, /documents, /upload, /query, and /chat endpoints using FastAPI TestClient.
"""

import os
from pathlib import Path
from fastapi.testclient import TestClient

from src.api import app
from src.config import config

def test_health_check(client: TestClient):
    print("\n[TEST] 1. Testing /health endpoint...")
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    print(f"Health Response: {data}")
    assert data["status"] == "online"


def test_stats_and_documents(client: TestClient):
    print("\n[TEST] 2. Testing /stats and /documents endpoints...")
    stats_res = client.get("/stats")
    assert stats_res.status_code == 200
    print(f"Stats Response: {stats_res.json()}")

    docs_res = client.get("/documents")
    assert docs_res.status_code == 200
    print(f"Documents Response: {docs_res.json()}")


def test_document_upload(client: TestClient):
    print("\n[TEST] 3. Testing /upload endpoint...")
    test_file_path = config.BASE_DIR / "data" / "sample_encoder_manual.txt"
    test_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write(
            "Industrial Encoder Diagnostics & Installation Manual:\n"
            "Model: ENC-9000-PRO\n"
            "Resolution: 1024 pulses per revolution (PPR).\n"
            "Operating Voltage: 24V DC +- 10%.\n"
            "Signal Type: Differential RS-422 quadrature outputs.\n"
            "Troubleshooting: If signal loss occurs, verify shield grounding and power supply ripple below 50mV.\n"
        )

    with open(test_file_path, "rb") as f:
        response = client.post("/upload", files={"file": ("sample_encoder_manual.txt", f, "text/plain")})

    assert response.status_code == 200, f"Upload failed: {response.text}"
    data = response.json()
    print(f"Upload Response: {data}")
    assert data["status"] == "success"
    assert data["added_chunks"] >= 0



def test_query_pipeline(client: TestClient):
    print("\n[TEST] 4. Testing /query endpoint...")
    payload = {
        "query": "What is the operating voltage and signal type of the ENC-9000-PRO encoder?",
        "top_k": 3
    }
    response = client.post("/query", json=payload)
    assert response.status_code == 200, f"Query failed: {response.text}"
    data = response.json()
    print(f"\nQuery Answer:\n{data['answer']}")
    print(f"Sources count: {len(data['sources'])}")
    print(f"Timing: retrieval={data['retrieval_time']}s, total={data['total_time']}s")
    assert "answer" in data
    assert len(data["sources"]) > 0


def test_chat_pipeline(client: TestClient):
    print("\n[TEST] 5. Testing /chat multi-turn conversational endpoint...")
    payload = {
        "messages": [
            {"role": "user", "content": "I am working on an encoder installation."},
            {"role": "assistant", "content": "Sure, which model are you working with?"},
            {"role": "user", "content": "What troubleshooting steps are recommended for signal loss on the ENC-9000-PRO?"}
        ],
        "top_k": 3
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200, f"Chat failed: {response.text}"
    data = response.json()
    print(f"\nChat Response Answer:\n{data['answer']}")
    assert "answer" in data
    assert len(data["sources"]) > 0


def main():
    print("=" * 70)
    print("RUNNING MEMBER 2 BACKEND API INTEGRATION TESTS")
    print("=" * 70)
    
    with TestClient(app) as client:
        test_health_check(client)
        test_stats_and_documents(client)
        test_document_upload(client)
        test_query_pipeline(client)
        test_chat_pipeline(client)
    
    print("\n" + "=" * 70)
    print("ALL MEMBER 2 BACKEND API TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()

