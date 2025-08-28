'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCandidates } from '@/contexts/CandidatesContext';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard, InterviewHistoryForm, InterviewStats } from '@/components';
import { Candidate, JobPosting, Interview } from '@/types';
import { formatDate, getFitScoreColor, getFitScoreLabel, copyToClipboard } from '@/utils';

// Mock data for demonstration
const mockCandidate: Candidate = {
  id: '1',
  jobId: 'job-123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  resumeUrl: 'https://example.com/resumes/sarah-johnson-resume.pdf',
  culturalFit: {
    performance: 'Demonstrated exceptional problem-solving skills and consistently delivered high-quality work under tight deadlines. Shows strong analytical thinking and attention to detail.',
    energy: 'High energy individual who thrives in fast-paced environments. Excellent time management skills and ability to handle multiple projects simultaneously.',
    culture: 'Strong alignment with our values of innovation, collaboration, and continuous learning. Shows genuine passion for technology and helping others grow.',
  },
  fitScore: {
    id: 'fs-1',
    candidateId: '1',
    jobId: 'job-123',
    technicalScore: 92,
    culturalScore: 88,
    behavioralScore: 85,
    overallScore: 88.3,
    aiAnalysis: `Sarah Johnson demonstrates exceptional technical capabilities with a strong foundation in modern web development technologies. Her 92% technical score reflects proficiency in React, TypeScript, and cloud services.

Cultural alignment is excellent at 88%, showing strong values alignment with our company's emphasis on innovation and collaboration. Her responses indicate genuine passion for technology and helping others grow.

Behavioral assessment shows strong communication skills and problem-solving approach. At 85%, she demonstrates excellent teamwork abilities and adaptability to changing requirements.

Overall recommendation: Strong hire with high potential for growth and leadership. Consider for senior developer role with mentorship opportunities.`,
    calculatedAt: '2024-01-15T10:30:00Z',
  },
  status: 'reviewed',
  createdAt: '2024-01-10T14:22:00Z',
};

const mockJob: JobPosting = {
  id: 'job-123',
  title: 'Senior Full Stack Developer',
  description: 'We are looking for an experienced Full Stack Developer to join our growing team...',
  performance: {
    experience: '5+ years of experience in web development',
    deliveries: 'Ability to deliver complex features independently',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
  },
  energy: {
    availability: 'Full-time, flexible hours',
    deadlines: 'Fast-paced environment with regular releases',
    pressure: 'High-pressure environment with tight deadlines',
  },
  culture: {
    legalValues: ['Innovation', 'Collaboration', 'Excellence', 'Continuous Learning'],
  },
  applicationLink: 'https://fitscore.com/apply/job-123',
  status: 'published',
  createdAt: '2024-01-01T09:00:00Z',
  updatedAt: '2024-01-15T16:00:00Z',
};

// Mock interview data
const mockInterviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    jobId: 'job-123',
    type: 'Technical Interview',
    date: '2024-01-12T14:00:00Z',
    duration: '60 minutes',
    interviewer: 'Alex Chen',
    status: 'completed',
    notes: 'Excellent technical skills demonstrated. Strong problem-solving approach. Good communication during technical discussions. Recommended for next round.',
    score: 9.2,
    feedback: {
      technicalSkills: 9,
      communication: 8,
      problemSolving: 9,
      culturalFit: 8,
      experience: 9,
      overall: 9.2,
      strengths: ['Strong technical knowledge', 'Excellent problem-solving skills', 'Good communication'],
      areasForImprovement: ['Could improve on system design questions'],
      recommendation: 'strong_yes',
      nextSteps: 'Proceed to final round interview'
    },
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: '2',
    candidateId: '1',
    jobId: 'job-123',
    type: 'Cultural Fit Interview',
    date: '2024-01-14T10:00:00Z',
    duration: '45 minutes',
    interviewer: 'Maria Rodriguez',
    status: 'completed',
    notes: 'Great cultural alignment. Shows genuine interest in our mission. Strong team player mentality. Excellent communication skills.',
    score: 8.8,
    feedback: {
      technicalSkills: 7,
      communication: 9,
      problemSolving: 8,
      culturalFit: 9,
      experience: 8,
      overall: 8.8,
      strengths: ['Great cultural fit', 'Excellent communication', 'Team player'],
      areasForImprovement: ['Could provide more specific examples'],
      recommendation: 'yes',
      nextSteps: 'Schedule final round interview'
    },
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '3',
    candidateId: '1',
    jobId: 'job-123',
    type: 'Final Round Interview',
    date: '2024-01-20T15:00:00Z',
    duration: '90 minutes',
    interviewer: 'David Kim',
    status: 'scheduled',
    notes: '',
    score: undefined,
    feedback: {
      strengths: [],
      areasForImprovement: [],
      recommendation: 'maybe',
      nextSteps: ''
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
];

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  
  const { user, logout } = useAuth();
  const { candidates, isLoading: candidatesLoading, calculateFitScore, updateCandidate } = useCandidates();
  const { jobs, isLoading: jobsLoading, getJobById } = useJobs();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fitScore' | 'interview'>('overview');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [interviews, setInterviews] = useState(mockInterviews);
  const [quickNotes, setQuickNotes] = useState('Sarah shows excellent potential for the senior role. Her technical skills are outstanding and she demonstrates strong leadership qualities. Consider for team lead position in the future.');

  useEffect(() => {
    if (candidateId && candidates.length > 0) {
      const foundCandidate = candidates.find(c => c.id === candidateId);
      setCandidate(foundCandidate || null);
      
      if (foundCandidate) {
        loadJobData(foundCandidate.jobId);
      }
    } else {
      // Use mock data for demonstration
      setCandidate(mockCandidate);
      setJob(mockJob);
    }
  }, [candidateId, candidates]);

  const loadJobData = async (jobId: string) => {
    const foundJob = await getJobById(jobId);
    setJob(foundJob);
  };

  const handleCalculateFitScore = async () => {
    if (candidate && job) {
      await calculateFitScore(candidate.id, job.id);
    }
  };

  const handleUpdateStatus = async (newStatus: Candidate['status']) => {
    if (!candidate) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedCandidate = await updateCandidate(candidate.id, { status: newStatus });
      if (updatedCandidate) {
        setCandidate(updatedCandidate);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  const handleBackToCandidates = () => {
    router.push('/candidates');
  };

  const handleBackToJob = () => {
    if (job) {
      router.push(`/jobs/${job.id}`);
    }
  };

  const handleCopyEmail = async () => {
    if (candidate) {
      await copyToClipboard(candidate.email);
    }
  };

  const handleCopyPhone = async () => {
    if (candidate) {
      await copyToClipboard(candidate.phone);
    }
  };

  const handleSaveNotes = () => {
    // TODO: Implement save notes functionality
    alert('Notes saved successfully!');
  };

  const handleAddInterview = (interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      ...interviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInterviews([...interviews, newInterview]);
  };

  const handleUpdateInterview = (id: string, updates: Partial<Interview>) => {
    setInterviews(interviews.map(interview => 
      interview.id === id 
        ? { ...interview, ...updates, updatedAt: new Date().toISOString() }
        : interview
    ));
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(interviews.filter(interview => interview.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent_to_manager':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return '🆕';
      case 'reviewed':
        return '👁️';
      case 'sent_to_manager':
        return '📤';
      default:
        return '📋';
    }
  };



  const renderScoreBar = (score: number, label: string) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getFitScoreColor(score)}`}>
          {score}/100
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 90 ? 'bg-green-500' :
            score >= 80 ? 'bg-blue-500' :
            score >= 70 ? 'bg-yellow-500' :
            score >= 60 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  if (!candidate) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-light">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-dark">Loading candidate details...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-light">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCandidates}
                  className="text-primary hover:text-secondary transition-colors"
                >
                  ← Back to Candidates
                </button>
                <h1 className="text-2xl font-bold text-dark">{candidate.name}</h1>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isUpdatingStatus}
                    className={`flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(candidate.status)} hover:opacity-80 transition-opacity`}
                  >
                    <span>{getStatusIcon(candidate.status)}</span>
                    <span>{candidate.status.replace('_', ' ')}</span>
                    <span>▼</span>
                  </button>
                  
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {(['new', 'reviewed', 'sent_to_manager'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(status)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                              candidate.status === status ? 'bg-primary/10 text-primary' : 'text-gray-700'
                            }`}
                          >
                            <span>{getStatusIcon(status)}</span>
                            <span>{status.replace('_', ' ')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {job && (
                  <button
                    onClick={handleBackToJob}
                    className="bg-accent text-white px-4 py-2 rounded hover:bg-secondary transition-colors"
                  >
                    View Job
                  </button>
                )}
                <span className="text-dark">Welcome, {user?.name || 'Demo User'}</span>
                <button
                  onClick={logout}
                  className="text-primary hover:text-secondary transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Candidate Overview
              </button>
              <button
                onClick={() => setActiveTab('fitScore')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fitScore'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                FitScore Analysis
              </button>
              <button
                onClick={() => setActiveTab('interview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'interview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Interview History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <div className="space-y-8">
              {/* Candidate Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-dark mb-4">Candidate Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-dark mb-3">Personal Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-dark">{candidate.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-dark">{candidate.email}</p>
                          <button
                            onClick={handleCopyEmail}
                            className="text-primary hover:text-secondary transition-colors"
                            title="Copy email"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-dark">{candidate.phone}</p>
                          <button
                            onClick={handleCopyPhone}
                            className="text-primary hover:text-secondary transition-colors"
                            title="Copy phone"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-dark mb-3">Application Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Applied For</label>
                        <p className="text-dark">{job?.title || 'Senior Full Stack Developer'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Application Date</label>
                        <p className="text-dark">{formatDate(candidate.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Resume</label>
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-secondary transition-colors flex items-center space-x-1"
                        >
                          <span>View Resume</span>
                          <span>📄</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cultural Fit Assessment */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-dark mb-4">Cultural Fit Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-dark mb-2">Performance</h3>
                    <p className="text-gray-700">{candidate.culturalFit.performance}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-medium text-dark mb-2">Energy</h3>
                    <p className="text-gray-700">{candidate.culturalFit.energy}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-medium text-dark mb-2">Culture</h3>
                    <p className="text-gray-700">{candidate.culturalFit.culture}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-dark mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  {!candidate.fitScore ? (
                    <button
                      onClick={handleCalculateFitScore}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      Calculate FitScore
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('fitScore')}
                      className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      View FitScore Analysis
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/jobs/${candidate.jobId}`)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Job Details
                  </button>
                  <button
                    onClick={() => setActiveTab('interview')}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Add Interview Notes
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'fitScore' ? (
            <div className="space-y-8">
              {/* FitScore Overview */}
              {candidate.fitScore ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-dark">FitScore Analysis</h2>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getFitScoreColor(candidate.fitScore.overallScore)}`}>
                        {candidate.fitScore.overallScore}/100
                      </div>
                      <div className="text-sm text-gray-500">
                        {getFitScoreLabel(candidate.fitScore.overallScore)}
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <h3 className="text-lg font-medium text-dark mb-4 text-center">Technical Score</h3>
                      <div className={`text-3xl font-bold text-center ${getFitScoreColor(candidate.fitScore.technicalScore)}`}>
                        {candidate.fitScore.technicalScore}/100
                      </div>
                      {renderScoreBar(candidate.fitScore.technicalScore, 'Technical Skills')}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <h3 className="text-lg font-medium text-dark mb-4 text-center">Cultural Score</h3>
                      <div className={`text-3xl font-bold text-center ${getFitScoreColor(candidate.fitScore.culturalScore)}`}>
                        {candidate.fitScore.culturalScore}/100
                      </div>
                      {renderScoreBar(candidate.fitScore.culturalScore, 'Cultural Fit')}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <h3 className="text-lg font-medium text-dark mb-4 text-center">Behavioral Score</h3>
                      <div className={`text-3xl font-bold text-center ${getFitScoreColor(candidate.fitScore.behavioralScore)}`}>
                        {candidate.fitScore.behavioralScore}/100
                      </div>
                      {renderScoreBar(candidate.fitScore.behavioralScore, 'Behavioral Assessment')}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div>
                    <h3 className="text-lg font-medium text-dark mb-3">AI Analysis</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{candidate.fitScore.aiAnalysis}</p>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-500 flex items-center space-x-4">
                    <span>Calculated on {formatDate(candidate.fitScore.calculatedAt)}</span>
                    <button
                      onClick={() => {
                        alert('Export functionality coming soon!');
                      }}
                      className="text-primary hover:text-secondary transition-colors"
                    >
                      Export Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-dark mb-4">No FitScore Available</h3>
                  <p className="text-gray-600 mb-6">
                    This candidate hasn't been scored yet. Calculate their FitScore to see detailed analysis.
                  </p>
                  <button
                    onClick={handleCalculateFitScore}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Calculate FitScore
                  </button>
                </div>
              )}

              {/* Job Requirements Comparison */}
              {job && candidate.fitScore && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-dark mb-4">Job Requirements vs Candidate Profile</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-dark mb-3">Job Requirements</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-dark mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.performance.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark mb-2">Experience Level</h4>
                          <p className="text-gray-700">{job.performance.experience}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark mb-2">Cultural Values</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.culture.legalValues.map((value, index) => (
                              <span
                                key={index}
                                className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-dark mb-3">Candidate Assessment</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-dark mb-2">Cultural Fit</h4>
                          <p className="text-gray-700">{candidate.culturalFit.culture}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark mb-2">Performance Style</h4>
                          <p className="text-gray-700">{candidate.culturalFit.performance}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark mb-2">Energy Level</h4>
                          <p className="text-gray-700">{candidate.culturalFit.energy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Interview Statistics */}
              <InterviewStats interviews={interviews} />

              {/* Interview History Form */}
              <InterviewHistoryForm
                candidateId={candidate.id}
                jobId={candidate.jobId}
                interviews={interviews}
                onAddInterview={handleAddInterview}
                onUpdateInterview={handleUpdateInterview}
                onDeleteInterview={handleDeleteInterview}
              />

              {/* Quick Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-dark mb-4">Quick Notes</h3>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Add your notes about this candidate..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
