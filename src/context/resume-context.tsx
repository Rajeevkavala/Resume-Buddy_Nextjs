
'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface ResumeContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  resumeFile: File | null;
  setResumeFile: Dispatch<SetStateAction<File | null>>;
}

export const ResumeContext = createContext<ResumeContextType>({
  resumeText: '',
  setResumeText: () => {},
  jobDescription: '',
  setJobDescription: () => {},
  resumeFile: null,
  setResumeFile: () => {},
});

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  return (
    <ResumeContext.Provider value={{ resumeText, setResumeText, jobDescription, setJobDescription, resumeFile, setResumeFile }}>
      {children}
    </ResumeContext.Provider>
  );
}
