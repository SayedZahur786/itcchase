CREATE TABLE IF NOT EXISTS support_requests (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email text NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
