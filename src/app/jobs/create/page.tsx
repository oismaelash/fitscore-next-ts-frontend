'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobForm } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { createJob, isLoading } = useJobs();
  
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

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newJob = await createJob(formData);
      if (newJob) {
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Failed to create job:', error);
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
                onClick={() => router.push('/jobs')}
                className="text-primary hover:text-secondary transition-colors"
              >
                ← Back to Jobs
              </button>
              <h1 className="text-2xl font-bold text-dark">Create New Job</h1>
            </div>
            <span className="text-dark">Welcome, {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-dark mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-dark mb-1">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Performance Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Performance Requirements</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-dark mb-1">
                  Experience Level
                </label>
                <input
                  type="text"
                  id="experience"
                  name="performance.experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., 5+ years"
                  value={formData.performance.experience}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="deliveries" className="block text-sm font-medium text-dark mb-1">
                  Expected Deliverables
                </label>
                <input
                  type="text"
                  id="deliveries"
                  name="performance.deliveries"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., High quality code, documentation"
                  value={formData.performance.deliveries}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Required Skills
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
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
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-primary hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Energy Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Energy Requirements</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-dark mb-1">
                  Availability
                </label>
                <select
                  id="availability"
                  name="energy.availability"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.energy.availability}
                  onChange={handleInputChange}
                >
                  <option value="">Select availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadlines" className="block text-sm font-medium text-dark mb-1">
                  Deadline Expectations
                </label>
                <select
                  id="deadlines"
                  name="energy.deadlines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.energy.deadlines}
                  onChange={handleInputChange}
                >
                  <option value="">Select deadline style</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Strict">Strict</option>
                  <option value="Project-based">Project-based</option>
                </select>
              </div>

              <div>
                <label htmlFor="pressure" className="block text-sm font-medium text-dark mb-1">
                  Work Pressure
                </label>
                <select
                  id="pressure"
                  name="energy.pressure"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.energy.pressure}
                  onChange={handleInputChange}
                >
                  <option value="">Select pressure level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cultural Values */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Cultural Values</h2>
            
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Company Values
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Add a company value"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
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
                    className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="ml-2 text-accent hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/jobs')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
