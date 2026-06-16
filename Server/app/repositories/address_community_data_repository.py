from uuid import UUID

from app.db.connection import get_connection
from app.models.address_community_data import AddressCommunityData
from app.schemas.address_community_data import AddressCommunityDataUpdate

_COLUMNS = (
    "id, address_id, avg_noise_day, avg_noise_night, avg_street_lighting, "
    "avg_parking_ease, avg_cell_signal, avg_safety_feel, "
    "construction_nearby, review_count, last_updated"
)


def _row_to_community_data(row: tuple) -> AddressCommunityData:
    return AddressCommunityData(
        id=row[0],
        address_id=row[1],
        avg_noise_day=row[2],
        avg_noise_night=row[3],
        avg_street_lighting=row[4],
        avg_parking_ease=row[5],
        avg_cell_signal=row[6],
        avg_safety_feel=row[7],
        construction_nearby=row[8],
        review_count=row[9],
        last_updated=row[10],
    )


def get_by_address_id(address_id: UUID) -> AddressCommunityData | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM address_community_data WHERE address_id = %s",
                (str(address_id),),
            )
            row = cur.fetchone()
    return _row_to_community_data(row) if row else None


def upsert(data: AddressCommunityDataUpdate) -> AddressCommunityData:
    """Recompute and persist community aggregates for an address."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO address_community_data (
                    address_id, avg_noise_day, avg_noise_night, avg_street_lighting,
                    avg_parking_ease, avg_cell_signal, avg_safety_feel,
                    construction_nearby, review_count, last_updated
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (address_id) DO UPDATE SET
                    avg_noise_day       = EXCLUDED.avg_noise_day,
                    avg_noise_night     = EXCLUDED.avg_noise_night,
                    avg_street_lighting = EXCLUDED.avg_street_lighting,
                    avg_parking_ease    = EXCLUDED.avg_parking_ease,
                    avg_cell_signal     = EXCLUDED.avg_cell_signal,
                    avg_safety_feel     = EXCLUDED.avg_safety_feel,
                    construction_nearby = EXCLUDED.construction_nearby,
                    review_count        = EXCLUDED.review_count,
                    last_updated        = NOW()
                RETURNING {_COLUMNS}
                """,
                (
                    str(data.address_id),
                    data.avg_noise_day,
                    data.avg_noise_night,
                    data.avg_street_lighting,
                    data.avg_parking_ease,
                    data.avg_cell_signal,
                    data.avg_safety_feel,
                    data.construction_nearby,
                    data.review_count,
                ),
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_community_data(row)


def recompute_from_reviews(address_id: UUID) -> AddressCommunityData:
    """Recalculate all aggregates directly from the reviews table and persist."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    AVG(noise_level_day)   AS avg_noise_day,
                    AVG(noise_level_night) AS avg_noise_night,
                    AVG(street_lighting)   AS avg_street_lighting,
                    AVG(parking_ease)      AS avg_parking_ease,
                    AVG(cell_signal)       AS avg_cell_signal,
                    AVG(rating_safety)     AS avg_safety_feel,
                    BOOL_OR(construction_present) AS construction_nearby,
                    COUNT(*)               AS review_count
                FROM reviews
                WHERE address_id = %s
                """,
                (str(address_id),),
            )
            agg = cur.fetchone()

        data = AddressCommunityDataUpdate(
            address_id=address_id,
            avg_noise_day=agg[0],
            avg_noise_night=agg[1],
            avg_street_lighting=agg[2],
            avg_parking_ease=agg[3],
            avg_cell_signal=agg[4],
            avg_safety_feel=agg[5],
            construction_nearby=agg[6],
            review_count=int(agg[7]),
        )

    return upsert(data)
