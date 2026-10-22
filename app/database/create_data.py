



import random
from datetime import date, timedelta

from clickhouse_connect.driver.client import Client


def create_mock_data(client: Client) -> None:
    random_generator = random.Random(42) # это чтоб моковые данные каждый раз не менялись при пересборкаъ

    # 10 любых контрагентов
    contragents = [
        (i, f"Покупатель {i}")
        for i in range(1, 11)
    ]
    # Подразделения
    subdivisions = [
        (1, "подр 1"),
        (2, "подр 2"),
        (3, "подр 3")
    ]
    # Товары поформату категория:список пар (название товарая, его цена)
    products = {
        "Столы": [
            ("Стол 1", 5000),
            ("Стол 2", 6000),
            ("Стол 3", 7000),
            ("Стол 4", 8000),
            ("Стол 5", 9000),
            ("Стол 6", 10000),
            ("Стол 7", 12000),
            ("Стол 8", 15000),
            ("Стол 9", 18000),
            ("Стол 10", 20000)
        ],
        "Стулья": [
            ("Стул 1", 1000),
            ("Стул 2", 1500),
            ("Стул 3", 2000),
            ("Стул 4", 2500),
            ("Стул 5", 3000),
            ("Стул 6", 3500),
            ("Стул 7", 4000),
            ("Стул 8", 5000),
            ("Стул 9", 6000),
            ("Стул 10", 7500)
        ],
        "Раковины": [
            ("Раковина 1", 2500),
            ("Раковина 2", 3000),
            ("Раковина 3", 4000),
            ("Раковина 4", 5000),
            ("Раковина 5", 6000),
            ("Раковина 6", 7000),
            ("Раковина 7", 8500),
            ("Раковина 8", 10000),
            ("Раковина 9", 12000),
            ("Раковина 10", 15000)
        ]
    }

    # Теперь деалем строки для номенклатуры
    nomenclature = []
    for category, items in products.items():
        for name, price in items:
            nomenclature.append((
                len(nomenclature) + 1, #выдаем ай ди каждому товару начиная с 1
                name,
                category,
                price
            ))
    #  реализации и их товары
    realizations = []
    realization_items = []

    start_date = date(2026, 1, 1)
    for realization_id in range(1, 201): # возьмем  200 реализаций
        realization_date = start_date + timedelta(
            days=random_generator.randint(0, 30)
        ) 

        realizations.append((
            realization_id,
            realization_date,
            random_generator.randint(1, 10), #случайный ай ди контрагента и подразделения
            random_generator.randint(1, 3)
        ))

        # пусть на 1 реализацию от 1 до 3 разных товаров
        products_count = random_generator.randint(1, 3)
        selected_products = random_generator.sample(
            nomenclature, products_count
        )

        for prod in selected_products:
            product_id, price = prod[0], prod[-1]
            realization_items.append((
                len(realization_items) + 1,
                realization_id,
                product_id,
                1, # так как для текущей аналитики неважно количество одинаковых товаров в одной реализации
                # то я просто везде поставлю 1
                price
            ))

    
    # теперь можно заполнить таблицы
    client.insert("contragents", contragents, column_names=["id", "name"])
    client.insert("subdivisions", subdivisions, column_names=["id", "name"])
    client.insert("nomenclature", nomenclature, column_names=[
        "id", "name", "category", "default_price"
        ])
    client.insert("realization_products", realizations, column_names=[
            "id", "date", "contragent_id", "subdivision_id"
        ]
    )

    client.insert("realization_products_products", realization_items, column_names=[
            "id", "realization_id", "product_id", "product_count", "price"
        ]
    )

    print("Тестовые данные загружены")
