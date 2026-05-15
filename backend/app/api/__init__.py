from fastapi import APIRouter
from app.api.routes import health, ai, items, ingest, stream, reconstruct, pr

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(ai.router,     prefix="/ai",     tags=["AI"])
api_router.include_router(items.router,  prefix="/items",  tags=["Items"])
api_router.include_router(ingest.router, tags=["Ingestion"])
api_router.include_router(stream.router, tags=["Real-time Stream"])
api_router.include_router(reconstruct.router, tags=["Reconstruction"])
api_router.include_router(pr.router,     tags=["GitHub PR"])

