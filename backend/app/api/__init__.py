from fastapi import APIRouter
from app.api.routes import health, ai, items

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(ai.router,     prefix="/ai",     tags=["AI"])
api_router.include_router(items.router,  prefix="/items",  tags=["Items"])
