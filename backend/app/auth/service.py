from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import jwt
from pydantic import ValidationError

from app.core.config import settings
from app.auth.repository import UserRepository
from app.auth.schemas import UserCreate, LoginRequest, Token, TokenPayload
from app.auth.security import verify_password, create_access_token, create_refresh_token
from app.models.user import User

class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        user = self.repository.get_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        return self.repository.create(db, user_in)

    def authenticate(self, db: Session, login_data: LoginRequest) -> User:
        user = self.repository.get_by_email(db, email=login_data.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        return user

    def create_token(self, user: User) -> Token:
        return Token(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
            token_type="bearer"
        )

    def refresh_token(self, db: Session, refresh_token: str) -> Token:
        try:
            payload = jwt.decode(
                refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
        except (jwt.PyJWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
            
        if token_data.type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token type",
            )
            
        if token_data.sub is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token subject")
            
        user = self.repository.get_by_id(db, user_id=int(token_data.sub))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
            
        return self.create_token(user)
