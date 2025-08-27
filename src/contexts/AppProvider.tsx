'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { JobsProvider } from './JobsContext';
import { CandidatesProvider } from './CandidatesContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <JobsProvider>
        <CandidatesProvider>
          {children}
        </CandidatesProvider>
      </JobsProvider>
    </AuthProvider>
  );
};
