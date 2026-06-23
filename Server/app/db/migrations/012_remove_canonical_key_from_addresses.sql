ALTER TABLE addresses DROP CONSTRAINT IF EXISTS uq_addresses_canonical_key;
DROP INDEX IF EXISTS idx_addresses_canonical_key;
ALTER TABLE addresses DROP COLUMN IF EXISTS canonical_key;
