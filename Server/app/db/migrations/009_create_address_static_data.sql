CREATE TABLE IF NOT EXISTS address_static_data (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id            UUID        NOT NULL UNIQUE REFERENCES addresses (id) ON DELETE CASCADE,

    -- Walkability / transit scores (0–100)
    walk_score            INTEGER     CHECK (walk_score    BETWEEN 0 AND 100),
    transit_score         INTEGER     CHECK (transit_score BETWEEN 0 AND 100),

    -- Nearest points of interest (distance in metres, >= 0)
    nearest_subway_m      INTEGER     CHECK (nearest_subway_m      >= 0),
    nearest_subway_name   TEXT,
    nearest_bus_stop_m    INTEGER     CHECK (nearest_bus_stop_m    >= 0),
    nearest_supermarket_m INTEGER     CHECK (nearest_supermarket_m >= 0),
    nearest_pharmacy_m    INTEGER     CHECK (nearest_pharmacy_m    >= 0),
    nearest_hospital_m    INTEGER     CHECK (nearest_hospital_m    >= 0),
    nearest_clinic_m      INTEGER     CHECK (nearest_clinic_m      >= 0),
    nearest_school_m      INTEGER     CHECK (nearest_school_m      >= 0),
    nearest_school_name   TEXT,
    nearest_park_m        INTEGER     CHECK (nearest_park_m        >= 0),

    -- Infrastructure flags
    bike_lane_access      BOOLEAN,

    -- Connectivity
    isp_options           TEXT[],

    fetched_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_address_static_data_address_id ON address_static_data (address_id);
