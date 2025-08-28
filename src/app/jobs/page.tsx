'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components';
import { JobCard } from '@/components';
import { JobPosting } from '@/types';

export default function JobsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { jobs, isLoading, error, totalJobs, currentPage, totalPages, fetchJobs, deleteJob, clearError } = useJobs();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchJobs(1, 10, statusFilter || undefined);
  }, [statusFilter]);

  const handleViewDetails = (job: JobPosting) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleEdit = (job: JobPosting) => {
    router.push(`/jobs/${job.id}/edit`);
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      const success = await deleteJob(jobId);
      if (success) {
        // Refresh the jobs list
        fetchJobs(currentPage, 10, statusFilter || undefined);
      }
    }
  };

  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just filter client-side
    // In a real app, you'd want to implement server-side search
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page, 10, statusFilter || undefined);
  };

  const filteredJobs = jobs.filter(job => 
    searchTerm === '' || 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard>
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
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

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
                  All Job Postings ({totalJobs})
                </h2>
                <div className="flex space-x-2">
                  <select 
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="ml-2 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-secondary transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded text-sm ${
                        page === currentPage
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
