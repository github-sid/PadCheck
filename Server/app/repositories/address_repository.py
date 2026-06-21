from uuid import UUID

from app.core.address_normalize import build_canonical_key
from app.db.connection import get_connection
from app.models.address import Address
from app.schemas.address import AddressCreate

_COLUMNS = (
    "id, street_address, unit_number, city, province, postal_code, "
    "lat, lng, google_place_id, neighbourhood, ward, created_at, updated_at, canonical_key"
)


def _row_to_address(row: tuple) -> Address:
    return Address(
        id=row[0],
        street_address=row[1],
        unit_number=row[2],
        city=row[3],
        province=row[4],
        postal_code=row[5],
        lat=row[6],
        lng=row[7],
        google_place_id=row[8],
        neighbourhood=row[9],
        ward=row[10],
        created_at=row[11],
        updated_at=row[12],
        canonical_key=row[13],
    )


def get_address_by_id(address_id: UUID) -> Address | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM addresses WHERE id = %s",
                (str(address_id),),
            )
            row = cur.fetchone()
    return _row_to_address(row) if row else None


def get_address_by_canonical_key(key: str) -> Address | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM addresses WHERE canonical_key = %s",
                (key,),
            )
            row = cur.fetchone()
    return _row_to_address(row) if row else None


def create_address(data: AddressCreate) -> Address:
    key = build_canonical_key(data.street_address, data.unit_number, data.postal_code)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO addresses (
                    street_address, unit_number, city, province, postal_code,
                    lat, lng, google_place_id, neighbourhood, ward, canonical_key
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING {_COLUMNS}
                """,
                (
                    data.street_address,
                    data.unit_number,
                    data.city,
                    data.province,
                    data.postal_code,
                    data.lat,
                    data.lng,
                    data.google_place_id,
                    data.neighbourhood,
                    data.ward,
                    key,
                ),
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_address(row)


def delete_address(address_id: UUID) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM addresses WHERE id = %s", (str(address_id),))
        conn.commit()
