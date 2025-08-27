'use client';

import { JobPosting } from '@/types';

interface JobCardProps {
  job: JobPosting;
  onViewDetails: (job: JobPosting) => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, onEdit, onDelete }) => {
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-dark mb-2">{job.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {job.description}
          </p>
          
          {/* Skills */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-dark mb-1">Required Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.performance.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Experience:</span>
              <p className="text-dark font-medium">{job.performance.experience}</p>
            </div>
            <div>
              <span className="text-gray-500">Availability:</span>
              <p className="text-dark font-medium">{job.energy.availability}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
          <span className="text-gray-500 text-xs">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(job)}
            className="text-primary hover:text-secondary transition-colors text-sm font-medium"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(job)}
            className="text-gray-600 hover:text-primary transition-colors text-sm"
          >
            Edit
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(job.applicationLink)}
            className="text-xs bg-light text-dark px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            title="Copy application link"
          >
            Copy Link
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
