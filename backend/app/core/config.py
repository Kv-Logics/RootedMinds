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
    database_url: str = "sqlite+aiosqlite:///./app.db"

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Auth
    secret_key: str = "change-this-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
