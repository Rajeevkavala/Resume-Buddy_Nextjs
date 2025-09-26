'use client';

import {useState} from 'react';
import {
  runAnalysisAction,
  runQAGenerationAction,
  runInterviewGenerationAction,
  runImprovementsGenerationAction,
  exportDocx,
  exportPdf,
} from '@/app/actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import AnalysisTab from '@/components/analysis-tab';
import QATab from '@/components/qa-tab';
import InterviewTab from '@/components/interview-tab';
import ImprovementsTab from '@/components/improvements-tab';
import {useToast} from '@/hooks/use-toast';
import type {AnalysisResult} from '@/lib/types';
import {saveAs} from 'file-saver';

type TabType = 'analysis' | 'qa' | 'interview' | 'improvement';

export function ResumeBuddyClient() {
  const {toast} = useToast();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    analysis: null,
    qa: null,
    interview: null,
    improvements: null,
  });
  const [loading, setLoading] = useState<Partial<Record<TabType, boolean>>>({});

  const handleGeneration = async (tab: TabType) => {
    setLoading(prev => ({...prev, [tab]: true}));
    try {
      const input = {resumeText, jobDescription};
      let result = {};
      if (tab === 'analysis') {
        const analysis = await runAnalysisAction(input);
        result = {analysis};
      } else if (tab === 'qa') {
        const qa = await runQAGenerationAction(input);
        result = {qa};
      } else if (tab === 'interview') {
        const interview = await runInterviewGenerationAction(input);
        result = {interview};
      } else if (tab === 'improvement') {
        const improvements = await runImprovementsGenerationAction(input);
        result = {improvements};
      }

      setAnalysisResult(prev => ({...prev, ...result}));

      toast({
        title: `${tab.charAt(0).toUpperCase() + tab.slice(1)} Generation Complete`,
        description: 'The results have been generated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error.message ||
          'An unexpected error occurred. Please check your inputs.',
      });
    } finally {
      setLoading(prev => ({...prev, [tab]: false}));
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!analysisResult?.improvements?.improvedResumeText) return;

    const exportToast = toast({
      title: 'Exporting...',
      description: `Your resume is being exported as a ${format.toUpperCase()} file.`,
    });

    try {
      const exportFn = format === 'docx' ? exportDocx : exportPdf;
      const base64Data = await exportFn(
        analysisResult.improvements.improvedResumeText
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
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
          <CardDescription>
            Paste your resume and the target job description below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="resumeText" className="font-semibold">
                Your Resume
              </Label>
              <Textarea
                id="resumeText"
                name="resumeText"
                placeholder="Paste your full resume text here..."
                className="min-h-[300px] text-sm"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="font-semibold">
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Paste the job description here..."
                className="min-h-[300px] text-sm"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Resume Analysis
            </CardTitle>
            <CardDescription>
              Get an in-depth analysis of your resume against the job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalysisTab
              analysis={analysisResult.analysis}
              onGenerate={() => handleGeneration('analysis')}
              isLoading={!!loading.analysis}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Resume Q&amp;A
            </CardTitle>
            <CardDescription>
              Generate potential questions and answers based on your resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QATab
              qa={analysisResult.qa}
              onGenerate={() => handleGeneration('qa')}
              isLoading={!!loading.qa}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Interview Prep
            </CardTitle>
            <CardDescription>
              Practice with AI-generated questions tailored to the role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewTab
              interview={analysisResult.interview}
              onGenerate={() => handleGeneration('interview')}
              isLoading={!!loading.interview}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Resume Improvement
            </CardTitle>
            <CardDescription>
              Get AI-powered suggestions to improve your resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImprovementsTab
              improvements={analysisResult.improvements}
              originalResume={resumeText}
              onExport={handleExport}
              onGenerate={() => handleGeneration('improvement')}
              isLoading={!!loading.improvement}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
