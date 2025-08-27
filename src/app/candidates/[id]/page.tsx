'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCandidates } from '@/contexts/CandidatesContext';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components';
import { Candidate, JobPosting } from '@/types';
import { formatDate, getFitScoreColor, getFitScoreLabel } from '@/utils';

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  
  const { user, logout } = useAuth();
  const { candidates, isLoading: candidatesLoading, calculateFitScore } = useCandidates();
  const { jobs, isLoading: jobsLoading, getJobById } = useJobs();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fitScore'>('overview');

  useEffect(() => {
    if (candidateId && candidates.length > 0) {
      const foundCandidate = candidates.find(c => c.id === candidateId);
      setCandidate(foundCandidate || null);
      
      if (foundCandidate) {
        loadJobData(foundCandidate.jobId);
      }
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

  const handleBackToCandidates = () => {
    router.push('/candidates');
  };

  const handleBackToJob = () => {
    if (job) {
      router.push(`/jobs/${job.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent_to_manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                <h1 className="text-2xl font-bold text-dark">{candidate?.name || 'Loading...'}</h1>
                {candidate && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                    {candidate.status.replace('_', ' ')}
                  </span>
                )}
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
                <span className="text-dark">Welcome, {user?.name}</span>
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
          {candidatesLoading || jobsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-dark">Loading candidate details...</p>
            </div>
          ) : !candidate ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-dark mb-4">Candidate Not Found</h2>
              <p className="text-gray-600 mb-6">The candidate you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => router.push('/candidates')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                Back to Candidates
              </button>
            </div>
          ) : (
            <>
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
                            <p className="text-dark">{candidate.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-dark">{candidate.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-dark mb-3">Application Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Applied For</label>
                            <p className="text-dark">{job?.title || 'Loading...'}</p>
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
                              className="text-primary hover:text-secondary transition-colors"
                            >
                              View Resume
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
                      <div>
                        <h3 className="text-lg font-medium text-dark mb-2">Performance</h3>
                        <p className="text-gray-700">{candidate.culturalFit.performance}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-dark mb-2">Energy</h3>
                        <p className="text-gray-700">{candidate.culturalFit.energy}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-dark mb-2">Culture</h3>
                        <p className="text-gray-700">{candidate.culturalFit.culture}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-dark mb-4">Quick Actions</h2>
                    <div className="flex space-x-4">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* FitScore Overview */}
                  {candidate.fitScore ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-dark">FitScore Analysis</h2>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getFitScoreColor(candidate.fitScore.overallScore)}`}>
                            {candidate.fitScore.overallScore}/100
                          </div>
                          <div className="text-sm text-gray-500">
                            {getFitScoreLabel(candidate.fitScore.overallScore)}
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-lg font-medium text-dark mb-2">Technical Score</h3>
                          <div className={`text-2xl font-bold ${getFitScoreColor(candidate.fitScore.technicalScore)}`}>
                            {candidate.fitScore.technicalScore}/100
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-lg font-medium text-dark mb-2">Cultural Score</h3>
                          <div className={`text-2xl font-bold ${getFitScoreColor(candidate.fitScore.culturalScore)}`}>
                            {candidate.fitScore.culturalScore}/100
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-lg font-medium text-dark mb-2">Behavioral Score</h3>
                          <div className={`text-2xl font-bold ${getFitScoreColor(candidate.fitScore.behavioralScore)}`}>
                            {candidate.fitScore.behavioralScore}/100
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div>
                        <h3 className="text-lg font-medium text-dark mb-3">AI Analysis</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">{candidate.fitScore.aiAnalysis}</p>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        Calculated on {formatDate(candidate.fitScore.calculatedAt)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
