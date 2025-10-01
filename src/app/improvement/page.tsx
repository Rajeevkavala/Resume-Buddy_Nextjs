
'use client';

import { useState, useContext, useEffect, startTransition } from 'react';
import dynamic from 'next/dynamic';
import {
  runImprovementsGenerationAction,
  exportDocx,
} from '@/app/actions';
import { ResumeContext } from '@/context/resume-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/auth-context';
import { jsPDF } from 'jspdf';
import { saveUserData } from '@/lib/local-storage';
import { 
  ImprovementLoading, 
  PageLoadingOverlay,
  LoadingSpinner 
} from '@/components/loading-animations';
import { ImprovementSkeleton } from '@/components/ui/page-skeletons';
import { usePageTitle } from '@/hooks/use-page-title';

// Dynamically import ImprovementsTab
const ImprovementsTab = dynamic(() => import('@/components/improvements-tab'), {
  loading: () => <div className="space-y-4"><div className="h-8 bg-muted animate-pulse rounded" /><div className="h-64 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

export default function ImprovementPage() {
  const { resumeText, jobDescription, jobRole, jobUrl, improvements, analysis, setImprovements, storedResumeText, storedJobDescription, storedJobRole, storedJobUrl, updateStoredValues, isDataLoaded } = useContext(ResumeContext);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Set page title
  usePageTitle('Resume Improvements');

  // Handle page loading state - fixed logic
  useEffect(() => {
    // If auth is still loading, keep page loading
    if (authLoading) {
      setIsPageLoading(true);
      return;
    }

    // If user is not authenticated, stop loading immediately
    if (!user) {
      setIsPageLoading(false);
      return;
    }

    // If user is authenticated, wait for data to load, then add small delay
    if (isDataLoaded) {
      const timer = setTimeout(() => setIsPageLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, isDataLoaded]);


  const hasDataChanged = !!(resumeText && resumeText !== storedResumeText) || 
                         !!(jobDescription && jobDescription !== storedJobDescription) ||
                         !!(jobRole && jobRole !== storedJobRole) ||
                         !!(jobUrl && jobUrl !== storedJobUrl);

  const handleGeneration = async () => {
    if (!user) {
      toast.error('Authentication Error', { description: 'You must be logged in to generate improvements.' });
      return;
    }
    if (!resumeText) {
      toast.error('Missing Resume', {
        description: 'Please upload your resume on the dashboard.',
      });
      return;
    }
    if (!jobDescription && !jobRole) {
      toast.error('Missing Job Information', {
        description: 'Please provide either a job description or select a target role on the dashboard.',
      });
      return;
    }
    
    // If there's no analysis data, inform the user but still proceed.
    if (!analysis) {
        toast.info("For a more accurate 'before' forecast, run an analysis first.", {
            description: "The AI will estimate the 'before' state for now.",
        });
    }

    setIsLoading(true);
    setImprovements(null); // Clear previous improvements
    const promise = runImprovementsGenerationAction({ 
        userId: user.uid, 
        resumeText, 
        jobDescription,
        previousAnalysis: analysis,
        jobRole,
        jobUrl,
    }).then((result) => {
        setImprovements(result);
        
        const dataToSave: any = {
            improvements: result,
            resumeText,
            jobDescription,
        };
        
        if (jobRole) {
            dataToSave.jobRole = jobRole;
        }
        
        if (jobUrl) {
            dataToSave.jobUrl = jobUrl;
        }
        
        saveUserData(user.uid, dataToSave);
        updateStoredValues(resumeText, jobDescription, jobRole, jobUrl);
        return result;
    });

    toast.promise(promise, {
      loading: 'Generating improvements...',
      success: () => 'Improvements generated successfully!',
      error: (error: any) => {
        if (error.message && error.message.includes('[503 Service Unavailable]')) {
          return 'API call limit exceeded. Please try again later.';
        }
        return error.message || 'An unexpected error occurred.';
      },
      finally: () => setIsLoading(false)
    });
  };

  // Client-side PDF export function
  const exportPdfClient = (text: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Set font and size
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        // Page dimensions and margins
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - 2 * margin;
        const lineHeight = 7;
        let yPosition = margin;

        // Split text into lines
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.trim()) {
            // Empty line - add space
            yPosition += lineHeight;
            continue;
          }

          // Handle long lines by wrapping them
          const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
          
          for (const wrappedLine of wrappedLines) {
            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            
            doc.text(wrappedLine, margin, yPosition);
            yPosition += lineHeight;
          }
        }

        // Convert to blob
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Client-side PDF generation error:', error);
        reject(error);
      }
    });
  };

  const handleExport = async (format: 'docx' | 'pdf', filename?: string) => {
    if (!improvements?.improvedResumeText) return;

    const exportPromise = (async () => {
      try {
        let blob: Blob;
        
        if (format === 'docx') {
          const base64Data = await exportDocx(improvements.improvedResumeText);
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
        } else {
          // Use client-side PDF generation
          blob = await exportPdfClient(improvements.improvedResumeText);
        }
        
        saveAs(blob, filename || `improved-resume.${format}`);
      } catch (error) {
        console.error(`Error exporting ${format}:`, error);
        throw error;
      }
    })();

    toast.promise(exportPromise, {
      loading: `Exporting as ${format.toUpperCase()}...`,
      success: `Resume exported successfully!`,
      error: `Could not export resume as ${format.toUpperCase()}.`,
    });
  };

  // Show skeleton loading while page is loading or user not authenticated
  if (isPageLoading || !user) {
    return <ImprovementSkeleton />;
  }

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-8">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-xl">Resume Improvement</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Get AI-powered suggestions to improve your resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <ImprovementLoading />
          ) : (
            <ImprovementsTab
              improvements={improvements}
              originalResume={resumeText}
              onExport={handleExport}
              onGenerate={handleGeneration}
              isLoading={isLoading}
              hasDataChanged={hasDataChanged}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
