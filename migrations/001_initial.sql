CREATE TABLE IF NOT EXISTS reports (id uuid PRIMARY KEY, owner_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days', data jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS reports_owner ON reports(owner_hash, created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL DEFAULT now(), count integer NOT NULL);
CREATE TABLE IF NOT EXISTS events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('reconciliation_completed','supplier_draft_copied')), created_at timestamptz NOT NULL DEFAULT now());
