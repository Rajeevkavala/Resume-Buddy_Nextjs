
'use client';

import { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { getUserData } from '@/lib/local-storage';
import { useAuth } from './auth-context';
import type { AnalysisResult, QATopic, GenerateResumeQAOutput } from '@/lib/types';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';

interface ResumeContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  resumeFile: File | null;
  setResumeFile: Dispatch<SetStateAction<File | null>>;
  analysis: any;
  improvements: any;
  interview: GenerateInterviewQuestionsOutput | null;
  qa: Record<QATopic, GenerateResumeQAOutput | null> | null;
  storedResumeText?: string;
  storedJobDescription?: string;
  setAnalysis: (data: any) => void;
  setImprovements: (data: any) => void;
  setInterview: (data: GenerateInterviewQuestionsOutput | null) => void;
  setQa: (data: Record<QATopic, GenerateResumeQAOutput | null> | null) => void;
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
  const [interview, setInterview] = useState<GenerateInterviewQuestionsOutput | null>(null);
  const [qa, setQa] = useState<Record<QATopic, GenerateResumeQAOutput | null> | null>(null);
  
  const [storedResumeText, setStoredResumeText] = useState<string | undefined>('');
  const [storedJobDescription, setStoredJobDescription] = useState<string | undefined>('');

  const resetState = () => {
    setResumeText('');
    setJobDescription('');
    setResumeFile(null);
    setAnalysis(null);
    setImprovements(null);
    setInterview(null);
    setQa(null);
    setStoredResumeText('');
    setStoredJobDescription('');
  };


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

        setStoredResumeText(data.resumeText);
        setStoredJobDescription(data.jobDescription);
      } else {
        // If there's no data for the user, reset the state
        resetState();
      }
    } else {
        // If there is no user, reset the state
        resetState();
    }
  };

  useEffect(() => {
    loadDataFromCache();

    const handleDataLoad = () => loadDataFromCache();
    const handleLogout = () => resetState();

    window.addEventListener('user-data-loaded', handleDataLoad);
    window.addEventListener('user-logged-out', handleLogout);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === `resume_buddy_user_${user.uid}`) {
        loadDataFromCache();
      }
      // If the item is removed (logout), clear state
      if (user && e.key === `resume_buddy_user_${user.uid}` && e.newValue === null) {
        resetState();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-data-loaded', handleDataLoad);
      window.removeEventListener('user-logged-out', handleLogout);
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
