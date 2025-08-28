'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobForm, JobPosting } from '@/types';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { user, isAuthenticated } = useAuth();
  const { getJobById, updateJob, isLoading, error, clearError } = useJobs();
  
  const [formData, setFormData] = useState<JobForm>({
    title: '',
    description: '',
    performance: {
      experience: '',
      deliveries: '',
      skills: [],
    },
    energy: {
      availability: '',
      deadlines: '',
      pressure: '',
    },
    culture: {
      legalValues: [],
    },
  });

  const [skillInput, setSkillInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [job, setJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (jobId) {
        const jobData = await getJobById(jobId);
        if (jobData) {
          setJob(jobData);
          setFormData({
            title: jobData.title,
            description: jobData.description,
            performance: jobData.performance,
            energy: jobData.energy,
            culture: jobData.culture,
          });
        } else {
          router.push('/jobs');
        }
        setIsLoadingJob(false);
      }
    };

    loadJob();
  }, [jobId, getJobById, router]);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-dark mb-4">Job not found</h2>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedJob = await updateJob(jobId, formData);
      if (updatedJob) {
        router.push(`/jobs/${jobId}`);
      }
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => {
        if (section === 'performance') {
          return {
            ...prev,
            performance: {
              ...prev.performance,
              [field]: value,
            },
          };
        } else if (section === 'energy') {
          return {
            ...prev,
            energy: {
              ...prev.energy,
              [field]: value,
            },
          };
        } else if (section === 'culture') {
          return {
            ...prev,
            culture: {
              ...prev.culture,
              [field]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          skills: [...prev.performance.skills, skillInput.trim()],
        },
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        skills: prev.performance.skills.filter((_, i) => i !== index),
      },
    }));
  };

  const addValue = () => {
    if (valueInput.trim()) {
      setFormData(prev => ({
        ...prev,
        culture: {
          ...prev.culture,
          legalValues: [...prev.culture.legalValues, valueInput.trim()],
        },
      }));
      setValueInput('');
    }
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      culture: {
        ...prev.culture,
        legalValues: prev.culture.legalValues.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/jobs/${jobId}`)}
                className="text-primary hover:text-secondary transition-colors"
              >
                ← Back to Job Details
              </button>
              <h1 className="text-2xl font-bold text-dark">Edit Job Posting</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-dark">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Basic Information</h2>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Application Link:</strong> The application link for this job posting is automatically generated and cannot be edited. You can view and copy the link from the job details page.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Senior React Developer"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>


            </div>
          </div>

          {/* Performance Expectations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Performance Expectations</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="performance.experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Requirements
                </label>
                <input
                  type="text"
                  id="performance.experience"
                  name="performance.experience"
                  value={formData.performance.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 5+ years of experience"
                />
              </div>

              <div>
                <label htmlFor="performance.deliveries" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Deliverables
                </label>
                <textarea
                  id="performance.deliveries"
                  name="performance.deliveries"
                  value={formData.performance.deliveries}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What will this person be expected to deliver?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.performance.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-white"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Energy & Work Environment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Energy & Work Environment</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="energy.availability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Requirements
                </label>
                <input
                  type="text"
                  id="energy.availability"
                  name="energy.availability"
                  value={formData.energy.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Full-time, remote-friendly"
                />
              </div>

              <div>
                <label htmlFor="energy.deadlines" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline Expectations
                </label>
                <input
                  type="text"
                  id="energy.deadlines"
                  name="energy.deadlines"
                  value={formData.energy.deadlines}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Flexible with clear communication"
                />
              </div>

              <div>
                <label htmlFor="energy.pressure" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Pressure Level
                </label>
                <input
                  type="text"
                  id="energy.pressure"
                  name="energy.pressure"
                  value={formData.energy.pressure}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Medium to high during sprints"
                />
              </div>
            </div>
          </div>

          {/* Cultural Values */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Cultural Values</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Values
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a company value"
                />
                <button
                  type="button"
                  onClick={addValue}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.culture.legalValues.map((value, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-white"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/jobs/${jobId}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
