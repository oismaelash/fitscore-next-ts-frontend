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
  fetchJobs: (page?: number, limit?: number) => Promise<void>;
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

  const fetchJobs = async (page = 1, limit = 10) => {
    dispatch({ type: 'FETCH_JOBS_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/jobs?page=${page}&limit=${limit}`);
      // const data: PaginatedResponse<JobPosting> = await response.json();
      
      // Mock data for now
      const mockJobs: JobPosting[] = [
        {
          id: '1',
          title: 'Senior React Developer',
          description: 'We are looking for a senior React developer...',
          performance: {
            experience: '5+ years',
            deliveries: 'High quality code',
            skills: ['React', 'TypeScript', 'Node.js'],
          },
          energy: {
            availability: 'Full-time',
            deadlines: 'Flexible',
            pressure: 'Medium',
          },
          culture: {
            legalValues: ['Innovation', 'Collaboration'],
          },
          applicationLink: 'https://example.com/apply/1',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      dispatch({
        type: 'FETCH_JOBS_SUCCESS',
        payload: {
          jobs: mockJobs,
          total: mockJobs.length,
          page,
          totalPages: 1,
        },
      });
    } catch (error) {
      dispatch({ type: 'FETCH_JOBS_FAILURE', payload: 'Failed to fetch jobs' });
    }
  };

  const createJob = async (jobData: JobForm): Promise<JobPosting | null> => {
    dispatch({ type: 'CREATE_JOB_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch('/api/jobs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(jobData),
      // });
      // const data: ApiResponse<JobPosting> = await response.json();
      
      // Mock implementation
      const newJob: JobPosting = {
        id: Date.now().toString(),
        ...jobData,
        applicationLink: `https://example.com/apply/${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'CREATE_JOB_SUCCESS', payload: newJob });
      return newJob;
    } catch (error) {
      dispatch({ type: 'CREATE_JOB_FAILURE', payload: 'Failed to create job' });
      return null;
    }
  };

  const updateJob = async (id: string, jobData: Partial<JobForm>): Promise<JobPosting | null> => {
    dispatch({ type: 'UPDATE_JOB_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/jobs/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(jobData),
      // });
      // const data: ApiResponse<JobPosting> = await response.json();
      
      // Mock implementation
      const updatedJob: JobPosting = {
        ...state.jobs.find(job => job.id === id)!,
        ...jobData,
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_JOB_SUCCESS', payload: updatedJob });
      return updatedJob;
    } catch (error) {
      dispatch({ type: 'UPDATE_JOB_FAILURE', payload: 'Failed to update job' });
      return null;
    }
  };

  const deleteJob = async (id: string): Promise<boolean> => {
    dispatch({ type: 'DELETE_JOB_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      
      dispatch({ type: 'DELETE_JOB_SUCCESS', payload: id });
      return true;
    } catch (error) {
      dispatch({ type: 'DELETE_JOB_FAILURE', payload: 'Failed to delete job' });
      return false;
    }
  };

  const getJobById = async (id: string): Promise<JobPosting | null> => {
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/jobs/${id}`);
      // const data: ApiResponse<JobPosting> = await response.json();
      
      // Mock implementation
      const job = state.jobs.find(job => job.id === id) || null;
      return job;
    } catch (error) {
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
