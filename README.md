# IntelliPlant Industrial Copilot Platform

IntelliPlant is a state-of-the-art, AI-powered industrial operating system designed to bridge the gap between complex engineering data and real-time operational decision making. It features a Next.js Executive Dashboard paired with a highly performant, multi-agent FastAPI backend.

## 🚀 Key Features

*   **Multi-Agent Routing Architecture:** Automatically routes natural language queries to specialized AI agents (Root Cause Analysis, Regulatory Compliance, or Knowledge Copilot) depending on the engineering context.
*   **P&ID Vision Parser:** Utilizes advanced LLM vision capabilities to instantly extract piping, instruments, and equipment tags from uploaded engineering diagrams.
*   **Dynamic Knowledge Graph:** Automatically ingests P&ID data and heterogeneous documents into a live Ontology Graph, creating semantic links between hardware, faults, agents, and documentation.
*   **Field Tech Voice Interface:** A hands-free, dark-mode mobile interface designed for field technicians to query systems and run diagnostics using voice commands.
*   **RAG Document Pipeline:** Rapidly retrieves domain context from uploaded industrial PDFs and CSVs using ChromaDB vector store integration.

## 🛠 Technology Stack

*   **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons, Force-Graph 2D
*   **Backend:** Python 3, FastAPI, Uvicorn, LangChain, ChromaDB
*   **AI Models:** Google Gemini 1.5 Pro / Flash

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python 3.10+
*   Google API Key (for Gemini models)

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/VedR07/Encoder-Industrial-Platform.git
cd Encoder-Industrial-Platform
```

**2. Setup Backend**
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
echo "GOOGLE_API_KEY=your_key_here" > .env
python main.py
```
The backend API will run on `http://localhost:8000` with Swagger docs available at `http://localhost:8000/docs`.

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard will run on `http://localhost:3000`.

## 📂 Project Structure

*   `/frontend` - The Next.js web application (Dashboard, Graph Explorer, P&ID Parser, Field Tech UI).
*   `/app` - The FastAPI backend core logic, agent routers, vector store logic, and API endpoints.
*   `/datasets` - Local directory for ingesting PDF manuals and operational data.
*   `main.py` - The FastAPI application entrypoint.

## 🛡 License
This project is proprietary and intended for hackathon demonstration purposes.
