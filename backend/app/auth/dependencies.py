from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from pydantic import ValidationError

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User, UserRole
from app.auth.repository import UserRepository
from app.auth.schemas import TokenPayload

security = HTTPBearer()
user_repo = UserRepository()

def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    try:
        payload = jwt.decode(
            token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
        
    if token_data.type != "access":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token type")
        
    if token_data.sub is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token subject")
        
    user = user_repo.get_by_id(db, user_id=int(token_data.sub))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user

def require_inspector(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.inspector:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user

def require_dispatcher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.dispatcher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user
