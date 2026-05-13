from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import get_settings
import httpx

router = APIRouter()
settings = get_settings()


class ChatRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful AI assistant."
    model: str = "gemini"  # "gemini" or "openai"


class ChatResponse(BaseModel):
    response: str
    model_used: str
    tokens_used: int = 0


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Generic AI chat endpoint. Supports Gemini and OpenAI.
    Switch by setting model="gemini" or model="openai" in the request.
    """
    if req.model == "gemini":
        return await _call_gemini(req)
    elif req.model == "openai":
        return await _call_openai(req)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown model: {req.model}")


async def _call_gemini(req: ChatRequest) -> ChatResponse:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.gemini_api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": req.system_prompt}]},
        "contents": [{"parts": [{"text": req.message}]}],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return ChatResponse(response=text, model_used="gemini-1.5-flash")


async def _call_openai(req: ChatRequest) -> ChatResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": req.system_prompt},
            {"role": "user", "content": req.message},
        ],
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    text = data["choices"][0]["message"]["content"]
    tokens = data["usage"]["total_tokens"]
    return ChatResponse(response=text, model_used="gpt-4o-mini", tokens_used=tokens)


@router.get("/models")
async def list_models():
    """Returns which AI models are configured."""
    return {
        "gemini": bool(settings.gemini_api_key),
        "openai": bool(settings.openai_api_key),
        "available": [
            m for m, ready in [
                ("gemini", bool(settings.gemini_api_key)),
                ("openai", bool(settings.openai_api_key)),
            ] if ready
        ]
    }
