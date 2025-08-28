-- Disable RLS for development
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE fit_scores DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to published jobs" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated users to manage jobs" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated users to manage candidates" ON candidates;
DROP POLICY IF EXISTS "Allow authenticated users to manage fit_scores" ON fit_scores;
