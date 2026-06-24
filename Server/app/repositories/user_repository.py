from uuid import UUID

from app.db.connection import get_connection
from app.schemas.user import UserInDB, UserProvider


def _row_to_user(row: tuple) -> UserInDB:
    return UserInDB(
        id=row[0],
        email=row[1],
        hashed_password=row[2],
        provider=row[3],
        role=row[4],
        created_at=row[5],
        display_name=row[6],
    )


_USER_COLUMNS = "id, email, hashed_password, provider, role, created_at, display_name"


def get_user_by_id(user_id: UUID) -> UserInDB | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_USER_COLUMNS} FROM users WHERE id = %s",
                (str(user_id),),
            )
            row = cur.fetchone()

    if row is None:
        return None

    return _row_to_user(row)


def get_user_by_email(email: str) -> UserInDB | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_USER_COLUMNS} FROM users WHERE email = %s",
                (email.lower(),),
            )
            row = cur.fetchone()

    if row is None:
        return None

    return _row_to_user(row)


def create_user(
    email: str,
    hashed_password: str | None,
    provider: UserProvider,
    display_name: str | None = None,
) -> UserInDB:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (email, hashed_password, provider, display_name)
                VALUES (%s, %s, %s, %s)
                RETURNING id, email, hashed_password, provider, role, created_at, display_name
                """,
                (email.lower(), hashed_password, provider, display_name),
            )
            row = cur.fetchone()
        conn.commit()

    return _row_to_user(row)
