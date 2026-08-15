from datetime import date
from pydantic import BaseModel

class TrendPoint(BaseModel):
    date: date
    count: int
