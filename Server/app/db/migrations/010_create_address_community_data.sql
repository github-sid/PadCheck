CREATE TABLE IF NOT EXISTS address_community_data (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id          UUID         NOT NULL UNIQUE REFERENCES addresses (id) ON DELETE CASCADE,

    -- Aggregated averages from reviews (1.00–5.00)
    avg_noise_day       NUMERIC(4,2) CHECK (avg_noise_day       BETWEEN 1 AND 5),
    avg_noise_night     NUMERIC(4,2) CHECK (avg_noise_night     BETWEEN 1 AND 5),
    avg_street_lighting NUMERIC(4,2) CHECK (avg_street_lighting BETWEEN 1 AND 5),
    avg_parking_ease    NUMERIC(4,2) CHECK (avg_parking_ease    BETWEEN 1 AND 5),
    avg_cell_signal     NUMERIC(4,2) CHECK (avg_cell_signal     BETWEEN 1 AND 5),
    avg_safety_feel     NUMERIC(4,2) CHECK (avg_safety_feel     BETWEEN 1 AND 5),

    -- Majority vote from reviews
    construction_nearby BOOLEAN,

    review_count        INTEGER      NOT NULL DEFAULT 0 CHECK (review_count >= 0),

    last_updated        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_address_community_data_address_id ON address_community_data (address_id);
