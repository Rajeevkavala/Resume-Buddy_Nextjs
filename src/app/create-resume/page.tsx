'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResume } from '@/context/resume-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, AlertCircle, Sparkles, Eye, Activity, Briefcase, Award, Code, BadgeCheck, User, GraduationCap, Check } from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModernTemplateSelector } from '@/components/modern-template-selector';
import { ModernResumePreview } from '@/components/modern-resume-preview';
import { ModernTemplateId } from '@/lib/modern-templates';
import { parseResumeText } from '@/lib/resume-parser';
import { ResumeData } from '@/lib/types';
import { ResumeContentEditor } from '@/components/resume-content-editor';

// Statistics Item Component
interface StatItemProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
}

function StatItem({ label, value, icon: Icon, gradient }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br', gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// Checklist Item Component
interface ChecklistItemProps {
  completed: boolean;
  label: string;
  icon: React.ReactNode;
}

function ChecklistItem({ completed, label, icon }: ChecklistItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg transition-colors",
      completed ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/30"
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
        completed 
          ? "bg-green-500 text-white" 
          : "bg-muted-foreground/20"
      )}>
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          icon
        )}
      </div>
      <span className={cn(
        "text-sm font-medium",
        completed ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { resumeText, improvements } = useResume();
  usePageTitle('Resume Builder');
  
  const [selectedTemplate, setSelectedTemplate] = useState<ModernTemplateId>('professional');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('select');
  const [hasDataChanged, setHasDataChanged] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Parse resume data - Load basic data from original resume only
  useEffect(() => {
    if (!resumeData) {
      setIsLoading(true);
      // Use original resume text for initial load (not improved)
      if (resumeText) {
        try {
          const parsed = parseResumeText(resumeText);
          console.log('📊 Parsed Resume Data (Original):', parsed);
          setResumeData(parsed);
          toast.success('Resume loaded! Use "Fill from Improved Resume" for AI-enhanced data.');
        } catch (error) {
          console.error(error);
          toast.error('Failed to parse resume');
        }
      } else {
        // Create empty resume data structure if no resume text
        setResumeData({
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
          },
          summary: '',
          skills: [],
          experience: [],
          education: [],
        });
      }
      setIsLoading(false);
    }
  }, [resumeText, resumeData]);

  // Handle resume data changes
  const handleResumeDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    setHasDataChanged(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E: Go to Edit tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setActiveTab('edit');
      }
      // Ctrl/Cmd + P: Toggle preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setActiveTab('preview');
      }
      // Ctrl/Cmd + T: Go to Template selection
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setActiveTab('select');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

  // Calculate completion metrics
  const calculateCompletion = () => {
    if (!resumeData) return { percentage: 0, items: [] };
    
    const items = [
      { completed: !!resumeData.personalInfo.fullName, label: 'Personal Information', icon: <User className="h-4 w-4" /> },
      { completed: !!resumeData.summary, label: 'Professional Summary', icon: <FileText className="h-4 w-4" /> },
      { completed: resumeData.experience.length > 0, label: 'Work Experience', icon: <Briefcase className="h-4 w-4" /> },
      { completed: resumeData.education.length > 0, label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
      { completed: (resumeData.projects?.length || 0) > 0, label: 'Projects', icon: <Code className="h-4 w-4" /> },
      { completed: resumeData.skills.length > 0, label: 'Skills', icon: <Award className="h-4 w-4" /> },
    ];
    
    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    
    return { percentage, items };
  };

  const completion = resumeData ? calculateCompletion() : { percentage: 0, items: [] };

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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">AI-Improved Resume Available</p>
                  <p className="text-sm text-muted-foreground">
                    Your resume has been enhanced with AI. Use the "Fill from Improved Resume" button in the Experience tab to populate the form with optimized data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Statistics - MATCHING DASHBOARD PATTERN */}
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Resume Overview
            </CardTitle>
            <CardDescription>Summary of your resume content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem 
                label="Experience" 
                value={resumeData.experience.length} 
                icon={Briefcase}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatItem 
                label="Skills" 
                value={resumeData.skills.reduce((acc, s) => acc + s.items.length, 0)} 
                icon={Award}
                gradient="from-purple-500 to-violet-600"
              />
              <StatItem 
                label="Projects" 
                value={resumeData.projects?.length || 0} 
                icon={Code}
                gradient="from-green-500 to-emerald-600"
              />
              <StatItem 
                label="Certifications" 
                value={resumeData.certifications?.length || 0} 
                icon={BadgeCheck}
                gradient="from-orange-500 to-red-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume Completeness Tracker */}
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Resume Completeness
                </CardTitle>
                <CardDescription>
                  {completion.percentage}% Complete
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {completion.items.filter(i => i.completed).length}/{completion.items.length}
                </div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
            </div>
            <Progress value={completion.percentage} className="h-2 mt-4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {completion.items.map((item, index) => (
                <ChecklistItem 
                  key={index}
                  completed={item.completed}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs - MATCHING IMPROVEMENTS TAB PATTERN */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger 
              value="edit"
              className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <FileText className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Edit Resume</span>
            </TabsTrigger>
            <TabsTrigger 
              value="select"
              className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <FileText className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Select Template</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <Eye className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Preview & Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-8">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="select" className="mt-8">
            <ModernTemplateSelector 
              selectedTemplate={selectedTemplate} 
              onSelectTemplate={(id) => { 
                setSelectedTemplate(id); 
                toast.success('Template selected! Preview will update automatically.'); 
              }} 
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-8 space-y-6">
            {/* Export Instructions */}
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-800 dark:text-blue-300">Export Your Resume</p>
                    <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <p>• <strong>Export to PDF:</strong> Download your resume as a PDF file with perfect formatting</p>
                      <p>• <strong>Export to DOCX:</strong> Get an editable Word document version</p>
                      <p>• <strong>Print:</strong> Open the browser print dialog to print or save as PDF</p>
                      <p className="mt-2 text-xs italic">
                        All exports maintain your chosen template's styling and layout.
                      </p>
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

        {/* Keyboard Shortcuts Hint */}
        <Card className="border-primary/10 bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-background rounded border text-xs">E</kbd>
                <span>Edit Resume</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-background rounded border text-xs">T</kbd>
                <span>Select Template</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-background rounded border text-xs">P</kbd>
                <span>Preview</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
