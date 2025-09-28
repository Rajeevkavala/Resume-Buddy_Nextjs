'use client';

import { useState, useContext, startTransition, useEffect } from 'react';
import { runQAGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { saveUserData } from '@/lib/local-storage';
import QATab from '@/components/qa-tab';
import { 
  QALoading, 
  PageLoadingOverlay,
  LoadingSpinner 
} from '@/components/loading-animations';
import { QASkeleton } from '@/components/ui/page-skeletons';

type Topic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

export default function QAPage() {
  const { resumeText, jobDescription, qa, setQa, storedResumeText, storedJobDescription, updateStoredValues, isDataLoaded } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic>("General");

  // Handle page loading state
  useEffect(() => {
    if (authLoading) {
      setIsPageLoading(true);
      return;
    }

    if (!user) {
      setIsPageLoading(false);
      return;
    }

    if (isDataLoaded) {
      const timer = setTimeout(() => setIsPageLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, isDataLoaded]);



  const hasDataChanged = !!(resumeText && resumeText !== storedResumeText) || !!(jobDescription && jobDescription !== storedJobDescription);

  const handleGeneration = async (topic: Topic, numQuestions: number) => {
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
    // Clear only the data for the current topic to show the loading state correctly for that accordion
    if (qa) {
      setQa({ ...qa, [topic]: null });
    } else {
      setQa({ [topic]: null });
    }

    const promise = runQAGenerationAction({ userId: user.uid, resumeText, jobDescription, topic, numQuestions }).then((result) => {
        const newQaData = { ...qa, [topic]: result };
        setQa(newQaData);
        saveUserData(user.uid, {
            qa: newQaData,
            resumeText,
            jobDescription,
        });
        updateStoredValues(resumeText, jobDescription);
        return result;
    });

    toast.promise(promise, {
      loading: `Generating Q&A for "${topic}"...`,
      success: () => 'Q&A pairs generated successfully!',
      error: (error) => {
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
    return <QASkeleton />;
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Resume Q&A Generator</CardTitle>
          <CardDescription>
            Generate intelligent, context-aware question-and-answer pairs based on your resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <QALoading />
          ) : (
            <QATab
              qa={qa}
              onGenerate={handleGeneration}
              isLoading={isLoading}
              hasDataChanged={hasDataChanged}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
