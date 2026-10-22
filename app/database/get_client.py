


import os
from typing import Iterator
import clickhouse_connect
from contextlib import contextmanager

from clickhouse_connect.driver.client import Client

@contextmanager
def ch_client() -> Iterator[Client]:
    client = clickhouse_connect.get_client(
            host=os.getenv("CLICKHOUSE_HOST"),
            port=int(os.getenv("CLICKHOUSE_PORT")),
            username=os.getenv("CLICKHOUSE_USER"),
            password=os.getenv("CLICKHOUSE_PASSWORD"),
            database=os.getenv("CLICKHOUSE_DB")
        )
    try:
        yield client
    finally:
        client.close()


# это чтоб потом было удобно пробрасывать через depends
def get_client() -> Iterator[Client]:
    with ch_client() as client:
        yield client
    
    