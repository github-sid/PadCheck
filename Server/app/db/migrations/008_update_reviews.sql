-- Drop dependent table before dropping reviews
DROP TABLE IF EXISTS review_ai_analysis;
DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    address_id           UUID        NOT NULL REFERENCES addresses (id) ON DELETE CASCADE,
    user_id              UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    -- Core ratings (1–5)
    rating_overall       INTEGER     NOT NULL CHECK (rating_overall    BETWEEN 1 AND 5),
    rating_noise         INTEGER     NOT NULL CHECK (rating_noise      BETWEEN 1 AND 5),
    rating_safety        INTEGER     NOT NULL CHECK (rating_safety     BETWEEN 1 AND 5),
    rating_transit       INTEGER     NOT NULL CHECK (rating_transit    BETWEEN 1 AND 5),
    rating_amenities     INTEGER     NOT NULL CHECK (rating_amenities  BETWEEN 1 AND 5),
    rating_landlord      INTEGER     NOT NULL CHECK (rating_landlord   BETWEEN 1 AND 5),

    -- Environmental detail (1–5)
    noise_level_day      INTEGER     CHECK (noise_level_day    BETWEEN 1 AND 5),
    noise_level_night    INTEGER     CHECK (noise_level_night  BETWEEN 1 AND 5),
    street_lighting      INTEGER     CHECK (street_lighting    BETWEEN 1 AND 5),
    parking_ease         INTEGER     CHECK (parking_ease       BETWEEN 1 AND 5),
    cell_signal          INTEGER     CHECK (cell_signal        BETWEEN 1 AND 5),

    -- Qualitative fields
    construction_present BOOLEAN,
    review_text          TEXT,
    red_flags            TEXT[],
    ai_summary           TEXT,

    -- Tenancy window
    tenancy_start        TIMESTAMPTZ,
    tenancy_end          TIMESTAMPTZ,

    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT tenancy_order CHECK (
        tenancy_start IS NULL
        OR tenancy_end IS NULL
        OR tenancy_end >= tenancy_start
    )
);

CREATE INDEX IF NOT EXISTS idx_reviews_address_id ON reviews (address_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON reviews (user_id);

-- Recreate review_ai_analysis referencing new reviews table
CREATE TABLE review_ai_analysis (
    id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID    NOT NULL UNIQUE REFERENCES reviews (id) ON DELETE CASCADE,
    summary   TEXT    NOT NULL,
    pros      JSONB   NOT NULL DEFAULT '[]',
    cons      JSONB   NOT NULL DEFAULT '[]',
    sentiment TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_ai_analysis_review_id ON review_ai_analysis (review_id);
