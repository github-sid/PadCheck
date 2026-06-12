DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users RENAME COLUMN password_hash TO hashed_password;
    END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password TEXT;
ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email'
CHECK (provider IN ('email', 'gmail'));
