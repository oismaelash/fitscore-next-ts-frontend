'use client';

import { useState } from 'react';

interface ApplicationLinkProps {
  jobId: string;
  applicationUrl: string;
}

export default function ApplicationLink({ jobId, applicationUrl }: ApplicationLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="bg-light rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-dark mb-3">
        Application Link
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        Share this link with candidates to apply for this position:
      </p>
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={applicationUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          {copied ? (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Copied!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              <span>Copy</span>
            </div>
          )}
        </button>
      </div>
      
      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>This link is public and can be shared with candidates</span>
      </div>
    </div>
  );
}
