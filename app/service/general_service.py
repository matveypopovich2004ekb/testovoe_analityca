from clickhouse_connect.driver.client import Client

from app.repository.general_repository import AnalyticRepository
from app.schemas.all_schemas import CategoriesRead

class AnalyticService():
    """сервис для реализиции основной логики и валидаций"""

    def __init__(self, db_client: Client):
        self.client = db_client
        self.repository = AnalyticRepository(db_client)

    def get_categories(self) -> CategoriesRead:
        result = self.repository.get_all_categories()
        clean_result = [category[0] for category in result.result_rows ]
        return CategoriesRead(categories=clean_result)
    