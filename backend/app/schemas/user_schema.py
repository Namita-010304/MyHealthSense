from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    wake_up_time: Optional[str] = None
    sleep_time: Optional[str] = None
    meals_per_day: Optional[int] = None
    exercise_frequency: Optional[int] = None
    water_intake: Optional[int] = None
    medical_conditions: Optional[str] = None
    health_goals: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    wake_up_time: Optional[str] = None
    sleep_time: Optional[str] = None
    meals_per_day: Optional[int] = None
    exercise_frequency: Optional[int] = None
    water_intake: Optional[int] = None
    medical_conditions: Optional[str] = None
    health_goals: Optional[str] = None
    created_at: str
