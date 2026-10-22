from clickhouse_connect.driver.client import Client

from app.repository.general_repository import AnalyticRepository
from app.schemas.all_schemas import CategoriesRead, PricesRead, PriceSegmentRead, RealizationRead

class AnalyticService():
    """сервис для реализиции основной логики и валидаций"""

    def __init__(self, db_client: Client):
        self.client = db_client
        self.repository = AnalyticRepository(db_client)

    def get_categories(self) -> CategoriesRead:
        result = self.repository.get_all_categories()
        rows = result.result_rows
        clean_result = [category[0] for category in rows ]
        return CategoriesRead(categories=clean_result)


    @staticmethod # тут считаем шаг для сегментации
    def calculate_step(min_price, max_price):
        return (max_price - min_price) / 5

    @staticmethod #тут делаем саму сегментацию
    def create_segments(min_price, step) -> list[PriceSegmentRead]:
        if step <= 0:
            return []
        names = ["Бюджет", "Эконом", "Стандарт", "Премиум", "Люкс"]
        segments = []

        for i, name in enumerate(names):
            segments.append(
                PriceSegmentRead(name=name,
                    min_price=float(min_price + step * i),
                    max_price=float(min_price + step * (i + 1))
                )
            )
        return segments

    def get_prices(self, category: str | None = None) -> PricesRead:
        result = self.repository.get_realizations(category)
        rows = result.result_rows

        if not rows:
            return PricesRead(
                category=category,
                min_price=None,
                max_price=None,
                segments=[],
                realizations=[]
            )

        min_price = rows[0][3]
        max_price = rows[0][4]
        step = self.calculate_step(min_price, max_price)
        segments = self.create_segments(min_price, step)

        realizations = [RealizationRead(date=row[0], product=row[1], price=float(row[2])) for row in rows]
        return PricesRead(
            category=category,
            min_price=float(min_price),
            max_price=float(max_price),
            segments=segments,
            realizations=realizations
        )
