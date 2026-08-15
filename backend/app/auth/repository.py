from sqlalchemy.orm import Session
from app.models.user import User
from app.auth.schemas import UserCreate
from app.auth.security import get_password_hash

class UserRepository:
    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def create(self, db: Session, user_in: UserCreate) -> User:
        db_obj = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
