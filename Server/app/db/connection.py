import psycopg2
from psycopg2.extensions import connection

from app.core.config import settings


def get_connection() -> connection:
    return psycopg2.connect(settings.database_url)
