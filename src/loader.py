import os
from pathlib import Path
from typing import List, Type, Dict, Any

from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)

from src.config import config
from src.utils import setup_logger

logger = setup_logger(__name__)

# Mapping of file extensions to their respective LangChain document loaders
LOADER_MAPPING: Dict[str, Type[Any]] = {
    ".pdf": PyPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": TextLoader,
    ".md": TextLoader,  # Using TextLoader for simplicity; can swap to UnstructuredMarkdownLoader if needed
}

class DocumentIngestor:
    """
    Handles scanning a directory and ingesting supported documents.
    Provides resilient parsing, skipping corrupted files, and maintains metadata.
    """
    def __init__(self, data_dir: str | Path = config.DATA_DIR):
        """
        Initializes the ingestor with the target data directory.
        """
        self.data_dir = Path(data_dir)
        
    def ingest_file(self, file_path: str | Path) -> List[Document]:
        """
        Loads a single document file and returns a list of LangChain Documents.
        
        Args:
            file_path (str | Path): Path to the target document file.
            
        Returns:
            List[Document]: Parsed document objects with enhanced metadata.
        """
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            logger.error(f"File does not exist: {path}")
            return []

        ext = path.suffix.lower()
        if ext not in config.SUPPORTED_EXTENSIONS:
            logger.warning(f"Unsupported file extension '{ext}' for file: {path.name}")
            return []

        loader_class = LOADER_MAPPING.get(ext)
        if not loader_class:
            logger.warning(f"No loader configured for extension '{ext}'")
            return []

        try:
            logger.info(f"Ingesting single file: {path.name}")
            loader = loader_class(str(path))
            docs = loader.load()

            for doc in docs:
                doc.metadata["filename"] = path.name
                doc.metadata["file_type"] = ext

            logger.info(f"Successfully ingested {path.name} ({len(docs)} page/section objects)")
            return docs
        except Exception as e:
            logger.error(f"Failed to ingest file {path.name}: {e}")
            return []

    def ingest_directory(self) -> List[Document]:

        """
        Scans the data directory, loads supported files, and returns a list of Langchain Documents.
        
        Returns:
            List[Document]: A list containing the parsed documents and their metadata.
        """
        if not self.data_dir.exists() or not self.data_dir.is_dir():
            logger.error(f"Data directory does not exist or is not a directory: {self.data_dir}")
            return []

        all_documents: List[Document] = []
        stats = {
            "discovered": 0,
            "loaded": 0,
            "skipped": 0,
            "error": 0
        }

        logger.info(f"Scanning directory for documents: {self.data_dir}")

        for root, _, files in os.walk(self.data_dir):
            for file in files:
                stats["discovered"] += 1
                file_path = Path(root) / file
                ext = file_path.suffix.lower()

                if ext not in config.SUPPORTED_EXTENSIONS:
                    logger.debug(f"Skipping unsupported file type: {file_path.name}")
                    stats["skipped"] += 1
                    continue

                logger.info(f"Loading file: {file_path.name}")
                try:
                    loader_class = LOADER_MAPPING.get(ext)
                    if not loader_class:
                        logger.warning(f"No loader configured for extension '{ext}'. Skipping.")
                        stats["skipped"] += 1
                        continue
                    
                    # Initialize the specific loader for the file
                    loader = loader_class(str(file_path))
                    docs = loader.load()
                    
                    # Enhance metadata (preserving existing metadata like page_content or source)
                    for doc in docs:
                        doc.metadata["filename"] = file_path.name
                        doc.metadata["file_type"] = ext
                        
                        # Note: 'source' and 'page' are often added automatically by loaders like PyPDFLoader
                    
                    all_documents.extend(docs)
                    stats["loaded"] += 1
                    logger.debug(f"Successfully loaded {file_path.name} ({len(docs)} logical chunks/pages)")
                
                except Exception as e:
                    logger.error(f"Failed to load {file_path.name}. Error: {str(e)}")
                    stats["error"] += 1
                    continue

        self._log_summary(stats, len(all_documents))
        return all_documents

    def _log_summary(self, stats: Dict[str, int], total_docs: int) -> None:
        """Logs the summary of the ingestion process."""
        logger.info("--- Ingestion Summary ---")
        logger.info(f"Files discovered: {stats['discovered']}")
        logger.info(f"Files successfully loaded: {stats['loaded']}")
        logger.info(f"Files skipped (unsupported): {stats['skipped']}")
        logger.info(f"Files failed (errors): {stats['error']}")
        logger.info(f"Total LangChain Document objects generated: {total_docs}")
        logger.info("-------------------------")
