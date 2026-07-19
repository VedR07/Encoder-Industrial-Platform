# Encoder Industrial Platform

An AI-powered multi-agent backend platform for Root Cause Analysis (RCA), Compliance tracking, and Knowledge Copilot queries, paired with a Next.js Executive Overview Dashboard.

## Features

- **Multi-Agent Architecture**: Automatically routes queries to the correct domain agent (Copilot, RCA, Compliance).
- **RAG Pipeline**: Retrieves domain context from industrial PDFs and CSVs in the `datasets/` folder.
- **FastAPI Backend**: High-performance, async-ready Python backend.
- **Next.js Dashboard**: Real-time KPI metrics and dynamic React interfaces for all features.

## Prerequisites

- Docker and Docker Compose
- A Google API Key (for the LLM models)

## Setup and Run (Docker)

1. Set your `GOOGLE_API_KEY` in the root `.env` file:
   ```bash
   echo "GOOGLE_API_KEY=your_key_here" > .env
   ```

2. Add your industrial documents (PDF/CSV) to the `datasets/` folder.

3. Start the platform:
   ```bash
   docker-compose up --build
   ```

4. Access the applications:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

- `/app`: Backend logic, agents, tools, and RAG pipeline.
- `/frontend`: Next.js React frontend.
- `/datasets`: Document store for the RAG retriever.
- `main.py`: Entrypoint for the FastAPI backend.
