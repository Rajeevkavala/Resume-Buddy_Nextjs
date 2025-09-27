
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
import { ResumeContext } from '@/context/resume-context';
import FileUploader from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { extractText, saveData, clearData } from './actions';
import { toast } from 'sonner';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { saveUserData, clearUserData as clearLocalData } from '@/lib/local-storage';

export default function Home() {
  const {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    resumeFile,
    setResumeFile,
    loadDataFromCache,
  } = useContext(ResumeContext);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
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

    const dataToSave = { resumeText, jobDescription };

    const promise = saveData(user.uid, dataToSave).then(() => {
      // Also update local storage
      saveUserData(user.uid, dataToSave);
    });

    toast.promise(promise, {
      loading: 'Saving your data...',
      success: 'Data saved successfully!',
      error: 'Failed to save data.',
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
    });

    toast.promise(promise, {
      loading: 'Clearing your data...',
      success: () => 'Data cleared successfully!',
      error: 'Failed to clear data.',
    });
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
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
                <Button onClick={handleSaveData}>
                  <Save className="mr-2" />
                  Save Data
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                   <Trash2 className="mr-2" />
                  Clear Data
                </Button>
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
              {resumeFile && !resumeText && (
                <Button
                  onClick={handleProcessResume}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Process Resume
                </Button>
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
    </main>
  );
}
