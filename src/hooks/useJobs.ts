import { useState, useEffect, useCallback } from 'react';
import { JobPosting, PaginatedResponse } from '@/types';
import { JobsService } from '@/services/jobsService';

interface UseJobsOptions {
  initialStatus?: string;
  initialPage?: number;
  initialLimit?: number;
}

interface UseJobsReturn {
  // State
  jobs: JobPosting[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Actions
  fetchJobs: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  createJob: (jobData: Partial<JobPosting>) => Promise<JobPosting>;
  updateJob: (id: string, jobData: Partial<JobPosting>) => Promise<JobPosting>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Promise<JobPosting>;
  searchJobs: (query: string) => Promise<JobPosting[]>;
  getJobStats: () => Promise<{
    total: number;
    draft: number;
    published: number;
    closed: number;
  }>;
  
  // Utilities
  refreshJobs: () => Promise<void>;
  clearError: () => void;
}

export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const { initialStatus, initialPage = 1, initialLimit = 10 } = options;
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchJobs = useCallback(async (params: { status?: string; page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await JobsService.getJobs({
        status: params.status || initialStatus,
        page: params.page || initialPage,
        limit: params.limit || initialLimit
      });
      
      setJobs(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        hasNext: response.page < response.totalPages,
        hasPrev: response.page > 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [initialStatus, initialPage, initialLimit]);

  const createJob = useCallback(async (jobData: Partial<JobPosting>): Promise<JobPosting> => {
    setLoading(true);
    setError(null);
    
    try {
      const newJob = await JobsService.createJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id: string, jobData: Partial<JobPosting>): Promise<JobPosting> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedJob = await JobsService.updateJob(id, jobData);
      setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await JobsService.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback(async (id: string): Promise<JobPosting> => {
    setLoading(true);
    setError(null);
    
    try {
      const job = await JobsService.getJobById(id);
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchJobs = useCallback(async (query: string): Promise<JobPosting[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await JobsService.searchJobs(query);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search jobs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await JobsService.getJobStats();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobById,
    searchJobs,
    getJobStats,
    refreshJobs,
    clearError
  };
}
