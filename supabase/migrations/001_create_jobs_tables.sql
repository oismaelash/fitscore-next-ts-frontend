-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    performance JSONB NOT NULL,
    energy JSONB NOT NULL,
    culture JSONB NOT NULL,
    application_link TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    cultural_fit JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'sent_to_manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fit_scores table
CREATE TABLE IF NOT EXISTS fit_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    technical_score DECIMAL(3,2) CHECK (technical_score >= 0 AND technical_score <= 10),
    cultural_score DECIMAL(3,2) CHECK (cultural_score >= 0 AND cultural_score <= 10),
    behavioral_score DECIMAL(3,2) CHECK (behavioral_score >= 0 AND behavioral_score <= 10),
    overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
    ai_analysis TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_fit_scores_candidate_id ON fit_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fit_scores_job_id ON fit_scores(job_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for jobs table
CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
CREATE POLICY "Allow public read access to published jobs" ON jobs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated users to manage jobs" ON jobs
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for candidates table
CREATE POLICY "Allow authenticated users to manage candidates" ON candidates
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for fit_scores table
CREATE POLICY "Allow authenticated users to manage fit_scores" ON fit_scores
    FOR ALL USING (auth.role() = 'authenticated');

-- Create a function to get job statistics
CREATE OR REPLACE FUNCTION get_job_stats()
RETURNS TABLE (
    total_count BIGINT,
    draft_count BIGINT,
    published_count BIGINT,
    closed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COUNT(*) FILTER (WHERE status = 'published') as published_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count
    FROM jobs;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search jobs
CREATE OR REPLACE FUNCTION search_jobs(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    performance JSONB,
    energy JSONB,
    culture JSONB,
    application_link TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.description,
        j.performance,
        j.energy,
        j.culture,
        j.application_link,
        j.status,
        j.created_at,
        j.updated_at
    FROM jobs j
    WHERE 
        j.title ILIKE '%' || search_query || '%'
        OR j.description ILIKE '%' || search_query || '%'
    ORDER BY j.created_at DESC;
END;
$$ LANGUAGE plpgsql;
