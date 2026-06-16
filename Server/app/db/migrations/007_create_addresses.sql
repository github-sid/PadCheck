CREATE TABLE IF NOT EXISTS addresses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    street_address  TEXT        NOT NULL,
    unit_number     TEXT,
    city            TEXT        NOT NULL,
    province        TEXT        NOT NULL,
    postal_code     TEXT        NOT NULL,
    lat             NUMERIC(10, 7),
    lng             NUMERIC(10, 7),
    google_place_id TEXT        UNIQUE,
    neighbourhood   TEXT,
    ward            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_google_place_id ON addresses (google_place_id);
CREATE INDEX IF NOT EXISTS idx_addresses_postal_code     ON addresses (postal_code);
CREATE INDEX IF NOT EXISTS idx_addresses_city            ON addresses (city);

CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_addresses_updated_at();
