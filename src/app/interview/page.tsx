'use client';

import { useState, useContext } from 'react';
import type { GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { runInterviewGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import InterviewTab from '@/components/interview-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { saveUserData } from '@/lib/local-storage';

export type InterviewType = "Technical" | "Behavioral" | "Leadership" | "General";
export type DifficultyLevel = "Entry" | "Mid" | "Senior" | "Executive";

export default function InterviewPage() {
  const { resumeText, jobDescription, interview, setInterview, loadDataFromCache } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
    if (!resumeText || !jobDescription) {
      toast.error('Missing Content', {
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }
    
    setIsLoading(true);
    setInterview(null); // Clear previous interview data

    const input = {
      userId: user.uid,
      resumeText,
      jobDescription,
      ...config,
    };

    const promise = runInterviewGenerationAction(input).then((result: GenerateInterviewQuestionsOutput) => {
        // Validate that the result has questions
        if (!result || !result.questions || result.questions.length === 0) {
            throw new Error("The AI failed to generate questions. Please try again.");
        }
        setInterview(result);
        // We only save the result to the context/local storage, not the config that generated it.
        saveUserData(user.uid, {
            interview: result,
            resumeText,
            jobDescription,
        });
        loadDataFromCache();
        return result;
    });

    toast.promise(promise, {
      loading: 'Generating interview quiz...',
      success: () => 'Interview quiz is ready!',
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
          <CardTitle className="font-headline text-xl">AI-Powered Interview Quiz</CardTitle>
          <CardDescription>
            Configure your interview type and difficulty to generate a tailored quiz.
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
