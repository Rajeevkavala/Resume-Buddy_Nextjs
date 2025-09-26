
'use client';

import { createContext, useState, ReactNode } from 'react';

interface ResumeContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
}

export const ResumeContext = createContext<ResumeContextType>({
  resumeText: '',
  setResumeText: () => {},
  jobDescription: '',
  setJobDescription: () => {},
});

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  return (
    <ResumeContext.Provider value={{ resumeText, setResumeText, jobDescription, setJobDescription }}>
      {children}
    </ResumeContext.Provider>
  );
}
