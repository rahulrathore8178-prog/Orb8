import chromadb


# --- ChromaDB setup (runs once, when the server starts) -----------------
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="documents")

# ---------------------------------------------------------------------------
# 2. Retrieval helper — same chroma query you already had, just factored out
# ---------------------------------------------------------------------------
def run_platform_search(query: str, source: str | None = None, n_results: int = 5):
    """Runs the vector search and returns (context_text, sources_list)."""
    where_filter = {"source": source} if source else None
    results = collection.query(
        query_texts=[query], n_results=n_results, where=where_filter
    )

    docs = results.get("documents", [[]])[0] if results.get("documents") else []
    metas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []

    if not docs:
        return (
            "No relevant documents were found in the knowledge base for this query.",
            [],
        )

    context_chunks = []
    sources = []
    for doc, meta in zip(docs, metas):
        src = (meta or {}).get("source", "unknown source")
        sources.append(src)
        context_chunks.append(f"[Source: {src}]\n{doc}")

    return "\n\n---\n\n".join(context_chunks), sources