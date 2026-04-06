import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.APP_NAME = os.getenv("APP_NAME", "Default App")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")

        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL is not set in environment")

        self.DATABASE_URL = db_url

settings = Settings()