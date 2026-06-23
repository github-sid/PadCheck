from uuid import UUID

from app.db.connection import get_connection
from app.models.review import Review
from app.schemas.review import ReviewCreate

_COLUMNS = (
    "id, address_id, user_id, rating_overall, rating_noise, rating_safety, "
    "rating_transit, rating_amenities, rating_landlord, noise_level_day, "
    "noise_level_night, street_lighting, parking_ease, cell_signal, "
    "construction_present, review_text, red_flags, photo_urls, ai_summary, "
    "tenancy_start, tenancy_end, created_at"
)


def _row_to_review(row: tuple) -> Review:
    return Review(
        id=row[0],
        address_id=row[1],
        user_id=row[2],
        rating_overall=row[3],
        rating_noise=row[4],
        rating_safety=row[5],
        rating_transit=row[6],
        rating_amenities=row[7],
        rating_landlord=row[8],
        noise_level_day=row[9],
        noise_level_night=row[10],
        street_lighting=row[11],
        parking_ease=row[12],
        cell_signal=row[13],
        construction_present=row[14],
        review_text=row[15],
        red_flags=list(row[16]) if row[16] else [],
        photo_urls=list(row[17]) if row[17] else [],
        ai_summary=row[18],
        tenancy_start=row[19],
        tenancy_end=row[20],
        created_at=row[21],
    )


def get_by_address_id(address_id: UUID) -> list[Review]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM reviews WHERE address_id = %s ORDER BY created_at DESC",
                (str(address_id),),
            )
            rows = cur.fetchall()
    return [_row_to_review(row) for row in rows]


def create_review(review_data: ReviewCreate, user_id: UUID) -> Review:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO reviews (
                    address_id, user_id, rating_overall, rating_noise, rating_safety,
                    rating_transit, rating_amenities, rating_landlord,
                    noise_level_day, noise_level_night, street_lighting, parking_ease, cell_signal,
                    construction_present, review_text, red_flags, photo_urls,
                    tenancy_start, tenancy_end
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING {_COLUMNS}
                """,
                (
                    str(review_data.address_id),
                    str(user_id),
                    review_data.rating_overall,
                    review_data.rating_noise,
                    review_data.rating_safety,
                    review_data.rating_transit,
                    review_data.rating_amenities,
                    review_data.rating_landlord,
                    review_data.noise_level_day,
                    review_data.noise_level_night,
                    review_data.street_lighting,
                    review_data.parking_ease,
                    review_data.cell_signal,
                    review_data.construction_present,
                    review_data.review_text,
                    review_data.red_flags or [],
                    review_data.photo_urls or [],
                    review_data.tenancy_start,
                    review_data.tenancy_end,
                ),
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_review(row)
