from sqlalchemy import String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.core.db import Base
from app.models.base import TimestampMixin

class UserRole(str, enum.Enum):
    inspector = "inspector"
    dispatcher = "dispatcher"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.inspector, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
