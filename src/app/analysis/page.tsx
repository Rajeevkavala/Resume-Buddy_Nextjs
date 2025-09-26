
'use client';

import { useState, useContext } from 'react';
import { runAnalysisAction } from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { useToast } from '@/hooks/use-toast';
import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';
import AnalysisTab from '@/components/analysis-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalysisPage() {
  const { toast } = useToast();
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const [analysis, setAnalysis] = useState<AnalyzeResumeContentOutput | null>(null);
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
      const result = await runAnalysisAction({ resumeText, jobDescription });
      setAnalysis(result);
      toast({
        title: 'Analysis Complete',
        description: 'The analysis has been generated successfully.',
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
          />
        </CardContent>
      </Card>
    </main>
  );
}
