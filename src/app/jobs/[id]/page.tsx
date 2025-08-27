'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useJobs } from '@/contexts/JobsContext';
import { useCandidates } from '@/contexts/CandidatesContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobPosting, Candidate } from '@/types';
import { formatDate, getFitScoreColor, getFitScoreLabel } from '@/utils';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { user, isAuthenticated, logout } = useAuth();
  const { jobs, isLoading: jobsLoading, getJobById } = useJobs();
  const { candidates, isLoading: candidatesLoading, fetchCandidates, calculateFitScore } = useCandidates();
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [jobCandidates, setJobCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates'>('overview');

  // Check for tab parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'candidates') {
      setActiveTab('candidates');
    }
  }, []);

  useEffect(() => {
    const loadJobData = async () => {
      if (jobId) {
        const foundJob = await getJobById(jobId);
        setJob(foundJob);
        fetchCandidates(jobId);
      }
    };
    
    loadJobData();
  }, [jobId, getJobById, fetchCandidates]);

  useEffect(() => {
    if (candidates.length > 0 && job) {
      const filteredCandidates = candidates.filter(candidate => candidate.jobId === job.id);
      setJobCandidates(filteredCandidates);
    }
  }, [candidates, job]);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (jobsLoading || candidatesLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const handleViewCandidate = (candidate: Candidate) => {
    router.push(`/candidates/${candidate.id}`);
  };

  const handleCalculateFitScore = async (candidateId: string) => {
    await calculateFitScore(candidateId, job.id);
  };

  const handleEditJob = () => {
    router.push(`/jobs/${job.id}/edit`);
  };

  const handleBackToJobs = () => {
    router.push('/jobs');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToJobs}
                className="text-primary hover:text-secondary transition-colors"
              >
                ← Back to Jobs
              </button>
              <h1 className="text-2xl font-bold text-dark">{job.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEditJob}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors"
              >
                Edit Job
              </button>
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
              Job Overview
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'candidates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Candidates ({jobCandidates.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Job Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-dark mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-3">Application Link</h3>
                  <a
                    href={job.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors break-all"
                  >
                    {job.applicationLink}
                  </a>
                </div>
              </div>
            </div>

            {/* Performance Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Performance Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Experience</h3>
                  <p className="text-gray-700">{job.performance.experience}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Deliveries</h3>
                  <p className="text-gray-700">{job.performance.deliveries}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Skills</h3>
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
              </div>
            </div>

            {/* Energy Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Energy Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Availability</h3>
                  <p className="text-gray-700">{job.energy.availability}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Deadlines</h3>
                  <p className="text-gray-700">{job.energy.deadlines}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Pressure</h3>
                  <p className="text-gray-700">{job.energy.pressure}</p>
                </div>
              </div>
            </div>

            {/* Culture Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Culture Requirements</h2>
              <div>
                <h3 className="text-lg font-medium text-dark mb-2">Legal Values</h3>
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

            {/* Job Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-dark mb-4">Job Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Created</h3>
                  <p className="text-gray-700">{formatDate(job.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark mb-2">Last Updated</h3>
                  <p className="text-gray-700">{formatDate(job.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Candidates Section */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-dark">
                Candidates for {job.title} ({jobCandidates.length})
              </h2>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>New</option>
                  <option>Reviewed</option>
                  <option>Sent to Manager</option>
                </select>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            {jobCandidates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-dark mb-4">No candidates yet</h3>
                <p className="text-gray-600 mb-6">Candidates will appear here once they apply to this job posting</p>
                <a
                  href={job.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors inline-block"
                >
                  View Application Link
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          FitScore
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-dark">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{candidate.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              candidate.status === 'new' 
                                ? 'bg-blue-100 text-blue-800'
                                : candidate.status === 'reviewed'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {candidate.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {candidate.fitScore ? (
                              <div className="text-sm">
                                <span className={`font-medium ${getFitScoreColor(candidate.fitScore.overallScore)}`}>
                                  {candidate.fitScore.overallScore}/100
                                </span>
                                <div className="text-xs text-gray-500">
                                  {getFitScoreLabel(candidate.fitScore.overallScore)}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCalculateFitScore(candidate.id)}
                                className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-secondary transition-colors"
                              >
                                Calculate
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(candidate.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewCandidate(candidate)}
                              className="text-primary hover:text-secondary transition-colors mr-3"
                            >
                              View
                            </button>
                            {!candidate.fitScore && (
                              <button
                                onClick={() => handleCalculateFitScore(candidate.id)}
                                className="text-accent hover:text-secondary transition-colors"
                              >
                                Score
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
