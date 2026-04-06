from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password
from app.core.security import verify_password, create_access_token
from typing import cast



def create_user(db: Session, email: str, password: str,profile_image_url=None):
    hashed_pw = hash_password(password)
    user = User(email=email, 
                password=hashed_pw,
                profile_image_url=profile_image_url
                )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, cast(str, user.password)):
        return None

    return user


def login_user(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)

    if not user:
        return None

    token = create_access_token({"sub": user.email})
    return token