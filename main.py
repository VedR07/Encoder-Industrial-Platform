"""
main.py
-------
Main entrypoint to start the Industrial Encoder RAG & Backend REST API server.

Usage:
    .venv\\Scripts\\python main.py
"""

import uvicorn
from src.config import config
from src.utils import setup_logger

logger = setup_logger(__name__)

if __name__ == "__main__":
    logger.info(f"Starting Industrial Encoder RAG Backend on http://{config.API_HOST}:{config.API_PORT}")
    logger.info(f"Swagger API Documentation available at http://localhost:{config.API_PORT}/docs")
    
    uvicorn.run(
        "src.api:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=False
    )
