
'use client';

import { useState, useContext } from 'react';
import {
  runImprovementsGenerationAction,
  exportDocx,
  exportPdf,
} from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { useToast } from '@/hooks/use-toast';
import type { SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
import ImprovementsTab from '@/components/improvements-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAs } from 'file-saver';

export default function ImprovementPage() {
  const { toast } = useToast();
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const [improvements, setImprovements] = useState<SuggestResumeImprovementsOutput | null>(null);
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
      const result = await runImprovementsGenerationAction({ resumeText, jobDescription });
      setImprovements(result);
      toast({
        title: 'Improvements Complete',
        description: 'The suggestions have been generated successfully.',
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

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!improvements?.improvedResumeText) return;

    const exportToast = toast({
      title: 'Exporting...',
      description: `Your resume is being exported as a ${format.toUpperCase()} file.`,
    });

    try {
      const exportFn = format === 'docx' ? exportDocx : exportPdf;
      const base64Data = await exportFn(
        improvements.improvedResumeText
      );
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type:
          format === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/pdf',
      });
      saveAs(blob, `improved-resume.${format}`);
      exportToast.update({
        id: exportToast.id,
        title: 'Export Successful',
        description: `Your resume has been downloaded.`,
      });
    } catch (error) {
      console.error(`Export to ${format} failed`, error);
      exportToast.update({
        id: exportToast.id,
        variant: 'destructive',
        title: 'Export Failed',
        description: `Could not export resume as ${format.toUpperCase()}.`,
      });
    }
  };


  return (
    <main className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Resume Improvement</CardTitle>
          <CardDescription>
            Get AI-powered suggestions to improve your resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovementsTab
            improvements={improvements}
            originalResume={resumeText}
            onExport={handleExport}
            onGenerate={handleGeneration}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
