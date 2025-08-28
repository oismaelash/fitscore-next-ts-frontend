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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/jobs/create')}
                className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors"
              >
                Create New Job Posting
              </button>
              {/* <button 
                onClick={() => router.push('/candidates')}
                className="w-full border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-colors"
              >
                View All Candidates
              </button> */}
              <button 
                onClick={() => router.push('/jobs')}
                className="w-full border border-primary text-primary py-2 px-4 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Manage Job Postings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
