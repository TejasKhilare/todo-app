from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine (no retry here)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # helps detect stale connections
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)