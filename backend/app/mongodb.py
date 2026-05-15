from pymongo import MongoClient
from app.core.config import get_settings

settings = get_settings()

mongo_client = None
mongo_db = None

if settings.mongodb_url:
    try:
        mongo_client = MongoClient(settings.mongodb_url)
        mongo_db = mongo_client.get_database("sentinel")
        print("[OK] MongoDB Connected successfully")
    except Exception as e:
        print(f"[ERROR] MongoDB Connection failed: {e}")