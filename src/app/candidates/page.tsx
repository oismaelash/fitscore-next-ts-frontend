'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidates } from '@/contexts/CandidatesContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components';
import { Candidate } from '@/types';
import { formatDate, getFitScoreColor, getFitScoreLabel } from '@/utils';

export default function CandidatesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { candidates, isLoading, fetchCandidates, calculateFitScore } = useCandidates();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available jobs
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const data = await response.json();
          setJobs(data.data || []);
          if (data.data && data.data.length > 0) {
            setSelectedJobId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidates(selectedJobId);
    }
  }, [selectedJobId, fetchCandidates]);

  const handleViewCandidate = (candidate: Candidate) => {
    router.push(`/candidates/${candidate.id}`);
  };

  const handleCalculateFitScore = async (candidateId: string) => {
    await calculateFitScore(candidateId, selectedJobId);
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
                  onClick={() => router.push('/')}
                  className="text-primary hover:text-secondary transition-colors"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-dark">Candidates</h1>
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-dark">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-dark mb-4">No candidates yet</h3>
              <p className="text-gray-600 mb-6">Candidates will appear here once they apply to your job postings</p>
              <button
                onClick={() => router.push('/jobs')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                View Job Postings
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-dark">
                  All Candidates ({candidates.length})
                </h2>
                <div className="flex space-x-2">
                  <select 
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
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
                      {candidates.map((candidate) => (
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
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
