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
import { ResumeContext } from '@/context/resume-context';
import { Button } from '@/components/ui/button';
import { extractText, saveData, clearData } from '../actions';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { saveUserData, clearUserData as clearLocalData } from '@/lib/local-storage';
import FileUploader from '@/components/file-uploader';
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
  
  const handleSaveData = async () => {
    if (!user) {
      toast.error('You must be logged in to save data.');
      return;
    }
    if (!resumeText && !jobDescription) {
      toast.error('There is no data to save.');
      return;
    }

    setIsSaving(true);

    // When saving new text, clear all previous AI results
    const dataToSave = { 
      resumeText, 
      jobDescription,
      analysis: null,
      qa: null,
      interview: null,
      improvements: null,
    };

    const promise = saveData(user.uid, dataToSave).then(() => {
      // Also update local storage, which will clear the old results
      saveUserData(user.uid, dataToSave);
      // Update stored values efficiently without reloading
      updateStoredValues(resumeText, jobDescription);
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
      setResumeFile(null);
      // Update stored values to reflect the cleared state
      updateStoredValues('', '');
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

  return (
    <div className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
              <CardDescription>
                Upload your resume, paste the job description, and then save your data.
              </CardDescription>
            </div>
            {(resumeText || jobDescription) && (
               <div className="flex gap-2 mt-4 sm:mt-0">
                {/* Save Data Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isSaving}>
                      {isSaving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Save className="mr-2" />
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

                {/* Clear Data Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2" />
                      Clear Data
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-upload" className="font-semibold">
                  Your Resume
                </Label>
                <FileUploader
                  file={resumeFile}
                  setFile={setResumeFile}
                  setPreview={setResumeText}
                />
              </div>
              {resumeFile && !resumeText && !isLoading && (
                <Button
                  onClick={handleProcessResume}
                  disabled={isLoading}
                  className="w-full"
                >
                  Process Resume
                </Button>
              )}
              {isLoading && (
                <FileProcessingLoading fileName={resumeFile?.name} />
              )}
              {resumeText && (
                <div className="space-y-2">
                  <Label className="font-semibold">Extracted Text</Label>
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
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="font-semibold">
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Paste the job description here..."
                className="min-h-[400px] text-sm"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}