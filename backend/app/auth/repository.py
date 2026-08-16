from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.auth.schemas import UserCreate, UserUpdate
from app.auth.security import get_password_hash

class UserRepository:
    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def create(self, db: Session, user_in: UserCreate) -> User:
        db_obj = User(
            email=str(user_in.email).lower(),
            hashed_password=get_password_hash(user_in.password),
            role=UserRole.resident,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_all(self, db: Session) -> list[User]:
        return db.query(User).order_by(User.created_at.desc()).all()

    def update(self, db: Session, user: User, user_in: UserUpdate) -> User:
        for field, value in user_in.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return user
