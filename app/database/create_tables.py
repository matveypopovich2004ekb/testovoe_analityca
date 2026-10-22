from clickhouse_connect.driver.client import Client

#функция создает таблицы в БД
def create_tables(client: Client) -> None:
    # список запросов на создание таблиц
    create_queries = [
        """
        create table if not exists contragents (
            id UInt64,
            name String
        )
        engine = MergeTree() order by id
        """,

        """
        create table if not exists nomenclature (
            id UInt64,
            name String,
            category String,
            default_price Decimal(12, 2)
        )
        engine = MergeTree() order by id
        """,

        """
        create table if not exists subdivisions (
            id UInt64,
            name String
        )
        engine = MergeTree() order by id
        """,

        """
        create table if not exists realization_products (
            id UInt64,
            date Date,
            contragent_id UInt64,
            subdivision_id UInt64
        )
        engine = MergeTree() order by (date, id) 
        """,

        """
        create table if not exists realization_products_products (
            id UInt64,
            realization_id UInt64,
            product_id UInt64,
            product_count UInt32,
            price Decimal(12, 2)
        )
        engine = MergeTree() order by (realization_id, id)
        """
    ]

    for query in create_queries:
        client.command(query)
    print("Таблицы созданы")
