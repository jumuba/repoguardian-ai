from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RepoGuardian AI API"
    database_url: str = "sqlite:///./repoguardian.db"
    frontend_url: str = "http://localhost:3000"
    github_client_id: str = ""
    github_client_secret: str = ""
    token_encryption_key: str = ""
    openai_api_key: str = ""
    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
