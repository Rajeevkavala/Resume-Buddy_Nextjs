'use client';

import { useState, useContext, useEffect, startTransition } from 'react';
import dynamic from 'next/dynamic';
import type { GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { runInterviewGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { saveUserData } from '@/lib/local-storage';
import { 
  InterviewLoading, 
  PageLoadingOverlay,
  LoadingSpinner 
} from '@/components/loading-animations';
import { InterviewSkeleton } from '@/components/ui/page-skeletons';
import { usePageTitle } from '@/hooks/use-page-title';

// Dynamically import InterviewTab
const InterviewTab = dynamic(() => import('@/components/interview-tab'), {
  loading: () => <div className="space-y-4"><div className="h-8 bg-muted animate-pulse rounded" /><div className="h-64 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

export type InterviewType = "Technical" | "Behavioral" | "Leadership" | "General";
export type DifficultyLevel = "Entry" | "Mid" | "Senior" | "Executive";

export default function InterviewPage() {
  const { resumeText, jobDescription, jobRole, jobUrl, interview, setInterview, updateStoredValues, isDataLoaded } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Set page title
  usePageTitle('Interview Prep');

  // Handle page loading state - fixed logic
  useEffect(() => {
    // If auth is still loading, keep page loading
    if (authLoading) {
      setIsPageLoading(true);
      return;
    }

    // If user is not authenticated, stop loading immediately
    if (!user) {
      setIsPageLoading(false);
      return;
    }

    // If user is authenticated, wait for data to load, then add small delay
    if (isDataLoaded) {
      const timer = setTimeout(() => setIsPageLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, isDataLoaded]);


  const handleGeneration = async (config: Omit<GenerateInterviewQuestionsInput, 'resumeText' | 'jobDescription'>) => {
    // A numQuestions of -1 is a signal from the child to restart/clear the quiz
    if (config.numQuestions === -1) {
        setInterview(null);
        return;
    }
    
    if (!user) {
      toast.error('Authentication Error', { description: 'You must be logged in to generate an interview quiz.' });
      return;
    }
    if (!resumeText) {
      toast.error('Missing Resume', {
        description: 'Please upload your resume on the dashboard.',
      });
      return;
    }
    if (!jobDescription && !jobRole) {
      toast.error('Missing Job Information', {
        description: 'Please provide either a job description or select a target role on the dashboard.',
      });
      return;
    }
    
    setIsLoading(true);
    setInterview(null); // Clear previous interview data

    const input = {
      userId: user.uid,
      resumeText,
      jobDescription,
      jobRole,
      jobUrl,
      ...config,
    };

    const promise = runInterviewGenerationAction(input).then((result: GenerateInterviewQuestionsOutput) => {
        // Validate that the result has questions
        if (!result || !result.questions || result.questions.length === 0) {
            throw new Error("The AI failed to generate questions. Please try again.");
        }
        setInterview(result);
        
        // We only save the result to the context/local storage, not the config that generated it.
        const dataToSave: any = {
            interview: result,
            resumeText,
            jobDescription,
        };
        
        if (jobRole) {
            dataToSave.jobRole = jobRole;
        }
        
        if (jobUrl) {
            dataToSave.jobUrl = jobUrl;
        }
        
        saveUserData(user.uid, dataToSave);
        updateStoredValues(resumeText, jobDescription, jobRole, jobUrl);
        return result;
    });

    toast.promise(promise, {
      loading: 'Generating interview quiz...',
      success: () => 'Interview quiz is ready!',
      error: (error: any) => {
        if (error.message && error.message.includes('[503 Service Unavailable]')) {
          return 'API call limit exceeded. Please try again later.';
        }
        return error.message || 'An unexpected error occurred.';
      },
      finally: () => setIsLoading(false)
    });
  };
  
  // Show skeleton loading while page is loading or user not authenticated
  if (isPageLoading || !user) {
    return <InterviewSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-8">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-xl">AI-Powered Interview Quiz</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Configure your interview type and difficulty to generate a tailored quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <InterviewLoading />
          ) : (
            <InterviewTab
              interview={interview}
              onGenerate={handleGeneration}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
