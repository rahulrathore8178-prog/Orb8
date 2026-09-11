import ollama

response = ollama.chat(
    model='llama3.2:3b',
    messages=[
        {
            'role': 'user',
            'content': 'why is the sky blue?'
        },
    ],
)

print(response['message']['content'])


@app.get('/askPrompt')
@app.get('/askPromt')
async def ask_prompt(question: str, source: str | None = None):
    where_filter = {"source": source} if source else None
    results = collection.query(query_texts=[question], n_results=5, where=where_filter)

    if not results.get("documents") or not results["documents"][0]:
        raise HTTPException(status_code=404, detail="No relevant document chunks found for this question.")

    prompt = build_prompt(question, results)
    response = ollama.chat(
        model='llama3.2:3b',
        messages=[
            {
                'role': 'user',
                'content': prompt,
            }
        ],
    )

    answer = response["message"]["content"].strip()
    sources = [
        meta.get("source", "unknown source")
        for meta in results["metadatas"][0]
    ]

    return {
        "question": question,
        "answer": answer,
        "sources": sources,
    }