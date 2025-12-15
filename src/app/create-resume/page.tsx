'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useResume } from '@/context/resume-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { useAutoSave } from '@/hooks/use-auto-save';
import toast from 'react-hot-toast';
import { ModernTemplateId } from '@/lib/modern-templates';
import { parseResumeText } from '@/lib/resume-parser';
import { ResumeData } from '@/lib/types';

// Lazy load heavy components - only load when tab is active
const ModernTemplateSelector = dynamic(
  () => import('@/components/modern-template-selector').then(mod => mod.ModernTemplateSelector),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

const ModernResumePreview = dynamic(
  () => import('@/components/modern-resume-preview').then(mod => mod.ModernResumePreview),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    ),
    ssr: false,
  }
);

const ResumeContentEditor = dynamic(
  () => import('@/components/resume-content-editor').then(mod => mod.ResumeContentEditor),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    ),
    ssr: false,
  }
);

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { resumeText, improvements } = useResume();
  usePageTitle('Resume Builder');
  
  const [selectedTemplate, setSelectedTemplate] = useState<ModernTemplateId>('professional');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [hasDataChanged, setHasDataChanged] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  const editSectionRef = useRef<HTMLDivElement | null>(null);
  const selectSectionRef = useRef<HTMLDivElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToTabSection = useCallback((tabId: string) => {
    const target =
      tabId === 'edit'
        ? editSectionRef.current
        : tabId === 'select'
          ? selectSectionRef.current
          : tabId === 'preview'
            ? previewSectionRef.current
            : null;

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const setTabAndScroll = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      // TabsContent uses forceMount, but schedule after state update to keep scrolling reliable.
      requestAnimationFrame(() => scrollToTabSection(tabId));
    },
    [scrollToTabSection]
  );

  const draftKey = user ? `resume_buddy_builder_draft_${user.uid}` : 'resume_buddy_builder_draft_anon';
  const { loadFromStorage } = useAutoSave({
    key: draftKey,
    data: resumeData,
    delay: 500,
    enabled: !!resumeData,
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Restore any saved draft before parsing resumeText.
  useEffect(() => {
    if (draftChecked) return;
    if (authLoading) return;

    const saved = loadFromStorage();
    if (saved?.data) {
      setResumeData(saved.data);
      setHasDataChanged(false);
    }

    setDraftChecked(true);
  }, [authLoading, draftChecked, loadFromStorage]);

  // Parse resume data - Load basic data from original resume only
  useEffect(() => {
    if (!draftChecked) return;

    if (!resumeData) {
      setIsLoading(true);
      // Use original resume text for initial load (not improved)
      if (resumeText) {
        try {
          const parsed = parseResumeText(resumeText);
          console.log('📊 Parsed Resume Data (Original):', parsed);
          setResumeData(parsed);
        } catch (error) {
          console.error(error);
          toast.error('Failed to parse resume');
        }
      } else {
        // Create empty resume data structure if no resume text
        // Note: the resume builder/editor in this repo uses a legacy ResumeData shape
        // (skills as grouped array, education as array). Keep this shape to avoid the
        // editor clearing/crashing, and cast to the shared type for compatibility.
        setResumeData(
          {
            personalInfo: {
              fullName: '',
              email: '',
              phone: '',
              location: '',
              linkedin: '',
              github: '',
              portfolio: '',
              website: '',
            },
            summary: '',
            skills: [],
            experience: [],
            education: [],
          } as any
        );
      }
      setIsLoading(false);
    }
  }, [resumeText, resumeData, draftChecked]);

  // Handle resume data changes
  const handleResumeDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    setHasDataChanged(true);
  };

  const stepMeta = (() => {
    const steps = [
      { id: 'edit', label: 'Edit content' },
      { id: 'select', label: 'Choose template' },
      { id: 'preview', label: 'Preview & export' },
    ] as const;

    const currentIndex = Math.max(
      0,
      steps.findIndex((s) => s.id === activeTab)
    );
    const current = steps[currentIndex];
    const next = steps[currentIndex + 1];

    return {
      steps,
      currentIndex,
      current,
      next,
    };
  })();

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state - matching analysis/improvements pattern
  if (!resumeData) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/20 rounded-xl min-h-[500px] bg-gradient-to-br from-primary/5 to-transparent">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Resume Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please upload and analyze your resume first to use the resume builder
            </p>
            <Button onClick={() => router.push('/dashboard')} size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section - MATCHING DASHBOARD PATTERN */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Builder
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Create Resume
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Choose from modern responsive templates and export directly to PDF or DOCX
          </p>
        </div>

        {/* AI Improved Badge Alert - MATCHING IMPROVEMENTS TAB */}
        {improvements?.improvedResumeText && (
          <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">AI-Improved Resume Available</p>
                  <p className="text-sm text-muted-foreground">
                    Your resume has been enhanced with AI. Use the "Fill from Improved Resume" action in the editor to populate the form with optimized data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidance / Prerequisites */}
        {!resumeText && (
          <Card className="border-primary/10 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">No resume uploaded yet</p>
                    <p className="text-sm text-muted-foreground">
                      You can build from scratch here, or upload your resume first for faster editing.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => router.push('/dashboard#resume')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('edit')}>
                      Continue Here
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple step guidance */}
        <Card className="border-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Step {stepMeta.currentIndex + 1} of {stepMeta.steps.length}
                </p>
                <p className="font-semibold">{stepMeta.current.label}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'edit' && 'Review and adjust your resume details.'}
                  {activeTab === 'select' && 'Pick a template that matches your style.'}
                  {activeTab === 'preview' && 'Preview and export to PDF or DOCX.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {stepMeta.next ? (
                  <Button onClick={() => setTabAndScroll(stepMeta.next!.id)}>
                    Next: {stepMeta.next.label}
                  </Button>
                ) : (
                  <Button onClick={() => setTabAndScroll('preview')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview & Export
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs - MATCHING IMPROVEMENTS TAB PATTERN */}
        <Tabs value={activeTab} onValueChange={setTabAndScroll} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="edit">
              <FileText className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="select">
              <FileText className="h-4 w-4 mr-2" />
              Template
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" forceMount className="mt-8">
            <div ref={editSectionRef} id="resume-builder-edit" className="scroll-mt-24">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Edit Resume Content
                </CardTitle>
                <CardDescription>
                  Modify your resume data before exporting. All changes will be reflected in the preview.
                  {hasDataChanged && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                      • Unsaved changes
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeContentEditor 
                  resumeData={resumeData} 
                  onChange={handleResumeDataChange}
                  improvements={improvements}
                />

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setTabAndScroll('select')}>
                    Next: Choose template
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="select" forceMount className="mt-8">
            <div ref={selectSectionRef} id="resume-builder-select" className="space-y-4 scroll-mt-24">
              <ModernTemplateSelector 
                selectedTemplate={selectedTemplate} 
                onSelectTemplate={(id) => {
                  setSelectedTemplate(id);
                }} 
              />
              <div className="flex justify-end">
                <Button onClick={() => setTabAndScroll('preview')}>
                  Next: Preview & export
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" forceMount className="mt-8 space-y-6">
            <div ref={previewSectionRef} id="resume-builder-preview" className="scroll-mt-24" />
            {/* Export Instructions */}
            <Card className="border-primary/10 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold">Export Your Resume</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• <strong>PDF:</strong> Best for applying online</p>
                      <p>• <strong>DOCX:</strong> Editable Word document</p>
                      <p>• <strong>Print:</strong> Print or “Save as PDF”</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasDataChanged && (
              <Card className="border-orange-500/20 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-300">Modified Content</p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        You have edited the resume content. The preview below reflects your latest changes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <ModernResumePreview 
              key={`${selectedTemplate}-${hasDataChanged}`}
              templateId={selectedTemplate} 
              resumeData={resumeData} 
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
