'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { JobPosting, JobForm, ApiResponse, PaginatedResponse } from '@/types';

interface JobsState {
  jobs: JobPosting[];
  currentJob: JobPosting | null;
  isLoading: boolean;
  error: string | null;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
}

type JobsAction =
  | { type: 'FETCH_JOBS_START' }
  | { type: 'FETCH_JOBS_SUCCESS'; payload: { jobs: JobPosting[]; total: number; page: number; totalPages: number } }
  | { type: 'FETCH_JOBS_FAILURE'; payload: string }
  | { type: 'CREATE_JOB_START' }
  | { type: 'CREATE_JOB_SUCCESS'; payload: JobPosting }
  | { type: 'CREATE_JOB_FAILURE'; payload: string }
  | { type: 'UPDATE_JOB_START' }
  | { type: 'UPDATE_JOB_SUCCESS'; payload: JobPosting }
  | { type: 'UPDATE_JOB_FAILURE'; payload: string }
  | { type: 'DELETE_JOB_START' }
  | { type: 'DELETE_JOB_SUCCESS'; payload: string }
  | { type: 'DELETE_JOB_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_JOB'; payload: JobPosting | null }
  | { type: 'CLEAR_ERROR' };

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  totalJobs: 0,
  currentPage: 1,
  totalPages: 1,
};

const jobsReducer = (state: JobsState, action: JobsAction): JobsState => {
  switch (action.type) {
    case 'FETCH_JOBS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_JOBS_SUCCESS':
      return {
        ...state,
        jobs: action.payload.jobs,
        totalJobs: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        isLoading: false,
        error: null,
      };
    case 'FETCH_JOBS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CREATE_JOB_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CREATE_JOB_SUCCESS':
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        isLoading: false,
        error: null,
      };
    case 'CREATE_JOB_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'UPDATE_JOB_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'UPDATE_JOB_SUCCESS':
      return {
        ...state,
        jobs: state.jobs.map(job => job.id === action.payload.id ? action.payload : job),
        currentJob: state.currentJob?.id === action.payload.id ? action.payload : state.currentJob,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_JOB_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'DELETE_JOB_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'DELETE_JOB_SUCCESS':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        currentJob: state.currentJob?.id === action.payload ? null : state.currentJob,
        isLoading: false,
        error: null,
      };
    case 'DELETE_JOB_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_JOB':
      return {
        ...state,
        currentJob: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface JobsContextType extends JobsState {
  fetchJobs: (page?: number, limit?: number, status?: string) => Promise<void>;
  createJob: (jobData: JobForm) => Promise<JobPosting | null>;
  updateJob: (id: string, jobData: Partial<JobForm>) => Promise<JobPosting | null>;
  deleteJob: (id: string) => Promise<boolean>;
  getJobById: (id: string) => Promise<JobPosting | null>;
  setCurrentJob: (job: JobPosting | null) => void;
  clearError: () => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

interface JobsProviderProps {
  children: ReactNode;
}

export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(jobsReducer, initialState);

  const fetchJobs = async (page = 1, limit = 10, status?: string) => {
    dispatch({ type: 'FETCH_JOBS_START' });
    
    try {
      let url = `/api/jobs?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the data to match our frontend types
      const transformedJobs: JobPosting[] = data.data.map((job: Record<string, unknown>) => ({
        id: job.id as string,
        title: job.title as string,
        description: job.description as string,
        performance: {
          experience: (job.performance as any)?.experience || '',
          deliveries: (job.performance as any)?.deliveries || '',
          skills: (job.performance as any)?.skills || [],
        },
        energy: {
          availability: (job.energy as any)?.availability || '',
          deadlines: (job.energy as any)?.deadlines || '',
          pressure: (job.energy as any)?.pressure || '',
        },
        culture: {
          legalValues: (job.culture as any)?.legalValues || [],
        },
        applicationLink: job.application_link as string,
        status: job.status as 'draft' | 'published' | 'closed',
        createdAt: job.created_at as string,
        updatedAt: job.updated_at as string,
      }));

      dispatch({
        type: 'FETCH_JOBS_SUCCESS',
        payload: {
          jobs: transformedJobs,
          total: data.pagination.total,
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      dispatch({ type: 'FETCH_JOBS_FAILURE', payload: 'Failed to fetch jobs' });
    }
  };

  const createJob = async (jobData: JobForm): Promise<JobPosting | null> => {
    dispatch({ type: 'CREATE_JOB_START' });
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      const data = await response.json();
      
      // Transform the response to match our frontend types
      const newJob: JobPosting = {
        id: data.data.id as string,
        title: data.data.title as string,
        description: data.data.description as string,
        performance: {
          experience: (data.data.performance as any)?.experience || '',
          deliveries: (data.data.performance as any)?.deliveries || '',
          skills: (data.data.performance as any)?.skills || [],
        },
        energy: {
          availability: (data.data.energy as any)?.availability || '',
          deadlines: (data.data.energy as any)?.deadlines || '',
          pressure: (data.data.energy as any)?.pressure || '',
        },
        culture: {
          legalValues: (data.data.culture as any)?.legalValues || [],
        },
        applicationLink: data.data.application_link as string,
        status: data.data.status as 'draft' | 'published' | 'closed',
        createdAt: data.data.created_at as string,
        updatedAt: data.data.updated_at as string,
      };

      dispatch({ type: 'CREATE_JOB_SUCCESS', payload: newJob });
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
      dispatch({ type: 'CREATE_JOB_FAILURE', payload: errorMessage });
      return null;
    }
  };

  const updateJob = async (id: string, jobData: Partial<JobForm>): Promise<JobPosting | null> => {
    dispatch({ type: 'UPDATE_JOB_START' });
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job');
      }

      const data = await response.json();
      
      // Transform the response to match our frontend types
      const updatedJob: JobPosting = {
        id: data.data.id as string,
        title: data.data.title as string,
        description: data.data.description as string,
        performance: {
          experience: (data.data.performance as any)?.experience || '',
          deliveries: (data.data.performance as any)?.deliveries || '',
          skills: (data.data.performance as any)?.skills || [],
        },
        energy: {
          availability: (data.data.energy as any)?.availability || '',
          deadlines: (data.data.energy as any)?.deadlines || '',
          pressure: (data.data.energy as any)?.pressure || '',
        },
        culture: {
          legalValues: (data.data.culture as any)?.legalValues || [],
        },
        applicationLink: data.data.application_link as string,
        status: data.data.status as 'draft' | 'published' | 'closed',
        createdAt: data.data.created_at as string,
        updatedAt: data.data.updated_at as string,
      };

      dispatch({ type: 'UPDATE_JOB_SUCCESS', payload: updatedJob });
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job';
      dispatch({ type: 'UPDATE_JOB_FAILURE', payload: errorMessage });
      return null;
    }
  };

  const deleteJob = async (id: string): Promise<boolean> => {
    dispatch({ type: 'DELETE_JOB_START' });
    
    try {
      const response = await fetch(`/api/jobs/${id}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      dispatch({ type: 'DELETE_JOB_SUCCESS', payload: id });
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
      dispatch({ type: 'DELETE_JOB_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const getJobById = async (id: string): Promise<JobPosting | null> => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to match our frontend types
      const job: JobPosting = {
        id: data.data.id as string,
        title: data.data.title as string,
        description: data.data.description as string,
        performance: {
          experience: (data.data.performance as any)?.experience || '',
          deliveries: (data.data.performance as any)?.deliveries || '',
          skills: (data.data.performance as any)?.skills || [],
        },
        energy: {
          availability: (data.data.energy as any)?.availability || '',
          deadlines: (data.data.energy as any)?.deadlines || '',
          pressure: (data.data.energy as any)?.pressure || '',
        },
        culture: {
          legalValues: (data.data.culture as any)?.legalValues || [],
        },
        applicationLink: data.data.application_link as string,
        status: data.data.status as 'draft' | 'published' | 'closed',
        createdAt: data.data.created_at as string,
        updatedAt: data.data.updated_at as string,
      };

      return job;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }
  };

  const setCurrentJob = (job: JobPosting | null) => {
    dispatch({ type: 'SET_CURRENT_JOB', payload: job });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const value: JobsContextType = {
    ...state,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobById,
    setCurrentJob,
    clearError,
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};
