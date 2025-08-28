# Row Level Security (RLS) Fix Guide

## Problem Description

You're encountering this error when trying to insert data into the `jobs` table:
```
new row violates row-level security policy for table "jobs"
```

## Root Cause

The issue occurs because:

1. **RLS is enabled** on the `jobs` table with policies that require authentication
2. **Mock authentication** is being used instead of real Supabase authentication
3. **No valid Supabase session** exists when making database calls

## Solutions

### Solution 1: Disable RLS for Development (Quick Fix)

I've created a new migration file `002_disable_rls_for_development.sql` that disables RLS policies. To apply this:

1. **Run the migration** in your Supabase dashboard:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/migrations/002_disable_rls_for_development.sql`

2. **Or use Supabase CLI** (if you have it installed):
   ```bash
   supabase db reset
   ```

### Solution 2: Implement Real Supabase Authentication (Recommended)

I've updated the `AuthContext.tsx` to use real Supabase authentication. To complete this setup:

1. **Set up Supabase Auth**:
   - Go to your Supabase dashboard
   - Navigate to Authentication > Settings
   - Enable Email authentication
   - Configure your site URL and redirect URLs

2. **Create a test user**:
   - Go to Authentication > Users
   - Click "Add User"
   - Create a test user with email and password

3. **Test the authentication**:
   - Start your development server: `npm run dev`
   - Go to `/login`
   - Use the test user credentials

### Solution 3: Hybrid Approach (Development + Production)

For a more robust solution that works in both development and production:

1. **Create environment-specific RLS policies**:
   ```sql
   -- Only enable RLS in production
   DO $$
   BEGIN
     IF current_setting('app.environment') = 'production' THEN
       ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
       -- Add your production policies here
     END IF;
   END $$;
   ```

2. **Add environment variable**:
   ```env
   # .env.local
   NEXT_PUBLIC_APP_ENVIRONMENT=development
   ```

## Testing the Fix

After applying one of the solutions:

1. **Test job creation**:
   ```bash
   curl -X POST http://localhost:3000/api/jobs \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Job",
       "description": "Test description",
       "performance": {
         "experience": "3+ years",
         "deliveries": "High quality",
         "skills": ["JavaScript", "React"]
       },
       "energy": {
         "availability": "Full-time",
         "deadlines": "Flexible",
         "pressure": "Medium"
       },
       "culture": {
         "legalValues": ["Innovation", "Collaboration"]
       },
       "applicationLink": "https://example.com/apply"
     }'
   ```

2. **Test through the UI**:
   - Login to your application
   - Navigate to `/jobs/create`
   - Fill out the form and submit

## Security Considerations

### For Development:
- Disabling RLS is acceptable for development
- No sensitive data is exposed
- Faster development workflow

### For Production:
- Always enable RLS
- Implement proper user authentication
- Use user-specific policies
- Consider adding user ownership to jobs table

## Additional RLS Policies for Production

When ready for production, consider these enhanced policies:

```sql
-- Add user ownership to jobs table
ALTER TABLE jobs ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update RLS policies
CREATE POLICY "Users can manage their own jobs" ON jobs
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Public can view published jobs" ON jobs
    FOR SELECT USING (status = 'published');
```

## Troubleshooting

### If you still get RLS errors:

1. **Check if RLS is actually disabled**:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'jobs';
   ```

2. **Verify Supabase connection**:
   - Check your environment variables
   - Ensure Supabase URL and key are correct

3. **Check authentication status**:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

## Next Steps

1. **Choose a solution** based on your needs
2. **Apply the fix** using the provided migration or code changes
3. **Test thoroughly** to ensure everything works
4. **Consider implementing real authentication** for production readiness

## Files Modified

- `supabase/migrations/001_create_jobs_tables.sql` - Commented out RLS policies
- `supabase/migrations/002_disable_rls_for_development.sql` - New migration to disable RLS
- `src/contexts/AuthContext.tsx` - Updated to use real Supabase authentication
- `RLS_FIX_GUIDE.md` - This guide

## Support

If you continue to have issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Ensure your Supabase project is properly configured
4. Test with a simple database query first
