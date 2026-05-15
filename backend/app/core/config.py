from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Anvil Hackathon"
    app_version: str = "1.0.0"
    debug: bool = True

    # AI
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Database
    database_url: str = "sqlite+aiosqlite:///./app.db"
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    mongodb_url: Optional[str] = None

    # CORS
    frontend_url: str = "http://localhost:3001"

    # Auth
    secret_key: str = "change-this-in-production"
    
    # GitHub PR
    github_token: Optional[str] = None
    github_repo: Optional[str] = None
    
    # Environment
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
