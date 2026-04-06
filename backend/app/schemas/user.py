from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    profile_image_url: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str