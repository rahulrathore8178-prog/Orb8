from io import BytesIO
import time as time
from huggingface_hub import InferenceClient
import base64
from io import BytesIO
from PIL import Image, ImageOps
from rag_search import client

hf_client = InferenceClient(
    api_key="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",
)
print("Sending request please wait...")
post_data_collection = client.get_or_create_collection(name="Orb8-posts-data")

MAX_SIDE = 1280      # longest side in pixels; VLMs downscale internally anyway
JPEG_QUALITY = 85

def prepare_image(image_bytes: bytes) -> tuple[bytes, str]:
    """Shrink + re-encode any uploaded image as a compact JPEG."""
    img = Image.open(BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)  # respect phone-camera rotation
 
    # JPEG has no alpha channel: flatten transparency onto white
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    else:
        img = img.convert("RGB")
 
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)  # keeps aspect ratio, never upscales
 
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buf.getvalue(), "image/jpeg"



def describe_image(image_bytes: bytes, analysis_prompt: str, mime_type: str = "image/jpeg") -> str:
    image_bytes, mime_type = prepare_image(image_bytes)  # resize/compress step from before
    data_uri = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode()}"

    last_err = None
    for attempt in range(3):
        try:
            completion = hf_client.chat.completions.create(
    model="Qwen/Qwen3-VL-8B-Instruct:featherless-ai",  # <-- suffix required
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": analysis_prompt},
                {"type": "image_url", "image_url": {"url": data_uri}},
            ],
        }
    ],
)
            print (f'done: {completion.choices[0].message.content}')
            data = completion.choices[0].message.content
            results = post_data_collection.query(
                    query_texts=[data], n_results=5, where={"source": "post"}, include=["documents", "metadatas"]
                )
            return data
        except Exception as e:
            last_err = e
            print(f"Attempt {attempt + 1} failed: {e!r}")
            time.sleep(1.5 * (attempt + 1))  # brief backoff before retrying

    raise last_err