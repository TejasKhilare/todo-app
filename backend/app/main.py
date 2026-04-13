from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.session import engine
from app.db.base import Base
from app.core.config import settings
from app.api.deps import get_db
from app.api.deps import get_current_user
import time
from contextlib import asynccontextmanager
from app.api.routes import auth, task
from app.api.routes import upload
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Waiting for DB")

    MAX_RETRIES = 10
    WAIT_SECONDS = 2

    for attempt in range(MAX_RETRIES):
        try:
            conn = engine.connect()
            conn.close()
            print("Database connected successfully")
            break
        except Exception as e:
            print(f"DB not ready ({attempt + 1})... retrying")
            time.sleep(WAIT_SECONDS)
    else:
        raise Exception("Database never became ready")

    # Safe to initialize tables
    Base.metadata.create_all(bind=engine)

    yield

    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(task.router,prefix='/tasks',tags=['Tasks'])
app.include_router(upload.router, prefix="/files", tags=["Upload"])

@app.get("/")
def root():
    return {"message": "API running"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB session working"}

@app.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
        "message": "You are authenticated",
        "user": user.email
    }