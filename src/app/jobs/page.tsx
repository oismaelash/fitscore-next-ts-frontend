'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard } from '@/components';
import { JobPosting } from '@/types';

export default function JobsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { jobs, isLoading, deleteJob } = useJobs();


  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleViewDetails = (job: JobPosting) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleEdit = (job: JobPosting) => {
    router.push(`/jobs/${job.id}/edit`);
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      await deleteJob(jobId);
    }
  };

  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-primary hover:text-secondary transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-dark">Job Postings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateJob}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors"
              >
                Create New Job
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
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-dark">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-dark mb-4">No job postings yet</h3>
            <p className="text-gray-600 mb-6">Create your first job posting to get started</p>
            <button
              onClick={handleCreateJob}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
            >
              Create First Job
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-dark">
                All Job Postings ({jobs.length})
              </h2>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Closed</option>
                </select>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
