from sqlalchemy import String, Boolean, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.core.db import Base
from app.models.base import TimestampMixin

class UserRole(str, enum.Enum):
    admin = "admin"
    road_service = "road_service"
    resident = "resident"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.resident, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
