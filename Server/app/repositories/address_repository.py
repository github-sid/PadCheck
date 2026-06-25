from uuid import UUID

from app.db.connection import get_connection
from app.models.address import Address
from app.schemas.address import AddressCreate

_COLUMNS = (
    "id, street_address, unit_number, city, province, postal_code, "
    "lat, lng, google_place_id, neighbourhood, ward, street_view_url, created_at, updated_at"
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
        street_view_url=row[11],
        created_at=row[12],
        updated_at=row[13],
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


def get_address_by_google_place_id(place_id: str) -> Address | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM addresses WHERE google_place_id = %s",
                (place_id,),
            )
            row = cur.fetchone()
    return _row_to_address(row) if row else None


def create_address(data: AddressCreate) -> Address | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO addresses (
                    street_address, unit_number, city, province, postal_code,
                    lat, lng, google_place_id, neighbourhood, ward
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (google_place_id) DO NOTHING
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
                ),
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_address(row) if row else None


def update_street_view_url(address_id: UUID, url: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE addresses SET street_view_url = %s WHERE id = %s",
                (url, str(address_id)),
            )
        conn.commit()


def delete_address(address_id: UUID) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM addresses WHERE id = %s", (str(address_id),))
        conn.commit()
