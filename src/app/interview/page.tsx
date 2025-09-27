
'use client';

import { useState, useContext, useEffect } from 'react';
import { runInterviewGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import InterviewTab from '@/components/interview-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { loadData } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

export default function InterviewPage() {
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [interview, setInterview] = useState<GenerateInterviewQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const data = await loadData(user.uid);
        if (data?.interview) {
          setInterview(data.interview);
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
      toast.error('Authentication Error', { description: 'You must be logged in to generate interview prep.' });
      return;
    }
    if (!resumeText || !jobDescription) {
      toast.error('Missing Content', {
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }
    
    setIsLoading(true);
    const promise = runInterviewGenerationAction({ userId: user.uid, resumeText, jobDescription });

    toast.promise(promise, {
      loading: 'Generating interview questions...',
      success: (result) => {
        setInterview(result);
        return 'Interview prep complete!';
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
          <CardTitle className="font-headline text-xl">Interview Prep</CardTitle>
          <CardDescription>
            Practice with AI-generated questions tailored to the role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewTab
            interview={interview}
            onGenerate={handleGeneration}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
