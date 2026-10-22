from pydantic import BaseModel, ConfigDict

class CategoriesRead(BaseModel):
    categories: list[str]
    