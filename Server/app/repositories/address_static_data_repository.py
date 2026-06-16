from uuid import UUID

from app.db.connection import get_connection
from app.models.address_static_data import AddressStaticData
from app.schemas.address_static_data import AddressStaticDataCreate

_COLUMNS = (
    "id, address_id, walk_score, transit_score, "
    "nearest_subway_m, nearest_subway_name, nearest_bus_stop_m, "
    "nearest_supermarket_m, nearest_pharmacy_m, nearest_hospital_m, "
    "nearest_clinic_m, nearest_school_m, nearest_school_name, "
    "nearest_park_m, bike_lane_access, isp_options, fetched_at"
)


def _row_to_static_data(row: tuple) -> AddressStaticData:
    return AddressStaticData(
        id=row[0],
        address_id=row[1],
        walk_score=row[2],
        transit_score=row[3],
        nearest_subway_m=row[4],
        nearest_subway_name=row[5],
        nearest_bus_stop_m=row[6],
        nearest_supermarket_m=row[7],
        nearest_pharmacy_m=row[8],
        nearest_hospital_m=row[9],
        nearest_clinic_m=row[10],
        nearest_school_m=row[11],
        nearest_school_name=row[12],
        nearest_park_m=row[13],
        bike_lane_access=row[14],
        isp_options=list(row[15]) if row[15] else [],
        fetched_at=row[16],
    )


def get_by_address_id(address_id: UUID) -> AddressStaticData | None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {_COLUMNS} FROM address_static_data WHERE address_id = %s",
                (str(address_id),),
            )
            row = cur.fetchone()
    return _row_to_static_data(row) if row else None


def upsert(data: AddressStaticDataCreate) -> AddressStaticData:
    """Insert or replace static data for an address (keyed on address_id)."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO address_static_data (
                    address_id, walk_score, transit_score,
                    nearest_subway_m, nearest_subway_name, nearest_bus_stop_m,
                    nearest_supermarket_m, nearest_pharmacy_m, nearest_hospital_m,
                    nearest_clinic_m, nearest_school_m, nearest_school_name,
                    nearest_park_m, bike_lane_access, isp_options,
                    fetched_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (address_id) DO UPDATE SET
                    walk_score            = EXCLUDED.walk_score,
                    transit_score         = EXCLUDED.transit_score,
                    nearest_subway_m      = EXCLUDED.nearest_subway_m,
                    nearest_subway_name   = EXCLUDED.nearest_subway_name,
                    nearest_bus_stop_m    = EXCLUDED.nearest_bus_stop_m,
                    nearest_supermarket_m = EXCLUDED.nearest_supermarket_m,
                    nearest_pharmacy_m    = EXCLUDED.nearest_pharmacy_m,
                    nearest_hospital_m    = EXCLUDED.nearest_hospital_m,
                    nearest_clinic_m      = EXCLUDED.nearest_clinic_m,
                    nearest_school_m      = EXCLUDED.nearest_school_m,
                    nearest_school_name   = EXCLUDED.nearest_school_name,
                    nearest_park_m        = EXCLUDED.nearest_park_m,
                    bike_lane_access      = EXCLUDED.bike_lane_access,
                    isp_options           = EXCLUDED.isp_options,
                    fetched_at            = NOW()
                RETURNING {_COLUMNS}
                """,
                (
                    str(data.address_id),
                    data.walk_score,
                    data.transit_score,
                    data.nearest_subway_m,
                    data.nearest_subway_name,
                    data.nearest_bus_stop_m,
                    data.nearest_supermarket_m,
                    data.nearest_pharmacy_m,
                    data.nearest_hospital_m,
                    data.nearest_clinic_m,
                    data.nearest_school_m,
                    data.nearest_school_name,
                    data.nearest_park_m,
                    data.bike_lane_access,
                    data.isp_options or [],
                ),
            )
            row = cur.fetchone()
        conn.commit()
    return _row_to_static_data(row)
