CREATE TABLE IF NOT EXISTS sessions (owner_hash text PRIMARY KEY, expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days');
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
