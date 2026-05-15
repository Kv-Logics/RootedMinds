from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

supabase: Client | None = None

if settings.supabase_url and settings.supabase_key:
    supabase = create_client(settings.supabase_url, settings.supabase_key)
    print(f"[OK] Supabase Client Initialized for {settings.supabase_url}")