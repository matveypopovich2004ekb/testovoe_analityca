
from unicodedata import category

from clickhouse_connect.driver.client import Client

class AnalyticRepository():
    """репозиторий приложения для работы с бд"""

    def __init__(self, db_client: Client):
        self.client = db_client

    def get_all_categories(self):
        result = self.client.query(
            """select distinct category from nomenclature
            order by category"""
        )
        return result
        