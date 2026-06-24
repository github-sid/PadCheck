from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, model_validator

UserRole = Literal["user", "admin"]
UserProvider = Literal["email", "gmail"]


class UserBase(BaseModel):
    email: EmailStr
    display_name: str | None = None


class UserCreate(UserBase):
    password: str | None = Field(default=None, min_length=8)
    provider: UserProvider = "email"

    @model_validator(mode="after")
    def validate_password_for_provider(self) -> "UserCreate":
        if self.provider == "email" and not self.password:
            raise ValueError("password is required for email signups")
        return self


class UserResponse(UserBase):
    id: UUID
    provider: UserProvider = "email"
    role: UserRole = "user"
    created_at: datetime
    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    hashed_password: str | None = None

