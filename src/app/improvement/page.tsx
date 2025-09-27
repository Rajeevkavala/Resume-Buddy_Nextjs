
'use client';

import { useState, useContext, useEffect } from 'react';
import {
  runImprovementsGenerationAction,
  exportDocx,
  exportPdf,
} from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import type { SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
import ImprovementsTab from '@/components/improvements-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/auth-context';
import { loadData } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

export default function ImprovementPage() {
  const { resumeText, jobDescription } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [improvements, setImprovements] = useState<SuggestResumeImprovementsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const data = await loadData(user.uid);
        if (data?.improvements) {
          setImprovements(data.improvements);
        }
        setIsDataLoading(false);
      };
      fetchData();
    } else if (!authLoading) {
      setIsDataLoading(false);
    }
  }, [user, authLoading]);

  const handleGeneration = async () => {
    if (!user) {
      toast.error('Authentication Error', { description: 'You must be logged in to generate improvements.' });
      return;
    }
    if (!resumeText || !jobDescription) {
      toast.error('Missing Content', {
        description: 'Please provide both a resume and a job description on the dashboard.',
      });
      return;
    }
    
    setIsLoading(true);
    const promise = runImprovementsGenerationAction({ userId: user.uid, resumeText, jobDescription });

    toast.promise(promise, {
      loading: 'Generating improvements...',
      success: (result) => {
        setImprovements(result);
        return 'Improvements generated successfully!';
      },
      error: (error) => {
        return error.message || 'An unexpected error occurred.';
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!improvements?.improvedResumeText) return;

    const exportPromise = (async () => {
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
    })();

    toast.promise(exportPromise, {
      loading: `Exporting as ${format.toUpperCase()}...`,
      success: `Resume exported successfully!`,
      error: `Could not export resume as ${format.toUpperCase()}.`,
    });
  };

  if (authLoading || isDataLoading) {
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
