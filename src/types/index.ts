// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'recruiter';
  createdAt: string;
}

// Job posting types
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  performance: {
    experience: string;
    deliveries: string;
    skills: string[];
  };
  energy: {
    availability: string;
    deadlines: string;
    pressure: string;
  };
  culture: {
    legalValues: string[];
  };
  applicationLink: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Candidate types
export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  culturalFit: {
    performance: string;
    energy: string;
    culture: string;
  };
  fitScore?: FitScore;
  status: 'new' | 'reviewed' | 'sent_to_manager';
  createdAt: string;
}

// FitScore types
export interface FitScore {
  id: string;
  candidateId: string;
  jobId: string;
  technicalScore: number;
  culturalScore: number;
  behavioralScore: number;
  overallScore: number;
  aiAnalysis: string;
  calculatedAt: string;
}

// Report types
export interface Report {
  id: string;
  jobId: string;
  managerEmail: string;
  candidates: Candidate[];
  fitScores: FitScore[];
  reportUrl: string;
  sentAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'recruiter';
}

export interface JobForm {
  title: string;
  description: string;
  performance: {
    experience: string;
    deliveries: string;
    skills: string[];
  };
  energy: {
    availability: string;
    deadlines: string;
    pressure: string;
  };
  culture: {
    legalValues: string[];
  };
}

export interface CandidateForm {
  name: string;
  email: string;
  phone: string;
  resume: File;
  culturalFit: {
    performance: string;
    energy: string;
    culture: string;
  };
}
