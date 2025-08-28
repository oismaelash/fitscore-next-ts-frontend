# Supabase Storage Setup Guide

## Overview

This guide will help you configure Supabase storage policies to enable resume uploads for the candidates API.

## Current Status

✅ **API Implementation Complete**: The candidates API is fully implemented and working
✅ **Database Integration**: Candidate data is being saved to the database correctly
✅ **File Validation**: File type and size validation is working
⚠️ **Storage Upload**: Currently blocked by Row Level Security (RLS) policies

## Step-by-Step Storage Setup

### 1. Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar

### 2. Create the Resumes Bucket

1. Click **"New bucket"**
2. Enter the following details:
   - **Name**: `resumes`
   - **Public bucket**: ✅ Check this option
   - **File size limit**: `5MB`
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. Click **"Create bucket"**

### 3. Configure Storage Policies

#### Policy 1: Allow Public Read Access

1. Go to **Storage > Policies**
2. Find the `resumes` bucket
3. Click **"New Policy"**
4. Select **"Create a policy from scratch"**
5. Configure as follows:
   - **Policy name**: `Allow public read access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**: Leave empty (allows all reads)

6. Click **"Review"** and then **"Save policy"**

#### Policy 2: Allow Authenticated Uploads

1. Click **"New Policy"** again
2. Select **"Create a policy from scratch"**
3. Configure as follows:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**: Leave empty (allows all uploads for authenticated users)

4. Click **"Review"** and then **"Save policy"**

#### Policy 3: Allow Authenticated Updates (Optional)

1. Click **"New Policy"** again
2. Select **"Create a policy from scratch"**
3. Configure as follows:
   - **Policy name**: `Allow authenticated updates`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **Policy definition**: Leave empty (allows all updates for authenticated users)

4. Click **"Review"** and then **"Save policy"**

#### Policy 4: Allow Authenticated Deletes (Optional)

1. Click **"New Policy"** again
2. Select **"Create a policy from scratch"**
3. Configure as follows:
   - **Policy name**: `Allow authenticated deletes`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**: Leave empty (allows all deletes for authenticated users)

4. Click **"Review"** and then **"Save policy"**

### 4. Alternative: Quick Setup with SQL

If you prefer to use SQL, you can run these commands in the Supabase SQL Editor:

```sql
-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
```

### 5. Test the Setup

After configuring the policies, test the resume upload:

```bash
# Run the test script
node test-candidates-api.js
```

You should see a successful upload response instead of the RLS error.

## File Structure

The resumes will be stored with the following structure:
```
resumes/
├── {jobId}/
│   ├── {candidateName}_{timestamp}.pdf
│   ├── {candidateName}_{timestamp}.doc
│   └── {candidateName}_{timestamp}.docx
```

Example:
```
resumes/
├── f8ba3555-9bab-4bed-965f-9dcfb8b53833/
│   ├── John_Doe_1732812345678.pdf
│   └── Jane_Smith_1732812345679.docx
```

## Security Considerations

### Current Setup (Recommended for Development)
- Public read access for resumes
- Authenticated uploads only
- 5MB file size limit
- Restricted file types

### Production Recommendations
1. **Private Bucket**: Consider making the bucket private for sensitive resumes
2. **Signed URLs**: Use signed URLs for secure file access
3. **Virus Scanning**: Implement virus scanning for uploaded files
4. **Access Control**: Implement more granular access control based on user roles
5. **File Encryption**: Consider encrypting files at rest

## Troubleshooting

### Common Issues

1. **"new row violates row-level security policy"**
   - Ensure you've created the storage policies correctly
   - Check that the bucket name matches exactly: `resumes`

2. **"Bucket not found"**
   - Verify the bucket exists in your Supabase project
   - Check the bucket name spelling

3. **"File type not allowed"**
   - Verify the MIME types are configured correctly
   - Check that the file is actually a PDF, DOC, or DOCX

4. **"File too large"**
   - Check the file size limit (should be 5MB)
   - Verify the file is under the limit

### Verification Steps

1. **Check Bucket Exists**:
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'resumes';
   ```

2. **Check Policies**:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'resumes';
   ```

3. **Test Upload**:
   ```bash
   node test-candidates-api.js
   ```

## Next Steps

Once storage is configured:

1. ✅ Resume uploads will work
2. ✅ Candidate applications will be fully functional
3. ✅ Resumes will be accessible via public URLs
4. ✅ The complete candidate management system will be operational

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your environment variables are correct
3. Ensure your Supabase project has the correct permissions
4. Test with the provided test scripts
