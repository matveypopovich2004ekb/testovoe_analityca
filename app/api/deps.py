from clickhouse_connect.driver.client import Client


from fastapi import Depends

from app.database.get_client import get_client
from app.service.general_service import AnalyticService


def get_service(client: Client = Depends(get_client)) -> AnalyticService:
    return AnalyticService(db_client=client)
