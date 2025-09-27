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

type Topic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

export default function QAPage() {
  const { resumeText, jobDescription, qa, setQa, storedResumeText, storedJobDescription, loadDataFromCache } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic>("General");

  const hasDataChanged = (resumeText && resumeText !== storedResumeText) || (jobDescription && jobDescription !== storedJobDescription);

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
        loadDataFromCache();
        return result;
    });

    toast.promise(promise, {
      loading: `Generating Q&A for "${topic}"...`,
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
          <CardTitle className="font-headline text-xl">Resume Q&A Generator</CardTitle>
          <CardDescription>
            Generate intelligent, context-aware question-and-answer pairs based on your resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QATab
            qa={qa}
            onGenerate={handleGeneration}
            isLoading={isLoading}
            hasDataChanged={hasDataChanged}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
          />
        </CardContent>
      </Card>
    </main>
  );
}
