
'use client';

import { useState, useContext } from 'react';
import { runInterviewGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import InterviewTab from '@/components/interview-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { saveUserData } from '@/lib/local-storage';

export default function InterviewPage() {
  const { resumeText, jobDescription, interview, setInterview, storedResumeText, storedJobDescription, loadDataFromCache } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const hasDataChanged = (resumeText && resumeText !== storedResumeText) || (jobDescription && jobDescription !== storedJobDescription);

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
    setInterview(null); // Clear previous interview data
    const promise = runInterviewGenerationAction({ userId: user.uid, resumeText, jobDescription }).then((result) => {
        setInterview(result);
        saveUserData(user.uid, {
            interview: result,
            resumeText,
            jobDescription,
        });
        loadDataFromCache();
        return result;
    });

    toast.promise(promise, {
      loading: 'Generating interview questions...',
      success: () => 'Interview prep complete!',
      error: (error) => error.message || 'An unexpected error occurred.',
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
            hasDataChanged={hasDataChanged}
          />
        </CardContent>
      </Card>
    </main>
  );
}
