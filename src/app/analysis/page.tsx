
'use client';

import { useState, useContext, useEffect } from 'react';
import { runAnalysisAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import AnalysisTab from '@/components/analysis-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { saveUserData } from '@/lib/local-storage';

export default function AnalysisPage() {
  const { resumeText, jobDescription, analysis, setAnalysis, storedResumeText, storedJobDescription, loadDataFromCache } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Data now comes from context, which is loaded from local storage
  const hasDataChanged = (resumeText && resumeText !== storedResumeText) || (jobDescription && jobDescription !== storedJobDescription);

  const handleGeneration = async () => {
    if (!user) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to generate an analysis.',
      });
      return;
    }
    if (!resumeText || !jobDescription) {
      toast.error('Missing Content', {
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null); // Clear previous analysis

    const promise = runAnalysisAction({ userId: user.uid, resumeText, jobDescription }).then((result) => {
        setAnalysis(result);
        // On success, update local storage and then reload context
        saveUserData(user.uid, {
          analysis: result,
          resumeText,
          jobDescription,
        });
        loadDataFromCache(); // This will update storedResumeText and storedJobDescription
        return result;
    });

    toast.promise(promise, {
      loading: 'Analyzing your resume...',
      success: () => 'Analysis Complete!',
      error: (error) => {
        if (error.message && error.message.includes('[503 Service Unavailable]')) {
          return 'API call limit exceeded. Please try again later.';
        }
        return error.message || 'An unexpected error occurred.';
      },
      finally: () => setIsLoading(false)
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Resume Analysis</CardTitle>
          <CardDescription>
            Get an in-depth analysis of your resume against the job description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalysisTab
            analysis={analysis}
            onGenerate={handleGeneration}
            isLoading={isLoading}
            hasDataChanged={hasDataChanged}
          />
        </CardContent>
      </Card>
    </main>
  );
}
