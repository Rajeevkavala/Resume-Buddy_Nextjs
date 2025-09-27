
'use client';

import { useState, useContext } from 'react';
import { runQAGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import QATab from '@/components/qa-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { saveUserData } from '@/lib/local-storage';

export default function QAPage() {
  const { resumeText, jobDescription, qa, setQa, storedResumeText, storedJobDescription, loadDataFromCache } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const hasDataChanged = (resumeText && resumeText !== storedResumeText) || (jobDescription && jobDescription !== storedJobDescription);

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
    setQa(null); // Clear previous Q&A data
    const promise = runQAGenerationAction({ userId: user.uid, resumeText, jobDescription }).then((result) => {
        setQa(result);
        saveUserData(user.uid, {
            qa: result,
            resumeText,
            jobDescription,
        });
        loadDataFromCache();
        return result;
    });

    toast.promise(promise, {
      loading: 'Generating Q&A...',
      success: () => 'Q&A pairs generated successfully!',
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
