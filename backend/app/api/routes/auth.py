from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import create_user, login_user
from app.api.deps import get_db,get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(
        db,
        user.email,
        user.password,
        user.profile_image_url
    )

    return {
        "id": new_user.id,
        "email": new_user.email,
        "profile_image_url": new_user.profile_image_url
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, user.email, user.password)

    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    existing_user = db.query(User).filter(User.email == user.email).first()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "email": existing_user.email,
            "profile_image_url": existing_user.profile_image_url
        }
    }

@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "profile_image_url": current_user.profile_image_url
    }