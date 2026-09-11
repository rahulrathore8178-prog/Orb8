import pymupdf as fitz 
from io import BytesIO
from importlib import import_module
import pytesseract
from pytesseract import TesseractNotFoundError
import sys
from PIL import Image
from fastapi import HTTPException

try:
    register_heif_opener = import_module("pillow_heif").register_heif_opener
except ImportError:
    register_heif_opener = None

if register_heif_opener:
    register_heif_opener()

# --- Step 1: extract plain text out of whatever file type came in -------
def extract_text(filename: str, file_bytes: bytes) -> str:
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text

    elif ext in ("jpg", "jpeg", "png", "webp", "gif", "bmp", "tif", "tiff", "heic", "heif"):
        try:
            with Image.open(BytesIO(file_bytes)) as image:
                # RGB avoids OCR issues with palette, grayscale, and alpha images.
                extracted_text = pytesseract.image_to_string(image.convert("RGB"))
        except TesseractNotFoundError as error:
            raise HTTPException(
                status_code=503,
                detail="Image OCR is unavailable because Tesseract is not installed or not on PATH",
            ) from error
        except (OSError, ValueError) as error:
            if ext in ("heic", "heif") and register_heif_opener is None:
                raise HTTPException(
                    status_code=400,
                    detail="HEIC/HEIF images require the pillow-heif package",
                ) from error
            raise HTTPException(
                status_code=400,
                detail=f"Could not read image file: {error}",
            ) from error

        print(f"Extracted text from image: {extracted_text}", file=sys.stderr)
        return extracted_text

    elif ext == "txt":
        return file_bytes.decode("utf-8", errors="ignore")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")


# --- Step 2: split raw text into smaller overlapping chunks -------------
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start = end - overlap  # overlap keeps context between chunks
    return [c for c in chunks if c.strip()]

def build_prompt(question: str, results: dict) -> str:
    context_blocks = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        source = meta.get("source", "unknown source")
        context_blocks.append(f"Source: {meta['source']}\n{doc}")
        
    context = "\n\n".join(context_blocks)
    
    prompt = f"""You are a helpful assistant. Answer the question using ONLY the context below.
If the answer is not contained in the context, say "I don't have enough information to answer that."
Do not use outside knowledge. When relevant, mention which source the answer came from. Try to elaborate the answer a little bit, but do not make up information. If the context contains multiple sources, you can combine information from them to answer the question."
 
Context:
{context}
 
Question: {question}
 
Answer:"""
    return prompt