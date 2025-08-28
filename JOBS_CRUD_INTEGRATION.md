# Jobs CRUD Integration Documentation

## Overview

This document describes the complete CRUD (Create, Read, Update, Delete) integration for jobs between the frontend and backend of the FitScore application.

## Backend API Endpoints

### 1. GET /api/jobs
- **Purpose**: Fetch all jobs with pagination and filtering
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (draft, published, closed)
- **Response**: Paginated list of jobs with metadata

### 2. POST /api/jobs
- **Purpose**: Create a new job posting
- **Body**: Job form data with required fields
- **Response**: Created job object

### 3. GET /api/jobs/[id]
- **Purpose**: Fetch a specific job by ID
- **Response**: Single job object

### 4. PUT /api/jobs/[id]
- **Purpose**: Update an existing job
- **Body**: Partial job data
- **Response**: Updated job object

### 5. DELETE /api/jobs/[id]
- **Purpose**: Delete a job (with dependency checks)
- **Response**: Success message

## Frontend Implementation

### Context Provider (JobsContext)

The `JobsContext` provides state management and API integration for jobs:

```typescript
interface JobsContextType {
  jobs: JobPosting[];
  currentJob: JobPosting | null;
  isLoading: boolean;
  error: string | null;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  
  // Methods
  fetchJobs: (page?: number, limit?: number, status?: string) => Promise<void>;
  createJob: (jobData: JobForm) => Promise<JobPosting | null>;
  updateJob: (id: string, jobData: Partial<JobForm>) => Promise<JobPosting | null>;
  deleteJob: (id: string) => Promise<boolean>;
  getJobById: (id: string) => Promise<JobPosting | null>;
  setCurrentJob: (job: JobPosting | null) => void;
  clearError: () => void;
}
```

### Pages

#### 1. Jobs List Page (`/jobs`)
- Displays all jobs with filtering and pagination
- Features:
  - Status filter (All, Draft, Published, Closed)
  - Search functionality
  - Pagination controls
  - Create, Edit, Delete actions
  - Error handling and loading states

#### 2. Create Job Page (`/jobs/create`)
- Form to create new job postings
- Sections:
  - Basic Information (title, description)
  - Performance Expectations (experience, deliverables, skills)
  - Energy & Work Environment (availability, deadlines, pressure)
  - Cultural Values (company values)

#### 3. Job Details Page (`/jobs/[id]`)
- View detailed information about a specific job
- Shows all job information in a structured format

#### 4. Edit Job Page (`/jobs/[id]/edit`)
- Form to update existing job postings
- Pre-populated with current job data
- Same form structure as create page

### Components

#### JobCard Component
- Displays job information in a card format
- Actions: View Details, Edit, Delete, Copy Application Link
- Status indicators with color coding
- Responsive design

## Data Flow

### Creating a Job
1. User fills out form on `/jobs/create`
2. Form data is validated
3. `createJob` method in JobsContext is called
4. API request sent to `POST /api/jobs`
5. Response is transformed to frontend format
6. Job is added to the jobs list
7. User is redirected to jobs list

### Reading Jobs
1. Jobs list page loads
2. `fetchJobs` method is called automatically
3. API request sent to `GET /api/jobs` with pagination/filtering
4. Response is transformed and stored in context
5. Jobs are displayed in JobCard components

### Updating a Job
1. User navigates to `/jobs/[id]/edit`
2. Current job data is loaded via `getJobById`
3. Form is pre-populated with existing data
4. User makes changes and submits
5. `updateJob` method is called
6. API request sent to `PUT /api/jobs/[id]`
7. Job is updated in context
8. User is redirected to job details

### Deleting a Job
1. User clicks delete button on JobCard
2. Confirmation dialog is shown
3. `deleteJob` method is called
4. API request sent to `DELETE /api/jobs/[id]`
5. Job is removed from context
6. Jobs list is refreshed

## Error Handling

### Backend Error Handling
- Input validation for required fields
- Database constraint checks
- Dependency checks (e.g., cannot delete job with candidates)
- Proper HTTP status codes and error messages

### Frontend Error Handling
- Loading states for all async operations
- Error display with dismiss functionality
- Form validation
- Network error handling
- User-friendly error messages

## Data Transformation

The application handles data transformation between backend and frontend formats:

### Backend to Frontend
- `application_link` → `applicationLink`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

### Frontend to Backend
- `applicationLink` → `application_link`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

## Security Features

- Authentication required for all job operations
- Authorization checks (if implemented)
- Input sanitization
- SQL injection prevention (via Supabase)

## Performance Optimizations

- Pagination for large datasets
- Client-side filtering for search
- Optimistic updates for better UX
- Loading states to prevent multiple requests

## Usage Examples

### Creating a Job
```typescript
const { createJob } = useJobs();

const handleSubmit = async (formData: JobForm) => {
  const newJob = await createJob(formData);
  if (newJob) {
    // Success - redirect or show success message
  }
};
```

### Fetching Jobs with Filters
```typescript
const { fetchJobs } = useJobs();

// Fetch first page with 10 items
await fetchJobs(1, 10);

// Fetch published jobs only
await fetchJobs(1, 10, 'published');
```

### Updating a Job
```typescript
const { updateJob } = useJobs();

const handleUpdate = async (jobId: string, updates: Partial<JobForm>) => {
  const updatedJob = await updateJob(jobId, updates);
  if (updatedJob) {
    // Success - redirect or show success message
  }
};
```

## Testing

To test the integration:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Set up environment variables**:
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials

3. **Test CRUD operations**:
   - Navigate to `/jobs`
   - Create a new job
   - Edit an existing job
   - Delete a job
   - Test filtering and pagination

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

2. **Database Connection Issues**
   - Check Supabase project status
   - Verify database schema matches expected structure

3. **Authentication Issues**
   - Ensure user is logged in before accessing job pages
   - Check AuthContext implementation

4. **Form Validation Errors**
   - Check required fields are filled
   - Verify data types match expected format

### Debug Tips

- Check browser console for JavaScript errors
- Check Network tab for API request/response issues
- Use Supabase dashboard to verify database operations
- Add console.log statements in context methods for debugging
