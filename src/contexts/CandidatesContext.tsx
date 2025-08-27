'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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

  const fetchCandidates = async (jobId: string, page = 1, limit = 10) => {
    dispatch({ type: 'FETCH_CANDIDATES_START' });
    dispatch({ type: 'SET_CURRENT_JOB_ID', payload: jobId });
    
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/candidates?jobId=${jobId}&page=${page}&limit=${limit}`);
      // const data: PaginatedResponse<Candidate> = await response.json();
      
      // Mock data for now
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          jobId,
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          resumeUrl: 'https://example.com/resume1.pdf',
          culturalFit: {
            performance: 'High performer with excellent track record',
            energy: 'Very energetic and deadline-driven',
            culture: 'Strong alignment with company values',
          },
          fitScore: {
            id: 'fs1',
            candidateId: '1',
            jobId,
            technicalScore: 85,
            culturalScore: 90,
            behavioralScore: 88,
            overallScore: 87.7,
            aiAnalysis: 'Strong technical skills with excellent cultural fit...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'reviewed',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          jobId,
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+1234567891',
          resumeUrl: 'https://example.com/resume2.pdf',
          culturalFit: {
            performance: 'Consistent performer with good results',
            energy: 'Balanced approach to work-life',
            culture: 'Good cultural alignment',
          },
          status: 'new',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          jobId,
          name: 'Michael Johnson',
          email: 'michael.johnson@example.com',
          phone: '+1234567892',
          resumeUrl: 'https://example.com/resume3.pdf',
          culturalFit: {
            performance: 'Exceptional technical skills and leadership',
            energy: 'High energy, thrives under pressure',
            culture: 'Perfect cultural match with innovation focus',
          },
          fitScore: {
            id: 'fs3',
            candidateId: '3',
            jobId,
            technicalScore: 92,
            culturalScore: 95,
            behavioralScore: 89,
            overallScore: 92.0,
            aiAnalysis: 'Top-tier candidate with outstanding technical and cultural alignment...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'sent_to_manager',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          jobId,
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+1234567893',
          resumeUrl: 'https://example.com/resume4.pdf',
          culturalFit: {
            performance: 'Solid technical background with room for growth',
            energy: 'Steady performer, reliable',
            culture: 'Good fit with collaborative environment',
          },
          fitScore: {
            id: 'fs4',
            candidateId: '4',
            jobId,
            technicalScore: 72,
            culturalScore: 78,
            behavioralScore: 75,
            overallScore: 75.0,
            aiAnalysis: 'Competent candidate with good potential for growth...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'reviewed',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          jobId,
          name: 'David Chen',
          email: 'david.chen@example.com',
          phone: '+1234567894',
          resumeUrl: 'https://example.com/resume5.pdf',
          culturalFit: {
            performance: 'Strong analytical skills and problem-solving',
            energy: 'Methodical and thorough approach',
            culture: 'Values integrity and excellence',
          },
          fitScore: {
            id: 'fs5',
            candidateId: '5',
            jobId,
            technicalScore: 88,
            culturalScore: 82,
            behavioralScore: 85,
            overallScore: 85.0,
            aiAnalysis: 'Excellent technical candidate with strong analytical skills...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'reviewed',
          createdAt: new Date().toISOString(),
        },
        {
          id: '6',
          jobId,
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@example.com',
          phone: '+1234567895',
          resumeUrl: 'https://example.com/resume6.pdf',
          culturalFit: {
            performance: 'Junior developer with potential',
            energy: 'Enthusiastic and eager to learn',
            culture: 'Good cultural fit, team-oriented',
          },
          status: 'new',
          createdAt: new Date().toISOString(),
        },
        {
          id: '7',
          jobId,
          name: 'Alex Thompson',
          email: 'alex.thompson@example.com',
          phone: '+1234567896',
          resumeUrl: 'https://example.com/resume7.pdf',
          culturalFit: {
            performance: 'Experienced developer with leadership skills',
            energy: 'High energy and results-driven',
            culture: 'Strong alignment with company values',
          },
          fitScore: {
            id: 'fs7',
            candidateId: '7',
            jobId,
            technicalScore: 79,
            culturalScore: 85,
            behavioralScore: 82,
            overallScore: 82.0,
            aiAnalysis: 'Experienced candidate with good leadership potential...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'sent_to_manager',
          createdAt: new Date().toISOString(),
        },
        {
          id: '8',
          jobId,
          name: 'Lisa Park',
          email: 'lisa.park@example.com',
          phone: '+1234567897',
          resumeUrl: 'https://example.com/resume8.pdf',
          culturalFit: {
            performance: 'Creative problem solver with unique perspective',
            energy: 'Innovative and adaptable',
            culture: 'Brings diversity and fresh ideas',
          },
          fitScore: {
            id: 'fs8',
            candidateId: '8',
            jobId,
            technicalScore: 68,
            culturalScore: 75,
            behavioralScore: 70,
            overallScore: 71.0,
            aiAnalysis: 'Creative candidate with unique perspective, some technical gaps...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'reviewed',
          createdAt: new Date().toISOString(),
        },
        {
          id: '9',
          jobId,
          name: 'Robert Kim',
          email: 'robert.kim@example.com',
          phone: '+1234567898',
          resumeUrl: 'https://example.com/resume9.pdf',
          culturalFit: {
            performance: 'Senior developer with extensive experience',
            energy: 'Calm and methodical under pressure',
            culture: 'Values quality and mentorship',
          },
          fitScore: {
            id: 'fs9',
            candidateId: '9',
            jobId,
            technicalScore: 91,
            culturalScore: 88,
            behavioralScore: 90,
            overallScore: 89.7,
            aiAnalysis: 'Senior candidate with excellent technical skills and mentorship potential...',
            calculatedAt: new Date().toISOString(),
          },
          status: 'sent_to_manager',
          createdAt: new Date().toISOString(),
        },
        {
          id: '10',
          jobId,
          name: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          phone: '+1234567899',
          resumeUrl: 'https://example.com/resume10.pdf',
          culturalFit: {
            performance: 'Entry-level developer with strong fundamentals',
            energy: 'Eager to learn and grow',
            culture: 'Great team player and communicator',
          },
          status: 'new',
          createdAt: new Date().toISOString(),
        },
      ];

      dispatch({
        type: 'FETCH_CANDIDATES_SUCCESS',
        payload: {
          candidates: mockCandidates,
          total: mockCandidates.length,
          page,
          totalPages: 1,
        },
      });
    } catch (error) {
      dispatch({ type: 'FETCH_CANDIDATES_FAILURE', payload: 'Failed to fetch candidates' });
    }
  };

  const createCandidate = async (candidateData: CandidateForm, jobId: string): Promise<Candidate | null> => {
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
  };

  const updateCandidate = async (id: string, candidateData: Partial<Candidate>): Promise<Candidate | null> => {
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
  };

  const getCandidateById = async (id: string): Promise<Candidate | null> => {
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
  };

  const calculateFitScore = async (candidateId: string, jobId: string): Promise<FitScore | null> => {
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
  };

  const setCurrentCandidate = (candidate: Candidate | null) => {
    dispatch({ type: 'SET_CURRENT_CANDIDATE', payload: candidate });
  };

  const setCurrentJobId = (jobId: string | null) => {
    dispatch({ type: 'SET_CURRENT_JOB_ID', payload: jobId });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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
