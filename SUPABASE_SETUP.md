# Supabase Setup Guide for Job Backend API

This guide will help you set up Supabase for the FitScore job backend API.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Git installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "fitscore-jobs")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Run Database Migrations

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Run the migration:
   ```bash
   supabase db push
   ```

Alternatively, you can run the SQL manually in the Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_create_jobs_tables.sql`
4. Paste and run the SQL

## Step 5: Test the API

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the API endpoints:

   **Create a job:**
   ```bash
   curl -X POST http://localhost:3000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Software Engineer",
       "description": "We are looking for a talented software engineer...",
       "performance": {
         "experience": "3+ years",
         "deliveries": "Fast-paced environment",
         "skills": ["JavaScript", "React", "Node.js"]
       },
       "energy": {
         "availability": "Full-time",
         "deadlines": "Flexible",
         "pressure": "High"
       },
       "culture": {
         "legalValues": ["Innovation", "Collaboration", "Excellence"]
       },
       "applicationLink": "https://example.com/apply"
     }'
   ```

   **Get all jobs:**
   ```bash
   curl http://localhost:3000/api/jobs
   ```

   **Get jobs by status:**
   ```bash
   curl "http://localhost:3000/api/jobs?status=published"
   ```

## Step 6: Configure Row Level Security (RLS)

The migration includes RLS policies, but you may need to adjust them based on your authentication setup:

1. **For public job listings** (published jobs):
   - The policy allows public read access to published jobs
   - No authentication required

2. **For authenticated users** (managing jobs):
   - Users must be authenticated to create, update, or delete jobs
   - You may want to add user-specific policies

## Step 7: Optional - Set Up Authentication

If you want to use Supabase Auth:

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your authentication providers (Email, Google, GitHub, etc.)
3. Update the RLS policies to include user-specific rules

Example user-specific policy:
```sql
-- Allow users to manage their own jobs
CREATE POLICY "Users can manage their own jobs" ON jobs
    FOR ALL USING (auth.uid() = created_by);
```

## API Endpoints

### Jobs

- `GET /api/jobs` - Get all jobs (with pagination and filtering)
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/[id]` - Get a specific job
- `PUT /api/jobs/[id]` - Update a job
- `DELETE /api/jobs/[id]` - Delete a job

### Query Parameters

- `status` - Filter by job status (`draft`, `published`, `closed`)
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 10)

### Example Response

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "Job description...",
      "performance": {
        "experience": "3+ years",
        "deliveries": "Fast-paced environment",
        "skills": ["JavaScript", "React", "Node.js"]
      },
      "energy": {
        "availability": "Full-time",
        "deadlines": "Flexible",
        "pressure": "High"
      },
      "culture": {
        "legalValues": ["Innovation", "Collaboration", "Excellence"]
      },
      "applicationLink": "https://example.com/apply",
      "status": "published",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Make sure your `.env.local` file is in the project root
   - Verify the environment variable names are correct
   - Restart your development server after changing environment variables

2. **"Failed to fetch jobs"**
   - Check your Supabase project URL and API key
   - Verify the database tables exist
   - Check the browser console for detailed error messages

3. **"Job not found"**
   - Verify the job ID exists in your database
   - Check if RLS policies are blocking access

4. **CORS errors**
   - Add your localhost URL to Supabase CORS settings
   - Go to Settings > API > CORS in your Supabase dashboard

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js API routes documentation](https://nextjs.org/docs/api-routes/introduction)
- Check the browser console and server logs for error details

## Next Steps

1. Set up authentication if needed
2. Configure file upload for resumes
3. Implement the candidates and fit_scores APIs
4. Add email notifications
5. Set up monitoring and logging
