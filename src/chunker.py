import re
import time
import uuid
from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.utils import setup_logger

logger = setup_logger(__name__)

class DocumentChunker:
    """
    Handles text cleaning and intelligent chunking of LangChain Document objects.
    Ensures that large industrial manuals are broken down into semantically meaningful,
    retrievable pieces while preserving source metadata.
    """
    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 150):
        """
        Initializes the chunker.
        
        Args:
            chunk_size (int): Maximum number of characters per chunk.
            chunk_overlap (int): Number of characters to overlap between chunks to preserve context.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Initialize the LangChain recursive text splitter
        # This splitter tries to split on double newlines first, then single newlines, then spaces.
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        
    def _clean_text(self, text: str) -> str:
        """
        Cleans the input text by normalizing whitespace and line breaks,
        while strictly preserving the original technical meaning.
        
        Args:
            text (str): Raw text from the document.
            
        Returns:
            str: Cleaned text.
        """
        if not text:
            return ""
            
        # Replace multiple horizontal spaces or tabs with a single space
        cleaned = re.sub(r'[ \t]+', ' ', text)
        
        # Normalize multiple vertical newlines to a maximum of two (paragraph break)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        
        # Strip leading and trailing whitespace
        return cleaned.strip()

    def process_documents(self, documents: List[Document]) -> List[Document]:
        """
        Cleans and chunks a list of LangChain Documents.
        
        Args:
            documents (List[Document]): The raw input documents loaded by the ingestion module.
            
        Returns:
            List[Document]: The chunked documents with preserved metadata and unique IDs.
        """
        if not documents:
            logger.warning("No documents provided for chunking.")
            return []
            
        logger.info(f"Starting cleaning and chunking process for {len(documents)} document(s)...")
        start_time = time.time()
        
        chunked_documents: List[Document] = []
        total_length = 0
        
        for doc in documents:
            # 1. Clean the text
            cleaned_text = self._clean_text(doc.page_content)
            
            # 2. Split the text into chunks
            chunks = self.text_splitter.split_text(cleaned_text)
            
            # 3. Create new Document objects for each chunk and preserve metadata
            for i, chunk_text in enumerate(chunks):
                # Shallow copy to preserve original metadata (filename, page, etc.)
                new_metadata = doc.metadata.copy()
                
                # Add chunk-specific metadata
                new_metadata["chunk_id"] = str(uuid.uuid4())
                new_metadata["chunk_index"] = i
                
                chunk_doc = Document(page_content=chunk_text, metadata=new_metadata)
                chunked_documents.append(chunk_doc)
                
                total_length += len(chunk_text)
                
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        num_chunks = len(chunked_documents)
        avg_length = total_length / num_chunks if num_chunks > 0 else 0
        
        # 4. Log the chunking summary
        logger.info("--- Chunking Summary ---")
        logger.info(f"Input documents: {len(documents)}")
        logger.info(f"Output chunks: {num_chunks}")
        logger.info(f"Average chunk length: {avg_length:.1f} characters")
        logger.info(f"Chunking time: {elapsed_time:.2f} seconds")
        logger.info("------------------------")
        
        return chunked_documents
