
'use client';

import { useState, useContext, useEffect } from 'react';
import { runQAGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import type { GenerateResumeQAOutput } from '@/ai/flows/generate-resume-qa';
import QATab from '@/components/qa-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { loadData } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';


export default function QAPage() {
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [qa, setQa] = useState<GenerateResumeQAOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [storedResumeText, setStoredResumeText] = useState<string | undefined>('');
  const [storedJobDescription, setStoredJobDescription] = useState<string | undefined>('');

  const hasDataChanged = (resumeText && resumeText !== storedResumeText) || (jobDescription && jobDescription !== storedJobDescription);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const data = await loadData(user.uid);
        if (data) {
          if (data.qa) {
            setQa(data.qa);
          }
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
      toast.error('Authentication Error', { description: 'You must be logged in to generate Q&A.' });
      return;
    }
    if (!resumeText || !jobDescription) {
      toast.error('Missing Content', {
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }

    setIsLoading(true);
    const promise = runQAGenerationAction({ userId: user.uid, resumeText, jobDescription });

    toast.promise(promise, {
      loading: 'Generating Q&A...',
      success: (result) => {
        setQa(result);
        setStoredResumeText(resumeText);
        setStoredJobDescription(jobDescription);
        return 'Q&A pairs generated successfully!';
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
          <CardTitle className="font-headline text-xl">Resume Q&A</CardTitle>
          <CardDescription>
            Generate potential questions and answers based on your resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QATab
            qa={qa}
            onGenerate={handleGeneration}
            isLoading={isLoading}
            hasDataChanged={hasDataChanged}
          />
        </CardContent>
      </Card>
    </main>
  );
}
