
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

    def get_realizations(self, category: str | None = None):
        query = """select r.date, n.name, rp.price,
                min(rp.price) over () as min_price,
                max(rp.price) over () as max_price
            from realization_products_products as rp

            join realization_products as r
                on rp.realization_id = r.id
            join nomenclature as n
                on rp.product_id = n.id

            where rp.price > 0
        """

        # вот так избежим инъекций
        parameters = {}
        if category is not None:
            query += " and n.category = %(category)s"
            parameters["category"] = category
        query += " order by r.date"

        return self.client.query(query, parameters=parameters)