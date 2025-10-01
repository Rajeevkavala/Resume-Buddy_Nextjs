'use client';

import { useContext, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ResumeContext } from '@/context/resume-context';
import { Button } from '@/components/ui/button';
import { extractText, saveData, clearData } from '../actions';
import { toast } from 'sonner';
import { Save, Trash2, FileText, Briefcase, Link, CheckCircle, AlertCircle, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePageTitle } from '@/hooks/use-page-title';
import { useRouter } from 'next/navigation';
import { saveUserData, clearUserData as clearLocalData } from '@/lib/local-storage';
import FileUploader from '@/components/file-uploader';
import { RoleSelector } from '@/components/role-selector';
import { JobUrlInput } from '@/components/job-url-input';
import { EnhancedJobDescriptionInput } from '@/components/enhanced-job-description-input';
import { 
  DashboardLoading, 
  FileProcessingLoading, 
  PageLoadingOverlay,
  LoadingSpinner 
} from '@/components/loading-animations';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';

export default function Dashboard() {
  const {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    jobRole,
    setJobRole,
    jobUrl,
    setJobUrl,
    resumeFile,
    setResumeFile,
    updateStoredValues,
    isDataLoaded,
  } = useContext(ResumeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Set page title
  usePageTitle('Dashboard');

  // Handle page loading state
  useEffect(() => {
    if (authLoading) {
      setIsPageLoading(true);
      return;
    }

    if (!user) {
      setIsPageLoading(false);
      return;
    }

    if (isDataLoaded) {
      const timer = setTimeout(() => setIsPageLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, isDataLoaded]);

  const handleProcessResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume file first.');
      return;
    }
    
    const formData = new FormData();
    formData.append('resume', resumeFile);

    setIsLoading(true);

    const promise = extractText(formData).then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
      setResumeText(result.text || '');
      return 'Resume processed successfully! Click "Save Data" to persist it.';
    });

    toast.promise(promise, {
      loading: 'Extracting text from your resume...',
      success: (message) => message,
      error: err => {
        return err.message || 'An unexpected error occurred.';
      },
      finally: () => {
        setIsLoading(false);
      },
    });
  };

  // Auto-extract function for file uploader
  const handleAutoExtract = async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);

    setIsLoading(true);

    try {
      const result = await extractText(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      setResumeText(result.text || '');
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveData = async () => {
    if (!user) {
      toast.error('You must be logged in to save data.');
      return;
    }
    if (!resumeText && !jobDescription && !jobRole && !jobUrl) {
      toast.error('There is no data to save.');
      return;
    }

    setIsSaving(true);

    // When saving new text, clear all previous AI results
    const dataToSave: any = { 
      resumeText, 
      jobDescription,
      analysis: null,
      qa: null,
      interview: null,
      improvements: null,
    };
    
    // Only add optional fields if they have values
    if (jobRole) {
      dataToSave.jobRole = jobRole;
    }
    
    if (jobUrl) {
      dataToSave.jobUrl = jobUrl;
    }

    const promise = saveData(user.uid, dataToSave).then(() => {
      // Also update local storage, which will clear the old results
      saveUserData(user.uid, dataToSave);
      // Update stored values efficiently without reloading
      updateStoredValues(resumeText, jobDescription, jobRole, jobUrl);
    });

    toast.promise(promise, {
      loading: 'Saving your data...',
      success: 'Data saved successfully! Previous AI analyses have been cleared.',
      error: 'Failed to save data.',
      finally: () => {
        setIsSaving(false);
      },
    });
  };

  const handleClearData = async () => {
    if (!user) {
      toast.error('You must be logged in to clear data.');
      return;
    }

    const promise = clearData(user.uid).then(() => {
      // Also clear local data
      clearLocalData(user.uid);
      // And clear local component state
      setResumeText('');
      setJobDescription('');
      setJobRole('');
      setJobUrl('');
      setResumeFile(null);
      // Update stored values to reflect the cleared state
      updateStoredValues('', '', '', '');
    });

    toast.promise(promise, {
      loading: 'Clearing your data...',
      success: () => 'Data cleared successfully!',
      error: 'Failed to clear data.',
    });
  };

  // Redirect if not authenticated (but only after loading is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      // Use replace instead of push to avoid back button issues
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Show skeleton loading while page is loading
  if (isPageLoading || authLoading || !user) {
    return <DashboardSkeleton />;
  }

  // Calculate completion status
  const completionSteps = [
    { name: 'Resume Upload', completed: !!resumeFile || !!resumeText, icon: Upload },
    { name: 'Resume Processing', completed: !!resumeText, icon: FileText },
    { name: 'Job Role', completed: !!jobRole, icon: Briefcase },
    { name: 'Job Description', completed: !!jobDescription, icon: Link },
  ];
  
  const completedSteps = completionSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / completionSteps.length) * 100;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Career Assistant
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Upload your resume, select your target role, and get personalized AI insights to advance your career.
          </p>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Setup Progress</CardTitle>
                <CardDescription>Complete all steps to unlock AI analysis</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{completedSteps}/4</div>
                <div className="text-sm text-muted-foreground">Steps Complete</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {completionSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${
                    step.completed 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${
                      step.completed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-xs ${
                      step.completed ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground/70'
                    }`}>
                      {step.completed ? 'Complete' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Show when data exists */}
        {(resumeText || jobDescription || jobRole || jobUrl) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" disabled={isSaving} className="min-w-[140px]">
                      {isSaving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Save className="mr-2 w-4 h-4" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Save Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will save your resume text and job description to the database. 
                        Any previous AI analysis results will be cleared and you'll need to regenerate them.
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSaveData}>
                        Yes, Save Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="min-w-[140px]">
                      <Trash2 className="mr-2 w-4 h-4" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your resume text, 
                        job description, and all AI analysis results from the database and local storage.
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Job Information Section */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Information
              </CardTitle>
              <CardDescription>Define your target role and job requirements</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Role</Label>
                  <RoleSelector
                    value={jobRole}
                    onValueChange={setJobRole}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job URL (Optional)</Label>
                  <JobUrlInput
                    value={jobUrl}
                    onChange={setJobUrl}
                    onJobDescriptionExtracted={setJobDescription}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Resume Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Resume
                </CardTitle>
                <CardDescription>Upload and process your resume document</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <FileUploader
                    file={resumeFile}
                    setFile={setResumeFile}
                    setPreview={setResumeText}
                    onAutoExtract={handleAutoExtract}
                    isExtracting={isLoading}
                  />
                  
                  {resumeText && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Extracted Text</Label>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processed
                        </Badge>
                      </div>
                      <Textarea
                        id="resumeText"
                        name="resumeText"
                        placeholder="Extracted text will appear here..."
                        className="min-h-[300px] text-sm bg-muted/50"
                        value={resumeText}
                        onChange={e => setResumeText(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description Section */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Job Description
                </CardTitle>
                <CardDescription>Paste or enhance the target job description</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <EnhancedJobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  jobRole={jobRole}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Action Buttons - Duplicate for better accessibility */}
          {(resumeText || jobDescription || jobRole || jobUrl) && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" disabled={isSaving} className="min-w-[180px]">
                        {isSaving ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Save className="mr-2 w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Data'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Save Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will save your resume text and job description to the database. 
                          Any previous AI analysis results will be cleared and you'll need to regenerate them.
                          Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveData}>
                          Yes, Save Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="lg" className="min-w-[180px]">
                        <Trash2 className="mr-2 w-4 h-4" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your resume text, 
                          job description, and all AI analysis results from the database and local storage.
                          Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleClearData}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Clear All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                {/* Helper text */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Save your data before generating AI analyses to persist your resume and job description
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready for Analysis Banner - Bottom Position */}
          {resumeText && jobDescription && (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">Ready for AI Analysis!</h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Your resume and job description are ready. Navigate to analysis pages to get insights.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push('/analysis')}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600 min-w-[160px]"
                  >
                    Start Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}