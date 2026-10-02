import json
import os
import uuid
from fastapi.concurrency import run_in_threadpool
import uvicorn
from chunking import extract_text, chunk_text
import chromadb
from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field
import json
import sys
import asyncio
import base64
import io
from rag_search import run_platform_search, collection
from dotenv import load_dotenv
from visual_model import describe_image, post_data_collection

load_dotenv()  # Load environment variables from .env file

app = FastAPI()
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://orb8-ochre.vercel.app", "https://orb8.onrender.com", "https://orb8-python.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/postdata")
async def analyze_post(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    post_id: str = Form(None),
):
    post_id = post_id or str(uuid.uuid4())
    print(f"Received post with ID: {post_id}, prompt: {prompt}, file: {file.filename}")
    image_bytes = await file.read()

    raw = await run_in_threadpool(describe_image, image_bytes, prompt)
    parsed = json.loads(raw)
    parsed["post_id"] = post_id 

    await run_in_threadpool(
        post_data_collection.upsert,
        ids=[post_id],
        documents=[json.dumps(parsed)],
        metadatas=[{"source": "post", "post_id": post_id}],
    )

    return {"post_id": post_id, "answer": parsed}


# --- Step 3: the endpoint your React frontend calls ----------------------
@app.post("/remember")
async def upload_file(file: UploadFile = File(...)):
    file_bytes = await file.read()

    # 1. File -> plain text
    raw_text = extract_text(file.filename, file_bytes)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from this file")

    # 2. Plain text -> chunks
    chunks = chunk_text(raw_text)

    # 3. Chunks -> Orb8 (general knowledge)
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {"source": file.filename, "chunk_index": i}
        for i in range(len(chunks))
    ]
    await run_in_threadpool(
        collection.add, documents=chunks, metadatas=metadatas, ids=ids
    )

    return {
        "filename": file.filename,
        "chunks_created": len(chunks),
        "message": "File processed and stored in ChromaDB",
    }



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

SYSTEM_PROMPT = """You are a personal assistant for user.

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

class AskRequest(BaseModel):
    question: str
    source: str | None = None
    history: list[dict[str, str]] = Field(default_factory=list)
print("AskRequest initialized", {AskRequest})
# ---------------------------------------------------------------------------
# 3. The endpoint — LLM decides whether to call the tool, we execute it if so
# ---------------------------------------------------------------------------
@app.post('/askPrompt')
async def ask_prompt(req: AskRequest):
    print(f"Received request: {req}")
    question = req.question
    source = req.source
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.question},
    ]

    all_sources: list[str] = []
    MAX_TOOL_HOPS = 3  # safety cap in case the model loops on tool calls

    for _ in range(MAX_TOOL_HOPS):
        response = groq_client.chat.completions.create(
            model='qwen/qwen3.8-27b',
            messages=messages,
            tools=[SEARCH_TOOL],
            tool_choice="auto",
            temperature=0.6,
            max_completion_tokens=524,
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
            
#     system_prompt = '''You are the content-understanding engine of a social media recommendation system.
# Input: a post's media (image, or frames sampled from a video) plus optional caption,
# hashtags, and speech transcript. Analyze what the post is actually about and return
# ONE JSON object. Output only JSON: no markdown, no code fences, no commentary.

# Schema:
# {
#   "summary": string,        // 1-2 factual sentences: what is shown, said, and taught
#   "language": string,       // ISO 639-1 code of the main spoken/written language, "none" if no language
#   "format": string,         // one of: tutorial, demo, meme, skit, news, opinion, vlog, showcase, promo, other
#   "topics": { string: number },   // topic -> relevance
#   "attributes": { "educational": number, "entertainment": number, "motivational": number, "emotional": number },
#   "keywords": [string],     // 5-10 specific lowercase terms (tools, concepts, entities), no generic words
#   "safety": { "nsfw": number, "violence": number, "hate": number }
# }

# Rules:
# - All scores are 0.00-1.00 with two decimals. They are independent and need not sum to 1.
#   0 = absent, 0.5 = present but secondary, 1 = dominant theme.
# - topics: use ONLY these labels: technology, ai, programming, gaming, comedy, education,
#   science, business, finance, fitness, health, food, travel, music, sports, fashion, art,
#   news, politics, lifestyle, other. Include only topics scoring >= 0.30, at most 5.
# - Judge from visible content, on-screen text, transcript, and caption. If media and caption
#   disagree, trust the media. Never invent details or identify people from their faces.
# - If unsure, lower the score rather than guess.
# - The output must parse with json.loads.'''

@app.post("/describe_image")
async def describe_image_endpoint(
    file: UploadFile = File(...),
    post_id: str = Form(...),
    prompt: str = Form(...),
):
    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
 
    image_bytes = await file.read()
    print(f"Received image of size {len(image_bytes)} bytes with MIME type {mime_type}")
 
    try:
        raw = await run_in_threadpool(describe_image, image_bytes, prompt, mime_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image model request failed: {e}")

    # Defensive cleanup: some models wrap output in ```json fences even when told not to
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Model returned invalid JSON: {e}")

    return {"answer": parsed}








if __name__ == "__main__":
    # Check if "serve" was passed as an argument (e.g., python main.py serve)
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        uvicorn.run("main:app", port=8000, reload=True)
        
    else:
        # Otherwise, default to processing the stdin JSON request
        try:
            request = json.load(sys.stdin)
            if request.get("action") == "remember":
                file_data = request.get("file") or {}
                uploaded_file = UploadFile(
                    filename=file_data.get("filename", "uploaded-file"),
                    file=io.BytesIO(base64.b64decode(file_data["data"])),
                )
                result = asyncio.run(upload_file(uploaded_file))
            else:
                req = AskRequest(**request)
                result = asyncio.run(ask_prompt(req))
            
            print(json.dumps(result), flush=True)
            
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON input"}), flush=True)
            
            
            
            
            
            
            
            
            
            
            
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