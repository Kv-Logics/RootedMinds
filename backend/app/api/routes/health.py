from fastapi import APIRouter
from app.core.config import get_settings
import time

router = APIRouter()
settings = get_settings()
START_TIME = time.time()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "uptime_seconds": round(time.time() - START_TIME, 2),
    }
