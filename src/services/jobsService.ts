import { supabase } from '@/lib/supabase';
import { Job, JobInsert, JobUpdate } from '@/lib/supabase';
import { JobPosting, ApiResponse, PaginatedResponse } from '@/types';

// Transform database job to frontend job format
const transformJobToFrontend = (dbJob: Job): JobPosting => ({
  id: dbJob.id,
  title: dbJob.title,
  description: dbJob.description,
  performance: dbJob.performance,
  energy: dbJob.energy,
  culture: dbJob.culture,
  applicationLink: dbJob.application_link,
  status: dbJob.status,
  createdAt: dbJob.created_at,
  updatedAt: dbJob.updated_at
});

// Transform frontend job to database format
const transformJobToDatabase = (frontendJob: Partial<JobPosting>): Partial<JobInsert> => ({
  title: frontendJob.title,
  description: frontendJob.description,
  performance: frontendJob.performance,
  energy: frontendJob.energy,
  culture: frontendJob.culture,
  application_link: frontendJob.applicationLink,
  status: frontendJob.status
});

export class JobsService {
  // Get all jobs with pagination and filtering
  static async getJobs(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<JobPosting>> {
    const { status, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: jobs?.map(transformJobToFrontend) || [],
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  // Get a single job by ID
  static async getJobById(id: string): Promise<JobPosting> {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    return transformJobToFrontend(job);
  }

  // Create a new job
  static async createJob(jobData: Partial<JobPosting>): Promise<JobPosting> {
    const dbJobData = transformJobToDatabase(jobData) as JobInsert;

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(dbJobData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return transformJobToFrontend(job);
  }

  // Update an existing job
  static async updateJob(id: string, jobData: Partial<JobPosting>): Promise<JobPosting> {
    // Check if job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      throw new Error('Job not found');
    }

    const updateData: JobUpdate = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (jobData.title !== undefined) updateData.title = jobData.title;
    if (jobData.description !== undefined) updateData.description = jobData.description;
    if (jobData.performance !== undefined) updateData.performance = jobData.performance;
    if (jobData.energy !== undefined) updateData.energy = jobData.energy;
    if (jobData.culture !== undefined) updateData.culture = jobData.culture;
    if (jobData.applicationLink !== undefined) updateData.application_link = jobData.applicationLink;
    if (jobData.status !== undefined) updateData.status = jobData.status;

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return transformJobToFrontend(updatedJob);
  }

  // Delete a job
  static async deleteJob(id: string): Promise<void> {
    // Check if job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      throw new Error('Job not found');
    }

    // Check if there are any candidates associated with this job
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id')
      .eq('job_id', id);

    if (candidatesError) {
      throw new Error(`Failed to check job dependencies: ${candidatesError.message}`);
    }

    if (candidates && candidates.length > 0) {
      throw new Error('Cannot delete job with existing candidates. Please remove all candidates first.');
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  // Get jobs by status
  static async getJobsByStatus(status: 'draft' | 'published' | 'closed'): Promise<JobPosting[]> {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch jobs by status: ${error.message}`);
    }

    return jobs?.map(transformJobToFrontend) || [];
  }

  // Search jobs by title or description
  static async searchJobs(query: string): Promise<JobPosting[]> {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search jobs: ${error.message}`);
    }

    return jobs?.map(transformJobToFrontend) || [];
  }

  // Get job statistics
  static async getJobStats(): Promise<{
    total: number;
    draft: number;
    published: number;
    closed: number;
  }> {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('status');

    if (error) {
      throw new Error(`Failed to fetch job statistics: ${error.message}`);
    }

    const stats = {
      total: jobs?.length || 0,
      draft: jobs?.filter(job => job.status === 'draft').length || 0,
      published: jobs?.filter(job => job.status === 'published').length || 0,
      closed: jobs?.filter(job => job.status === 'closed').length || 0
    };

    return stats;
  }
}
