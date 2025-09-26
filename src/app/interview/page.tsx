
'use client';

import { useState, useContext } from 'react';
import { runInterviewGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { useToast } from '@/hooks/use-toast';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import InterviewTab from '@/components/interview-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InterviewPage() {
  const { toast } = useToast();
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const [interview, setInterview] = useState<GenerateInterviewQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneration = async () => {
    if (!resumeText || !jobDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing Content',
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await runInterviewGenerationAction({ resumeText, jobDescription });
      setInterview(result);
      toast({
        title: 'Interview Prep Complete',
        description: 'The questions have been generated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
