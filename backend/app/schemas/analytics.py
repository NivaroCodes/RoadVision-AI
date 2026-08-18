from datetime import date
from pydantic import BaseModel

class TrendPoint(BaseModel):
    date: date | str
    count: int
    critical: int | None = 0
    label: str | None = None
