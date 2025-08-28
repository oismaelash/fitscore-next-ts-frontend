import { useState, useEffect, useCallback } from 'react';
import { Interview } from '@/types';

interface UseInterviewsReturn {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInterview: (id: string, updates: Partial<Interview>) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  loadInterviews: (candidateId?: string, jobId?: string) => Promise<void>;
}

export function useInterviews(): UseInterviewsReturn {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInterviews = useCallback(async (candidateId?: string, jobId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (candidateId) params.append('candidateId', candidateId);
      if (jobId) params.append('jobId', jobId);
      
      const response = await fetch(`/api/interviews?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setInterviews(result.data);
      } else {
        setError(result.message || 'Failed to load interviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addInterview = useCallback(async (interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInterviews(prev => [...prev, result.data]);
      } else {
        setError(result.message || 'Failed to add interview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add interview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInterview = useCallback(async (id: string, updates: Partial<Interview>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/interviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInterviews(prev => 
          prev.map(interview => 
            interview.id === id ? result.data : interview
          )
        );
      } else {
        setError(result.message || 'Failed to update interview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteInterview = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/interviews?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInterviews(prev => prev.filter(interview => interview.id !== id));
      } else {
        setError(result.message || 'Failed to delete interview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    interviews,
    isLoading,
    error,
    addInterview,
    updateInterview,
    deleteInterview,
    loadInterviews,
  };
}
