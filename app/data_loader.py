import os
from typing import List
from langchain_community.document_loaders import CSVLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

# Load API key securely from .env before initializing any LangChain components
from app.config import GOOGLE_API_KEY

def load_and_index_data(data_dir: str = "./datasets", persist_dir: str = "./chroma_db") -> Chroma:
    """
    Loads datasets from the given directory, splits them into chunks, 
    and indexes them into a Chroma vector store using Gemini embeddings.
    """
    print(f"Initializing data loader for directory: {data_dir}")
    
    # Initialize Gemini Embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")
    
    # Check if directory exists
    if not os.path.exists(data_dir) or not os.listdir(data_dir):
        print(f"Warning: Directory '{data_dir}' is empty or does not exist.")
        print("Returning an empty vector store placeholder.")
        # Return an empty vector store as a placeholder to prevent crashes
        return Chroma.from_texts(["Placeholder content until real dataset is loaded"], embeddings)

    documents: List[Document] = []
    
    # We use a DirectoryLoader to automatically pick up all CSV files.
    # If the new datasets are PDFs or text files, this loader type can be easily changed.
    loader = DirectoryLoader(
        data_dir, 
        glob="**/*.csv", 
        loader_cls=CSVLoader, 
        loader_kwargs={"encoding": "utf-8"}
    )
    
    print("Loading documents from directory...")
    try:
        docs = loader.load()
        # Add filename metadata for citation purposes in the LLM prompts
        for doc in docs:
            doc.metadata["source_file"] = os.path.basename(doc.metadata.get("source", "unknown"))
        documents.extend(docs)
    except Exception as e:
        print(f"Error loading documents: {e}")
        return Chroma.from_texts(["Error loading real data"], embeddings)

    print(f"Loaded {len(documents)} raw documents. Splitting text...")

    # Split text into manageable chunks to fit into the LLM context window
    # Overlap ensures no semantic meaning is lost at the boundaries
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    splits = text_splitter.split_documents(documents)
    
    print(f"Created {len(splits)} chunks. Generating embeddings and building Vector Store...")

    # Create and return the Chroma Vector Store, persisting it to disk
    vectorstore = Chroma.from_documents(
        documents=splits, 
        embedding=embeddings,
        persist_directory=persist_dir
    )
    vectorstore.persist()
    
    print("Indexing complete. Vector store is ready.")
    return vectorstore

def get_retriever():
    """
    Helper function to get the retriever interface for the agents.
    """
    vs = load_and_index_data()
    # Retrieve the top 4 most relevant chunks for any given query
    return vs.as_retriever(search_kwargs={"k": 4})

if __name__ == "__main__":
    # Test the loader locally
    print("Testing the Data Loader Pipeline...")
    retriever = get_retriever()
    print("Retriever configured successfully.")
