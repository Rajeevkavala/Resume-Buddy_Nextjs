'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { runAnalysis, exportDocx, exportPdf } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisTab from '@/components/analysis-tab';
import QATab from '@/components/qa-tab';
import InterviewTab from '@/components/interview-tab';
import ImprovementsTab from '@/components/improvements-tab';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { saveAs } from 'file-saver';


const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Analyze Your Resume
    </Button>
  );
}

export function ResumeBuddyClient() {
  const [state, formAction] = useFormState(runAnalysis, initialState);
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [originalResume, setOriginalResume] = useState('');


  useEffect(() => {
    if (!state) {
      return;
    }
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error,
      });
    }
    if (state.data) {
      setAnalysisResult(state.data);
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        setOriginalResume(formData.get('resumeText') as string);
      }
      toast({
        title: 'Analysis Complete',
        description: 'Your resume has been analyzed successfully.',
      });
      setTimeout(() => {
         resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [state, toast]);
  
  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!analysisResult?.improvements.improvedResumeText) return;
    
    const exportToast = toast({
      title: 'Exporting...',
      description: `Your resume is being exported as a ${format.toUpperCase()} file.`
    });

    try {
      const exportFn = format === 'docx' ? exportDocx : exportPdf;
      const base64Data = await exportFn(analysisResult.improvements.improvedResumeText);
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf' });
      saveAs(blob, `improved-resume.${format}`);
      exportToast.update({id: exportToast.id, title: 'Export Successful', description: `Your resume has been downloaded.`});
    } catch (error) {
      console.error(`Export to ${format} failed`, error);
      exportToast.update({id: exportToast.id, variant: 'destructive', title: 'Export Failed', description: `Could not export resume as ${format.toUpperCase()}.`});
    }
  };


  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Start Here</CardTitle>
            <CardDescription>
              Paste your resume and the target job description to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resumeText" className="font-semibold">Your Resume</Label>
                <Textarea
                  id="resumeText"
                  name="resumeText"
                  placeholder="Paste your full resume text here..."
                  className="min-h-[250px] text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="font-semibold">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Paste the job description here..."
                  className="min-h-[250px] text-sm"
                  required
                />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <div ref={resultsRef}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
              <CardDescription>
                Here is the AI-powered analysis of your resume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="qa">Q&A</TabsTrigger>
                    <TabsTrigger value="interview">Interview</TabsTrigger>
                    <TabsTrigger value="improvement">Improvement</TabsTrigger>
                  </TabsList>
                  <TabsContent value="analysis" className="mt-4">
                    <AnalysisTab analysis={analysisResult.analysis} />
                  </TabsContent>
                  <TabsContent value="qa" className="mt-4">
                    <QATab qa={analysisResult.qa} />
                  </TabsContent>
                  <TabsContent value="interview" className="mt-4">
                    <InterviewTab interview={analysisResult.interview} />
                  </TabsContent>
                  <TabsContent value="improvement" className="mt-4">
                    <ImprovementsTab 
                      improvements={analysisResult.improvements}
                      originalResume={originalResume}
                      onExport={handleExport}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                  <p className="text-muted-foreground">Your analysis results will appear here after you submit your details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
