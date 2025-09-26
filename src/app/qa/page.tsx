
'use client';

import { useState, useContext } from 'react';
import { runQAGenerationAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { useToast } from '@/hooks/use-toast';
import type { GenerateResumeQAOutput } from '@/ai/flows/generate-resume-qa';
import QATab from '@/components/qa-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QAPage() {
  const { toast } = useToast();
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const [qa, setQa] = useState<GenerateResumeQAOutput | null>(null);
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
      const result = await runQAGenerationAction({ resumeText, jobDescription });
      setQa(result);
      toast({
        title: 'Q&A Generation Complete',
        description: 'The Q&A pairs have been generated successfully.',
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
          />
        </CardContent>
      </Card>
    </main>
  );
}
