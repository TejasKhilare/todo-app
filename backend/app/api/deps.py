from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token=credentials.credentials
    payload = decode_access_token(token)

    email = payload.get("sub")
    if email is None:
        raise Exception("Invalid token payload")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise Exception("User not found")

    return user