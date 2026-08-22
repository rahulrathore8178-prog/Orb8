import os
import uuid
from chunking import extract_text, chunk_text
import chromadb
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# import ollama
from groq import Groq
import json
import sys
import asyncio
import base64
import io
from fastapi import HTTPException
from fastapi import UploadFile
from rag_search import run_platform_search, collection
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = FastAPI()
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Step 3: the endpoint your React frontend calls ----------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_bytes = await file.read()

    # 1. File -> plain text (Chroma never sees the raw file)
    raw_text = extract_text(file.filename, file_bytes)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from this file")

    # 2. Plain text -> chunks
    chunks = chunk_text(raw_text)

    # 3. Chunks -> ChromaDB (embedding + storage happens automatically inside .add)
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {"source": file.filename, "chunk_index": i}
        for i in range(len(chunks))
    ]
    collection.add(documents=chunks, metadatas=metadatas, ids=ids)

    return {
        "filename": file.filename,
        "chunks_created": len(chunks),
        "message": "File processed and stored in ChromaDB",
    }


# --- Bonus: a query endpoint, so React can also ask questions ------------
# @app.get("/ask")
# async def ask(question: str, source: str | None = None):
#     where_filter = {"source": source} if source else None
#     results = collection.query(query_texts=[question], n_results=5, where=where_filter)
    
# #     response = await ollama.chat(
# #     model='llama3.2:3b',
# #     messages=[
# #         {
# #             'role': 'user',
# #             'content': 'why is the sky blue?'
# #         },
# #     ],
# # )

# print(response['message']['content'])

#     return [
#         {"text": doc, "source": meta["source"]}
#         for doc, meta in zip(results["documents"][0], results["metadatas"][0])
#     ]

"""
Agentic RAG version of /askPrompt.

Assumes `app`, `collection`, and `groq_client` are already defined/initialized
elsewhere in your codebase exactly as in your current file — this snippet is
meant to REPLACE your existing `ask_prompt` function (plus add the two helper
pieces above it).
"""



# ---------------------------------------------------------------------------
# 1. Tool definition — this is what lets the model *choose* to call the RAG
# ---------------------------------------------------------------------------
SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search_platform_knowledge",
        "description": (
            "Search the internal document knowledge base for specific facts, data, "
            "or figures found in the uploaded documents (e.g. textbooks, personal "
            "records, reports, results). Use this whenever the question could "
            "plausibly be answered by looking something up in those documents — "
            "including personal/specific data like exam results or scores, or "
            "detailed subject-matter content from the reference material. Do NOT "
            "use it for purely general knowledge questions unrelated to any "
            "uploaded document."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "A focused search query for the knowledge base. "
                        "Rephrase the user's question into a good search "
                        "query if that helps retrieval."
                    ),
                }
            },
            "required": ["query"],
        },
    },
}

SYSTEM_PROMPT = """You are a personal assistant for user "Vivek".

You have access to a `search_platform_knowledge` tool that searches internal
documentation about how this specific platform works (features, settings,
policies, workflows).

Rules:
- If the user's question is about about anything that you dont know about or if the user asks something explicit(e.g. 'what's my score in physics', ''how are my academics?', etc.) then you must call the tool to search relevant knowledge base for an answer, if you dont get any then you can say i dont know.
- If the user's question is general knowledge or just a normal conversation(e.g. "what is the capital of France?, "how do I make a post?", etc.) answer directly from your own
  knowledge WITHOUT calling the tool.
- Never refuse or say you don't know just because the tool wasn't used, use the tool first find possible answers if you dont get any then — fall back to your own knowledge.
- Keep answers concise, direct, and helpful.
"""


# ---------------------------------------------------------------------------
# 3. The endpoint — LLM decides whether to call the tool, we execute it if so
# ---------------------------------------------------------------------------
@app.get('/askPrompt')
async def ask_prompt(question: str, source: str | None = None):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    all_sources: list[str] = []
    MAX_TOOL_HOPS = 3  # safety cap in case the model loops on tool calls

    for _ in range(MAX_TOOL_HOPS):
        response = groq_client.chat.completions.create(
            model='qwen/qwen3.6-27b',
            messages=messages,
            tools=[SEARCH_TOOL],
            tool_choice="auto",
            temperature=0.6,
            max_completion_tokens=2048,
            top_p=0.95,
            reasoning_effort="default",
        )

        msg = response.choices[0].message
        tool_calls = getattr(msg, "tool_calls", None)

        # Model answered directly -> no RAG needed, this was a general question
        if not tool_calls:
            return {
                "question": question,
                "answer": (msg.content or "").strip(),
                "sources": all_sources,  # empty list if RAG was never used
            }

        # Model wants to search -> record its tool-call request in the history
        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [tc.model_dump() for tc in tool_calls],
        })

        # Execute every requested tool call and feed results back
        for tc in tool_calls:
            try:
                args = json.loads(tc.function.arguments)
            except (json.JSONDecodeError, TypeError):
                args = {}
            search_query = args.get("query", question)

            context_text, sources = run_platform_search(search_query, source)
            for s in sources:
                if s not in all_sources:
                    all_sources.append(s)

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": context_text,
            })
        # loop back around so the model can read the tool result and respond
        # (or, rarely, decide it needs to search again)

    # If it somehow never converges within MAX_TOOL_HOPS
    raise HTTPException(
        status_code=500,
        detail="The assistant could not produce an answer after multiple tool calls.",
    )


if __name__ == "__main__":
    request = json.load(sys.stdin)
    if request.get("action") == "remember":
        file_data = request.get("file") or {}
        uploaded_file = UploadFile(
            filename=file_data.get("filename", "uploaded-file"),
            file=io.BytesIO(base64.b64decode(file_data["data"])),
        )
        result = asyncio.run(upload_file(uploaded_file))
    else:
        result = asyncio.run(ask_prompt(request.get("prompt", "")))
    print(json.dumps(result), flush=True)