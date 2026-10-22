from fastapi import APIRouter, Depends

from app.api.deps import get_service
from app.schemas.all_schemas import CategoriesRead
from app.service.general_service import AnalyticService

router = APIRouter(prefix='/api')


@router.get('/categories')
def get_category_list(service: AnalyticService = Depends(get_service)) -> CategoriesRead:
    result = service.get_categories()
    return result
