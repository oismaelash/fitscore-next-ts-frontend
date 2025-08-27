'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useCandidates } from '@/contexts/CandidatesContext';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { jobs, totalJobs } = useJobs();
  const { candidates, totalCandidates } = useCandidates();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">
            FitScore
          </h1>
          <p className="text-dark text-center mb-6">
            Intelligent Hiring System
          </p>
          <div className="space-y-4">
            <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors">
              Login
            </button>
            <button className="w-full border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">FitScore</h1>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-primary">{totalJobs}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-2">Total Candidates</h3>
            <p className="text-3xl font-bold text-primary">{totalCandidates}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-primary">
              {jobs.filter(job => job.status === 'published').length}
            </p>
          </div>
        </div>

        {/* Jobs with Candidates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-dark">Jobs & Candidates Overview</h2>
          </div>
          <div className="p-6">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => {
                  const jobCandidates = candidates.filter(c => c.jobId === job.id);
                  const scoredCandidates = jobCandidates.filter(c => c.fitScore);
                  
                  return (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-dark">{job.title}</h3>
                          <p className="text-gray-600 text-sm">{job.description.substring(0, 100)}...</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : job.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {job.status}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Candidates:</span>
                              <span className="text-sm font-medium text-primary">{jobCandidates.length}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Scored:</span>
                              <span className="text-sm font-medium text-accent">{scoredCandidates.length}</span>
                            </div>
                            {scoredCandidates.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Avg Score:</span>
                                <span className="text-sm font-medium text-green-600">
                                  {Math.round(scoredCandidates.reduce((sum, c) => sum + (c.fitScore?.overallScore || 0), 0) / scoredCandidates.length)}/100
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button 
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="text-primary hover:text-secondary transition-colors text-sm"
                          >
                            View Details
                          </button>
                          {jobCandidates.length > 0 && (
                            <button 
                              onClick={() => router.push(`/jobs/${job.id}?tab=candidates`)}
                              className="text-accent hover:text-secondary transition-colors text-sm"
                            >
                              View Candidates ({jobCandidates.length})
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/jobs/create')}
                className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors"
              >
                Create New Job Posting
              </button>
              <button 
                onClick={() => router.push('/candidates')}
                className="w-full border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-colors"
              >
                View All Candidates
              </button>
              <button 
                onClick={() => router.push('/jobs')}
                className="w-full border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Manage Job Postings
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">AI FitScore Engine</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email Service</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
