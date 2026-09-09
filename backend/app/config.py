from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Thermal Sentinel API"
    data_mode: str = "demo"
    database_url: str = "sqlite:///./thermal_sentinel.db"
    redis_url: str | None = None
    nasa_firms_api_key: str | None = None
    cors_origins: str = "http://localhost:3000"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
