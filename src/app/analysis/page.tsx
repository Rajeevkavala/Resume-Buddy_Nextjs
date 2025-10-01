
'use client';

import { useState, useContext, useEffect, Suspense, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { runAnalysisAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { saveUserData } from '@/lib/local-storage';
import { 
  AnalysisLoading, 
  PageLoadingOverlay,
  LoadingSpinner 
} from '@/components/loading-animations';
import { AnalysisSkeleton } from '@/components/ui/page-skeletons';
import { usePageTitle } from '@/hooks/use-page-title';

// Dynamically import heavy components
const AnalysisTab = dynamic(() => import('@/components/analysis-tab'), {
  loading: () => <div className="space-y-4"></div>,
  ssr: false,
});

export default function AnalysisPage() {
  const { resumeText, jobDescription, jobRole, jobUrl, analysis, setAnalysis, storedResumeText, storedJobDescription, storedJobRole, storedJobUrl, updateStoredValues, isDataLoaded } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Set page title
  usePageTitle('Resume Analysis');

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


  // Data now comes from context, which is loaded from local storage
  const hasDataChanged = !!(resumeText && resumeText !== storedResumeText) || 
                         !!(jobDescription && jobDescription !== storedJobDescription) ||
                         !!(jobRole && jobRole !== storedJobRole) ||
                         !!(jobUrl && jobUrl !== storedJobUrl);

  const handleGeneration = async () => {
    if (!user) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to generate an analysis.',
      });
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
    setAnalysis(null); // Clear previous analysis

    const promise = runAnalysisAction({ 
      userId: user.uid, 
      resumeText, 
      jobDescription,
      jobRole,
      jobUrl,
    }).then((result) => {
        startTransition(() => {
          setAnalysis(result);
          // Update local storage asynchronously
          Promise.resolve().then(() => {
            const dataToSave: any = {
              analysis: result,
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
            updateStoredValues(resumeText, jobDescription, jobRole, jobUrl); // Update stored values efficiently
          });
        });
        return result;
    });

    toast.promise(promise, {
      loading: 'Analyzing your resume...',
      success: () => 'Analysis Complete!',
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
    return <AnalysisSkeleton />;
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Resume Analysis</CardTitle>
          <CardDescription>
            Get an in-depth analysis of your resume against the job description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AnalysisLoading />
          ) : (
            <AnalysisTab
              analysis={analysis}
              onGenerate={handleGeneration}
              isLoading={isLoading}
              hasDataChanged={hasDataChanged}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
