from app.models.defect import Defect
from app.models.user import User

# This file is used to import all models so Alembic can discover them
__all__ = ["Defect", "User"]
