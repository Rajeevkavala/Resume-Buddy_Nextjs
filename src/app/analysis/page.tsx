
'use client';

import { useState, useContext, useEffect } from 'react';
import { runAnalysisAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';
import AnalysisTab from '@/components/analysis-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { loadData } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

export default function AnalysisPage() {
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<AnalyzeResumeContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [storedResumeText, setStoredResumeText] = useState<string | undefined>('');
  const [storedJobDescription, setStoredJobDescription] = useState<string | undefined>('');

  const hasDataChanged = resumeText !== storedResumeText || jobDescription !== storedJobDescription;

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const data = await loadData(user.uid);
        if (data) {
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
          // After loading, set the stored text to what's in the DB
          setStoredResumeText(data.resumeText);
          setStoredJobDescription(data.jobDescription);
        }
        setIsDataLoading(false);
      };
      fetchData();
    } else if (!authLoading) {
      setIsDataLoading(false);
    }
  }, [user, authLoading]);
  
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
    const promise = runAnalysisAction({ userId: user.uid, resumeText, jobDescription });

    toast.promise(promise, {
      loading: 'Analyzing your resume...',
      success: (result) => {
        setAnalysis(result);
        // On success, update the stored texts to match the new context
        setStoredResumeText(resumeText);
        setStoredJobDescription(jobDescription);
        return 'Analysis Complete!';
      },
      error: (error) => {
        return error.message || 'An unexpected error occurred.';
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  };

  if (authLoading || isDataLoading) {
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
