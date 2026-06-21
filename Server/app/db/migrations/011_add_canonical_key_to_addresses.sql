ALTER TABLE addresses ADD COLUMN IF NOT EXISTS canonical_key TEXT;

UPDATE addresses
SET canonical_key =
    regexp_replace(lower(trim(street_address)), '\s+', ' ', 'g')
    || '|' ||
    lower(trim(COALESCE(unit_number, '')))
    || '|' ||
    upper(replace(replace(trim(postal_code), ' ', ''), '-', ''))
WHERE canonical_key IS NULL;

ALTER TABLE addresses ALTER COLUMN canonical_key SET NOT NULL;
ALTER TABLE addresses ADD CONSTRAINT uq_addresses_canonical_key UNIQUE (canonical_key);
CREATE INDEX IF NOT EXISTS idx_addresses_canonical_key ON addresses (canonical_key);
