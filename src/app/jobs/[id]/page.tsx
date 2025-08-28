'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { JobPosting, Candidate } from '@/types';
import { ApplicationLink } from '@/components';
import { useCandidates } from '@/contexts/CandidatesContext';

type TabType = 'details' | 'candidates';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  
  const { 
    candidates, 
    isLoading: candidatesLoading, 
    fetchCandidates,
    calculateFitScore 
  } = useCandidates();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setJob(null);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch job: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch job');
        }
        
        // Transform the API response to match our JobPosting type
        const jobData: JobPosting = {
          id: data.data.id,
          title: data.data.title,
          description: data.data.description,
          performance: data.data.performance,
          energy: data.data.energy,
          culture: data.data.culture,
          applicationLink: data.data.application_link,
          status: data.data.status,
          createdAt: data.data.created_at,
          updatedAt: data.data.updated_at
        };
        
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'candidates' && jobId) {
      fetchCandidates(jobId);
    }
  }, [activeTab, jobId, fetchCandidates]);

  const handleCalculateFitScore = async (candidateId: string) => {
    await calculateFitScore(candidateId, jobId);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job posting you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-dark mb-2">
                {job.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {job.status}
                </span>
                <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              {job.description}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Job Details
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'candidates'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Candidates ({candidates.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'details' && (
              <>
                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Performance Requirements */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-dark mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Performance Requirements
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-dark mb-1">Experience</h3>
                        <p className="text-gray-600">{job.performance.experience}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-1">Deliveries</h3>
                        <p className="text-gray-600">{job.performance.deliveries}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-1">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.performance.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary text-white text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Energy & Culture */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-dark mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Work Environment
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-dark mb-1">Availability</h3>
                        <p className="text-gray-600">{job.energy.availability}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-1">Deadlines</h3>
                        <p className="text-gray-600">{job.energy.deadlines}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-1">Pressure Level</h3>
                        <p className="text-gray-600">{job.energy.pressure}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-dark mb-1">Company Values</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.culture.legalValues.map((value, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-secondary text-white text-sm rounded-full"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Link */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <ApplicationLink
                    jobId={job.id}
                    applicationUrl={job.applicationLink}
                  />
                </div>

                {/* Preview Application Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-dark mb-4">
                    Preview Application Form
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Candidates will see this form when they click the application link:
                  </p>
                  <a
                    href={job.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Open Application Form
                  </a>
                </div>
              </>
            )}

            {activeTab === 'candidates' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-dark">Candidates</h2>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">All Status</option>
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="sent_to_manager">Sent to Manager</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">All Scores</option>
                      <option value="high">High Score (80+)</option>
                      <option value="medium">Medium Score (60-79)</option>
                      <option value="low">Low Score (&lt;60)</option>
                    </select>
                  </div>
                </div>

                {candidatesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Candidates will appear here once they apply for this position.</p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {candidates.map((candidate) => (
                        <li key={candidate.id}>
                          <div className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}>
                                    {candidate.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                                <p className="text-sm text-gray-500">{candidate.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {candidate.fitScore ? (
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">FitScore</p>
                                  <p className={`text-lg font-bold ${getScoreColor(candidate.fitScore.overallScore)}`}>
                                    {candidate.fitScore.overallScore}%
                                  </p>
                                  <div className="text-xs text-gray-500">
                                    T: {candidate.fitScore.technicalScore} | 
                                    C: {candidate.fitScore.culturalScore} | 
                                    B: {candidate.fitScore.behavioralScore}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCalculateFitScore(candidate.id)}
                                  className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                                >
                                  Calculate Score
                                </button>
                              )}
                              <div className="flex space-x-2">
                                <a
                                  href={candidate.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-secondary"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                                  </svg>
                                </a>
                                <a
                                  href={`/candidates/${candidate.id}`}
                                  className="text-primary hover:text-secondary"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
