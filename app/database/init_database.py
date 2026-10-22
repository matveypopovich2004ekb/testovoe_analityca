


from app.database.create_data import create_mock_data
from app.database.create_tables import create_tables
from app.database.get_client import ch_client


def initialize_database() -> None:
    with ch_client() as client:
        create_tables(client=client)

        count = client.query(
            "SELECT COUNT() FROM realization_products_products"  # проверка наличия данных в последней таблице, тк ее заполняли последней
            # это для того чтобы 2 раза подряд БД на заполнить моковыми данными(минимальная страховка идемпотентности)
        ).result_rows[0][0]

        if count == 0:
            create_mock_data(client)
        else:
            print("База уже заполнена")


if __name__ == "__main__":
    initialize_database()