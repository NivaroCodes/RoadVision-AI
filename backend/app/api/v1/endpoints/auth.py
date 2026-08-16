from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.auth.schemas import UserCreate, UserRead, Token, LoginRequest, RefreshRequest
from app.auth.service import AuthService
from app.auth.repository import UserRepository
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

auth_service = AuthService(UserRepository())

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user_in)

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, login_data)
    return auth_service.create_token(user)

@router.post("/refresh", response_model=Token)
def refresh(refresh_data: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_token(db, refresh_data.refresh_token)

@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)) -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)
