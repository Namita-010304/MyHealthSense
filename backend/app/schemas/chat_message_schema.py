from pydantic import BaseModel
from datetime import datetime

class ChatMessageCreate(BaseModel):
    role: str
    content: str

class ChatMessageResponse(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
