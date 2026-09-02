DROP INDEX IF EXISTS idx_inquiries_interest_created_at;

ALTER TABLE inquiries DROP COLUMN IF EXISTS preferred_contact;
ALTER TABLE inquiries DROP COLUMN IF EXISTS utm_campaign;
ALTER TABLE inquiries DROP COLUMN IF EXISTS utm_source;
ALTER TABLE inquiries DROP COLUMN IF EXISTS source_page;
ALTER TABLE inquiries DROP COLUMN IF EXISTS interest_solution;
