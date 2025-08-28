'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Candidate, CandidateForm, FitScore, ApiResponse, PaginatedResponse } from '@/types';

interface CandidatesState {
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  isLoading: boolean;
  error: string | null;
  totalCandidates: number;
  currentPage: number;
  totalPages: number;
  currentJobId: string | null;
}

type CandidatesAction =
  | { type: 'FETCH_CANDIDATES_START' }
  | { type: 'FETCH_CANDIDATES_SUCCESS'; payload: { candidates: Candidate[]; total: number; page: number; totalPages: number } }
  | { type: 'FETCH_CANDIDATES_FAILURE'; payload: string }
  | { type: 'CREATE_CANDIDATE_START' }
  | { type: 'CREATE_CANDIDATE_SUCCESS'; payload: Candidate }
  | { type: 'CREATE_CANDIDATE_FAILURE'; payload: string }
  | { type: 'UPDATE_CANDIDATE_START' }
  | { type: 'UPDATE_CANDIDATE_SUCCESS'; payload: Candidate }
  | { type: 'UPDATE_CANDIDATE_FAILURE'; payload: string }
  | { type: 'CALCULATE_FITSCORE_START' }
  | { type: 'CALCULATE_FITSCORE_SUCCESS'; payload: { candidateId: string; fitScore: FitScore } }
  | { type: 'CALCULATE_FITSCORE_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_CANDIDATE'; payload: Candidate | null }
  | { type: 'SET_CURRENT_JOB_ID'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: CandidatesState = {
  candidates: [],
  currentCandidate: null,
  isLoading: false,
  error: null,
  totalCandidates: 0,
  currentPage: 1,
  totalPages: 1,
  currentJobId: null,
};

const candidatesReducer = (state: CandidatesState, action: CandidatesAction): CandidatesState => {
  switch (action.type) {
    case 'FETCH_CANDIDATES_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_CANDIDATES_SUCCESS':
      return {
        ...state,
        candidates: action.payload.candidates,
        totalCandidates: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        isLoading: false,
        error: null,
      };
    case 'FETCH_CANDIDATES_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CREATE_CANDIDATE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CREATE_CANDIDATE_SUCCESS':
      return {
        ...state,
        candidates: [action.payload, ...state.candidates],
        isLoading: false,
        error: null,
      };
    case 'CREATE_CANDIDATE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'UPDATE_CANDIDATE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'UPDATE_CANDIDATE_SUCCESS':
      return {
        ...state,
        candidates: state.candidates.map(candidate => 
          candidate.id === action.payload.id ? action.payload : candidate
        ),
        currentCandidate: state.currentCandidate?.id === action.payload.id ? action.payload : state.currentCandidate,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_CANDIDATE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CALCULATE_FITSCORE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CALCULATE_FITSCORE_SUCCESS':
      return {
        ...state,
        candidates: state.candidates.map(candidate => 
          candidate.id === action.payload.candidateId 
            ? { ...candidate, fitScore: action.payload.fitScore }
            : candidate
        ),
        currentCandidate: state.currentCandidate?.id === action.payload.candidateId 
          ? { ...state.currentCandidate, fitScore: action.payload.fitScore }
          : state.currentCandidate,
        isLoading: false,
        error: null,
      };
    case 'CALCULATE_FITSCORE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_CANDIDATE':
      return {
        ...state,
        currentCandidate: action.payload,
      };
    case 'SET_CURRENT_JOB_ID':
      return {
        ...state,
        currentJobId: action.payload,
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

interface CandidatesContextType extends CandidatesState {
  fetchCandidates: (jobId: string, page?: number, limit?: number) => Promise<void>;
  createCandidate: (candidateData: CandidateForm, jobId: string) => Promise<Candidate | null>;
  updateCandidate: (id: string, candidateData: Partial<Candidate>) => Promise<Candidate | null>;
  getCandidateById: (id: string) => Promise<Candidate | null>;
  calculateFitScore: (candidateId: string, jobId: string) => Promise<FitScore | null>;
  setCurrentCandidate: (candidate: Candidate | null) => void;
  setCurrentJobId: (jobId: string | null) => void;
  clearError: () => void;
}

const CandidatesContext = createContext<CandidatesContextType | undefined>(undefined);

export const useCandidates = () => {
  const context = useContext(CandidatesContext);
  if (context === undefined) {
    throw new Error('useCandidates must be used within a CandidatesProvider');
  }
  return context;
};

interface CandidatesProviderProps {
  children: ReactNode;
}

export const CandidatesProvider: React.FC<CandidatesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(candidatesReducer, initialState);

  const fetchCandidates = useCallback(async (jobId: string, page = 1, limit = 10) => {
    dispatch({ type: 'FETCH_CANDIDATES_START' });
    dispatch({ type: 'SET_CURRENT_JOB_ID', payload: jobId });
    
    try {
      const response = await fetch(`/api/candidates?jobId=${jobId}&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch candidates: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch candidates');
      }
      
      // Transform the API response to match our Candidate type
      const candidates: Candidate[] = data.data.map((candidate: any) => ({
        id: candidate.id,
        jobId: candidate.jobId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resumeUrl: candidate.resumeUrl,
        culturalFit: candidate.culturalFit,
        status: candidate.status,
        createdAt: candidate.createdAt,
        fitScore: candidate.fitScore || undefined
      }));
      
      dispatch({
        type: 'FETCH_CANDIDATES_SUCCESS',
        payload: {
          candidates,
          total: candidates.length, // API doesn't return pagination info yet
          page,
          totalPages: 1 // API doesn't return pagination info yet
        }
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      dispatch({
        type: 'FETCH_CANDIDATES_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to fetch candidates'
      });
    }
  }, []);

  const createCandidate = useCallback(async (candidateData: CandidateForm, jobId: string): Promise<Candidate | null> => {
    dispatch({ type: 'CREATE_CANDIDATE_START' });
    
    try {
      // TODO: Implement API call
      // const formData = new FormData();
      // Object.entries(candidateData).forEach(([key, value]) => {
      //   if (key === 'resume') {
      //     formData.append(key, value);
      //   } else if (key === 'culturalFit') {
      //     formData.append(key, JSON.stringify(value));
      //   } else {
      //     formData.append(key, value);
      //   }
      // });
      // formData.append('jobId', jobId);
      // const response = await fetch('/api/candidates', { method: 'POST', body: formData });
      // const data: ApiResponse<Candidate> = await response.json();
      
      // Mock implementation
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        jobId,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        resumeUrl: 'https://example.com/resume.pdf', // Mock URL
        culturalFit: candidateData.culturalFit,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'CREATE_CANDIDATE_SUCCESS', payload: newCandidate });
      return newCandidate;
    } catch (error) {
      dispatch({ type: 'CREATE_CANDIDATE_FAILURE', payload: 'Failed to create candidate' });
      return null;
    }
  }, []);

  const updateCandidate = useCallback(async (id: string, candidateData: Partial<Candidate>): Promise<Candidate | null> => {
    dispatch({ type: 'UPDATE_CANDIDATE_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/candidates/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(candidateData),
      // });
      // const data: ApiResponse<Candidate> = await response.json();
      
      // Mock implementation
      const updatedCandidate: Candidate = {
        ...state.candidates.find(candidate => candidate.id === id)!,
        ...candidateData,
      };

      dispatch({ type: 'UPDATE_CANDIDATE_SUCCESS', payload: updatedCandidate });
      return updatedCandidate;
    } catch (error) {
      dispatch({ type: 'UPDATE_CANDIDATE_FAILURE', payload: 'Failed to update candidate' });
      return null;
    }
  }, [state.candidates]);

  const getCandidateById = useCallback(async (id: string): Promise<Candidate | null> => {
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/candidates/${id}`);
      // const data: ApiResponse<Candidate> = await response.json();
      
      // Mock implementation
      const candidate = state.candidates.find(candidate => candidate.id === id) || null;
      return candidate;
    } catch (error) {
      return null;
    }
  }, [state.candidates]);

  const calculateFitScore = useCallback(async (candidateId: string, jobId: string): Promise<FitScore | null> => {
    dispatch({ type: 'CALCULATE_FITSCORE_START' });
    
    try {
      // TODO: Implement API call
      // const response = await fetch('/api/fitscore/calculate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ candidateId, jobId }),
      // });
      // const data: ApiResponse<FitScore> = await response.json();
      
      // Mock implementation
      const mockFitScore: FitScore = {
        id: `fs_${Date.now()}`,
        candidateId,
        jobId,
        technicalScore: Math.floor(Math.random() * 30) + 70, // 70-100
        culturalScore: Math.floor(Math.random() * 30) + 70,
        behavioralScore: Math.floor(Math.random() * 30) + 70,
        overallScore: 0, // Will be calculated
        aiAnalysis: 'AI analysis of candidate fit based on technical skills, cultural alignment, and behavioral patterns...',
        calculatedAt: new Date().toISOString(),
      };

      // Calculate overall score
      mockFitScore.overallScore = Math.round(
        (mockFitScore.technicalScore + mockFitScore.culturalScore + mockFitScore.behavioralScore) / 3
      );

      dispatch({ 
        type: 'CALCULATE_FITSCORE_SUCCESS', 
        payload: { candidateId, fitScore: mockFitScore } 
      });
      
      return mockFitScore;
    } catch (error) {
      dispatch({ type: 'CALCULATE_FITSCORE_FAILURE', payload: 'Failed to calculate FitScore' });
      return null;
    }
  }, []);

  const setCurrentCandidate = useCallback((candidate: Candidate | null) => {
    dispatch({ type: 'SET_CURRENT_CANDIDATE', payload: candidate });
  }, []);

  const setCurrentJobId = useCallback((jobId: string | null) => {
    dispatch({ type: 'SET_CURRENT_JOB_ID', payload: jobId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: CandidatesContextType = {
    ...state,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    getCandidateById,
    calculateFitScore,
    setCurrentCandidate,
    setCurrentJobId,
    clearError,
  };

  return <CandidatesContext.Provider value={value}>{children}</CandidatesContext.Provider>;
};
