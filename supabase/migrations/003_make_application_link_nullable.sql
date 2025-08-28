-- Make application_link nullable to allow automatic generation
ALTER TABLE jobs ALTER COLUMN application_link DROP NOT NULL;
