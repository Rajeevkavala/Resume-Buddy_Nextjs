
'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { getUserData } from '@/lib/local-storage';
import { useAuth } from './auth-context';

interface ResumeContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  resumeFile: File | null;
  setResumeFile: Dispatch<SetStateAction<File | null>>;
  analysis: any;
  improvements: any;
  interview: any;
  qa: any;
  storedResumeText?: string;
  storedJobDescription?: string;
  setAnalysis: (data: any) => void;
  setImprovements: (data: any) => void;
  setInterview: (data: any) => void;
  setQa: (data: any) => void;
  loadDataFromCache: () => void;
}

export const ResumeContext = createContext<ResumeContextType>({
  resumeText: '',
  setResumeText: () => {},
  jobDescription: '',
  setJobDescription: () => {},
  resumeFile: null,
  setResumeFile: () => {},
  analysis: null,
  improvements: null,
  interview: null,
  qa: null,
  setAnalysis: () => {},
  setImprovements: () => {},
  setInterview: () => {},
  setQa: () => {},
  loadDataFromCache: () => {},
});

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState(null);
  const [improvements, setImprovements] = useState(null);
  const [interview, setInterview] = useState(null);
  const [qa, setQa] = useState(null);
  
  // These represent the state of the text when the last analysis was run
  const [storedResumeText, setStoredResumeText] = useState<string | undefined>('');
  const [storedJobDescription, setStoredJobDescription] = useState<string | undefined>('');

  const loadDataFromCache = () => {
    if (user) {
      const data = getUserData(user.uid);
      if (data) {
        setResumeText(data.resumeText || '');
        setJobDescription(data.jobDescription || '');
        setAnalysis(data.analysis || null);
        setImprovements(data.improvements || null);
        setInterview(data.interview || null);
        setQa(data.qa || null);

        // This is key: we set the "stored" text to what's in the cache.
        // This is used to compare against for the "regenerate" button logic.
        setStoredResumeText(data.resumeText);
        setStoredJobDescription(data.jobDescription);
      }
    }
  };

  useEffect(() => {
    loadDataFromCache();

    // Listen for the custom event fired from AuthProvider
    const handleDataLoad = () => loadDataFromCache();
    window.addEventListener('user-data-loaded', handleDataLoad);
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `resume_buddy_user_${user.uid}`) {
        loadDataFromCache();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-data-loaded', handleDataLoad);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const contextValue = {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    resumeFile,
    setResumeFile,
    analysis,
    setAnalysis,
    improvements,
    setImprovements,
    interview,
    setInterview,
    qa,
    setQa,
    storedResumeText,
    storedJobDescription,
    loadDataFromCache,
  };

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
}
