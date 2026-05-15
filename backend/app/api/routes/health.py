from fastapi import APIRouter
from app.core.config import get_settings
import time
from sqlalchemy import text
from app.database import engine
from app.mongodb import mongo_client

router = APIRouter()
settings = get_settings()
START_TIME = time.time()


@router.get("")
async def health_check():
    db_status = {"postgres": "unknown", "mongodb": "unknown"}
    
    # Check Postgres (Supabase)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status["postgres"] = "connected"
    except Exception as e:
        db_status["postgres"] = f"error: {str(e)}"
        
    # Check MongoDB
    try:
        if mongo_client is not None:
            mongo_client.admin.command('ping')
            db_status["mongodb"] = "connected"
        else:
            db_status["mongodb"] = "not_initialized"
    except Exception as e:
        db_status["mongodb"] = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status["postgres"] == "connected" and db_status["mongodb"] == "connected" else "degraded",
        "app": settings.app_name,
        "version": settings.app_version,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "databases": db_status
    }
