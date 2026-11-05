from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://taskflow:taskflow_dev_only@db:5432/taskflow"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
