ALTER TABLE inquiries ADD COLUMN interest_solution VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN source_page VARCHAR(300);
ALTER TABLE inquiries ADD COLUMN utm_source VARCHAR(120);
ALTER TABLE inquiries ADD COLUMN utm_campaign VARCHAR(160);
ALTER TABLE inquiries ADD COLUMN preferred_contact VARCHAR(24);

CREATE INDEX idx_inquiries_interest_created_at ON inquiries (interest_solution, created_at DESC);
