import os
import requests
from typing import List
from langchain_community.document_loaders import CSVLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.documents import Document

PERSIST_DIR = "./chroma_db"
DATA_DIR = "./datasets"
COLLECTION_NAME = "encoders_kb"
OLLAMA_URL = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"


class DirectOllamaEmbeddings(Embeddings):
    """
    Calls the Ollama /api/embed endpoint directly via requests in batches.
    Bypasses the ollama Python package to avoid desktop-app proxy port conflicts.
    Batching (32 texts per call) is ~30x faster than one-by-one embedding.
    """

    def __init__(self, model: str = EMBED_MODEL, base_url: str = OLLAMA_URL, batch_size: int = 32):
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.batch_size = batch_size

    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of texts in one API call using /api/embed."""
        resp = requests.post(
            f"{self.base_url}/api/embed",
            json={"model": self.model, "input": texts},
            timeout=120
        )
        resp.raise_for_status()
        return resp.json()["embeddings"]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed all documents in batches."""
        all_embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i: i + self.batch_size]
            all_embeddings.extend(self._embed_batch(batch))
            print(f"  Embedded {min(i + self.batch_size, len(texts))}/{len(texts)} chunks...", flush=True)
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        return self._embed_batch([text])[0]


def get_embeddings() -> DirectOllamaEmbeddings:
    return DirectOllamaEmbeddings(model=EMBED_MODEL, base_url=OLLAMA_URL)


def load_and_index_data(data_dir: str = DATA_DIR, persist_dir: str = PERSIST_DIR) -> Chroma:
    """
    Loads datasets, splits into chunks, and indexes into Chroma.
    Checks the existing DB document count before loading — rebuilds if empty.
    """
    print(f"Initializing data loader for directory: {data_dir}")
    embeddings = get_embeddings()

    # Load existing DB if it has documents
    if os.path.exists(persist_dir) and os.path.exists(os.path.join(persist_dir, "chroma.sqlite3")):
        print(f"Loading existing vector store from {persist_dir}")
        vs = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings,
            collection_name=COLLECTION_NAME
        )
        count = vs._collection.count()
        print(f"Vector store has {count} documents.")
        if count > 0:
            return vs
        print("Vector store is empty — rebuilding...")

    # Verify data directory has CSV files
    if not os.path.exists(data_dir) or not any(f.endswith(".csv") for f in os.listdir(data_dir)):
        print(f"Warning: No CSV files found in '{data_dir}'. Using placeholder.")
        return Chroma.from_texts(
            ["Placeholder — no dataset loaded yet."],
            embedding=embeddings,
            persist_directory=persist_dir,
            collection_name=COLLECTION_NAME
        )

    documents: List[Document] = []
    loader = DirectoryLoader(
        data_dir,
        glob="**/*.csv",
        loader_cls=CSVLoader,
        loader_kwargs={"encoding": "utf-8"}
    )

    print("Loading documents from directory...")
    try:
        docs = loader.load()
        for doc in docs:
            source_path = doc.metadata.get("source", "unknown")
            doc.metadata["source_file"] = os.path.basename(source_path)
        documents.extend(docs)
        print(f"Loaded {len(documents)} raw documents.")
    except Exception as e:
        print(f"Error loading documents: {e}")
        return Chroma.from_texts(
            ["Error loading dataset."],
            embedding=embeddings,
            persist_directory=persist_dir,
            collection_name=COLLECTION_NAME
        )

    print("Splitting into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    splits = text_splitter.split_documents(documents)
    print(f"Created {len(splits)} chunks. Generating embeddings (this may take a few minutes)...")

    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_name=COLLECTION_NAME
    )

    final_count = vectorstore._collection.count()
    print(f"Indexing complete. {final_count} chunks stored.")
    return vectorstore


def get_retriever():
    """Returns the retriever for the agents — top 5 most relevant chunks."""
    vs = load_and_index_data()
    return vs.as_retriever(search_kwargs={"k": 5})


if __name__ == "__main__":
    print("=== Running standalone data indexing ===")
    vs = load_and_index_data()
    print("\nTesting retrieval for 'F30005 error code'...")
    r = vs.as_retriever(search_kwargs={"k": 3})
    results = r.invoke("F30005 error code")
    print(f"Test query returned {len(results)} documents:")
    for i, doc in enumerate(results):
        print(f"  [{i+1}] Source: {doc.metadata.get('source_file', 'unknown')}")
        print(f"       {doc.page_content[:150]}...")
