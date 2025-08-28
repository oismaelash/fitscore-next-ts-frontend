# Candidates API Implementation Guide

## Overview

The Candidates API provides endpoints for managing job applications and candidate data. It's fully integrated with the job posting system and includes file upload capabilities for resumes.

## API Endpoints

### 1. POST /api/candidates
Submit a new candidate application for a job.

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('jobId', 'job-uuid');
formData.append('name', 'John Doe');
formData.append('email', 'john.doe@example.com');
formData.append('phone', '+1234567890');
formData.append('resume', file); // PDF, DOC, or DOCX file (max 5MB)
formData.append('culturalFit', JSON.stringify({
  performance: 'High performer with excellent track record',
  energy: 'Very energetic and deadline-driven',
  culture: 'Strong alignment with company values'
}));
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "candidate-uuid",
    "jobId": "job-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "resumeUrl": "https://storage.supabase.com/resumes/job-uuid/John_Doe_1234567890.pdf",
    "culturalFit": {
      "performance": "High performer with excellent track record",
      "energy": "Very energetic and deadline-driven",
      "culture": "Strong alignment with company values"
    },
    "status": "new",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. GET /api/candidates?jobId={jobId}&status={status}
Retrieve candidates for a specific job.

**Query Parameters:**
- `jobId` (required): The ID of the job
- `status` (optional): Filter by candidate status ('new', 'reviewed', 'sent_to_manager')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "candidate-uuid",
      "jobId": "job-uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "resumeUrl": "https://storage.supabase.com/resumes/job-uuid/John_Doe_1234567890.pdf",
      "culturalFit": {
        "performance": "High performer with excellent track record",
        "energy": "Very energetic and deadline-driven",
        "culture": "Strong alignment with company values"
      },
      "status": "new",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "job": {
    "id": "job-uuid",
    "title": "Senior Software Engineer"
  }
}
```

## Database Schema

### Candidates Table
```sql
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  cultural_fit JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'sent_to_manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket
- **Bucket Name:** `resumes`
- **File Structure:** `{jobId}/{candidateName}_{timestamp}.{extension}`
- **Allowed Types:** PDF, DOC, DOCX
- **Max Size:** 5MB

## Frontend Integration

### Application Form
The application form is located at `/apply/[jobId]` and includes:
- Personal information collection
- Resume upload
- Cultural fit assessment (performance, energy, culture)
- Multi-step form with validation

### Job Detail Page
The job detail page (`/jobs/[id]`) includes a candidates tab that:
- Lists all candidates for the job
- Shows candidate status and fit scores
- Provides links to view resumes and candidate details
- Allows status updates and fit score calculations

### Candidates Management
The candidates page (`/candidates`) provides:
- Job selection dropdown
- Status filtering
- Candidate list with actions
- Fit score calculation

## Error Handling

The API includes comprehensive error handling for:
- Missing required fields
- Invalid file types/sizes
- Job not found
- Database errors
- Storage upload failures

## Security Features

- File type validation
- File size limits
- Job existence validation
- Secure file storage with Supabase
- Input sanitization

## Testing

Run the test script to verify API functionality:
```bash
node test-candidates-api.js
```

## Usage Examples

### Submit Application
```javascript
const formData = new FormData();
formData.append('jobId', 'job-uuid');
formData.append('name', 'John Doe');
formData.append('email', 'john.doe@example.com');
formData.append('phone', '+1234567890');
formData.append('resume', resumeFile);
formData.append('culturalFit', JSON.stringify(culturalFitData));

const response = await fetch('/api/candidates', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### Get Candidates
```javascript
const response = await fetch('/api/candidates?jobId=job-uuid');
const result = await response.json();

if (result.success) {
  const candidates = result.data;
  // Process candidates
}
```

## Integration with Jobs

The candidates API is tightly integrated with the jobs system:
- Each candidate is linked to a specific job
- Job detail pages show candidates for that job
- Application links are generated automatically for each job
- Candidates can be filtered by job and status

## Future Enhancements

- Pagination support for large candidate lists
- Advanced filtering and search
- Email notifications for new applications
- Automated fit score calculation
- Interview scheduling integration
- Candidate status workflow management
