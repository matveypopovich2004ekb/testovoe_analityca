from datetime import date
from pydantic import BaseModel

class CategoriesRead(BaseModel):
    categories: list[str]



class RealizationRead(BaseModel):
    date: date
    product: str
    price: float


class PriceSegmentRead(BaseModel):
    name: str
    min_price: float
    max_price: float


class PricesRead(BaseModel):
    category: str | None
    min_price: float | None
    max_price: float | None
    segments: list[PriceSegmentRead]
    realizations: list[RealizationRead]
