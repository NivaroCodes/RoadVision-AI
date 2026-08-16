from collections.abc import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth.repository import UserRepository
from app.auth.schemas import TokenPayload
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User, UserRole

security = HTTPBearer(auto_error=False)
user_repo = UserRepository()


def unauthorized(detail: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials | None = Depends(security),
) -> User:
    if token is None:
        raise unauthorized()
    try:
        payload = jwt.decode(token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
        if token_data.type != "access" or token_data.sub is None:
            raise unauthorized("Invalid access token")
        user_id = int(token_data.sub)
    except (jwt.PyJWTError, ValidationError, ValueError):
        raise unauthorized("Could not validate credentials")

    user = user_repo.get_by_id(db, user_id=user_id)
    if user is None or not user.is_active:
        raise unauthorized("User is unavailable")
    return user


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency


require_admin = require_roles(UserRole.admin)
require_staff = require_roles(UserRole.admin, UserRole.road_service)
require_submitter = require_roles(UserRole.admin, UserRole.resident)
