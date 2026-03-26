from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FirebaseAuthRequest(BaseModel):
    firebase_token: str
    full_name: Optional[str] = None
    photo_url: Optional[str] = None

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    age: Optional[int]
    sex: Optional[str]
    photo_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
