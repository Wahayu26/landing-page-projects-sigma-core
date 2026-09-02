CREATE TABLE inquiries (
    id UUID PRIMARY KEY,
    public_reference VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160) NOT NULL,
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(40),
    message TEXT NOT NULL,
    status VARCHAR(24) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_inquiries_status_created_at ON inquiries (status, created_at DESC);

