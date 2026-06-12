CREATE TABLE IF NOT EXISTS review_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL UNIQUE REFERENCES reviews (id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    pros JSONB NOT NULL DEFAULT '[]',
    cons JSONB NOT NULL DEFAULT '[]',
    sentiment TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_ai_analysis_review_id ON review_ai_analysis (review_id);
