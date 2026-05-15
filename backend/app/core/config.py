from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Anvil Hackathon"
    app_version: str = "1.0.0"
    debug: bool = True

    # AI
    gemini_api_key: str = ""
    openai_api_key: str = ""

    # Database
    database_url: str = "postgresql+asyncpg://postgres.fvfohlmwutqdcvvgpabi:tharunpoorna@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
    supabase_url: str = "https://fvfohlmwutqdcvvgpabi.supabase.co"
    supabase_key: str = "sb_publishable_rz0QS4bXXlSClgE-DE7cEQ_3XffG3YS"
    mongodb_url: str = "mongodb+srv://muruga:muruga99@muruga.n9rrdn0.mongodb.net/?appName=muruga"
    # CORS
    frontend_url: str = "http://localhost:3001"

    # Auth
    secret_key: str = "change-this-in-production"
    
    # GitHub PR
    github_token: str = ""
    github_repo: str = ""
    
    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
