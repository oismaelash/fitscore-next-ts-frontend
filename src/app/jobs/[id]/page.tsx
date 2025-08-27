'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { JobPosting } from '@/types';
import { ApplicationLink } from '@/components';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch job details from API
    // For now, using mock data
    const mockJob: JobPosting = {
      id: jobId,
      title: 'Senior Software Engineer',
      description: 'We are looking for a talented Senior Software Engineer to join our team...',
      performance: {
        experience: '5+ years of experience in software development',
        deliveries: 'Ability to deliver high-quality code on time',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL']
      },
      energy: {
        availability: 'Full-time, remote-friendly',
        deadlines: 'Agile environment with 2-week sprints',
        pressure: 'Fast-paced startup environment'
      },
      culture: {
        legalValues: ['Innovation', 'Collaboration', 'Excellence', 'Integrity']
      },
      applicationLink: `${window.location.origin}/apply/${jobId}`,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setJob(mockJob);
    setLoading(false);
  }, [jobId]);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Requirements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
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
          <div className="bg-white rounded-lg shadow-lg p-6">
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ApplicationLink
            jobId={job.id}
            applicationUrl={job.applicationLink}
          />
        </div>

        {/* Preview Application Form */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
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
      </div>
    </div>
  );
}
