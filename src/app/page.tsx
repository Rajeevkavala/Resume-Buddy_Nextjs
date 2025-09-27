
'use client';

import { useContext, useState, useEffect, useCallback } from 'react';
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
import { extractText, saveData } from './actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { loadData } from '@/lib/firestore';
import { useDebounce } from '@/hooks/use-debounce';

export default function Home() {
  const {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    resumeFile,
    setResumeFile,
  } = useContext(ResumeContext);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const debouncedJobDescription = useDebounce(jobDescription, 500);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const data = await loadData(user.uid);
        if (data) {
          if (data.resumeText) setResumeText(data.resumeText);
          if (data.jobDescription) setJobDescription(data.jobDescription);
        }
      };
      fetchData();
    }
  }, [user, setResumeText, setJobDescription]);

  const handleSaveData = useCallback(async (data: { resumeText?: string; jobDescription?: string }) => {
    if (user) {
      try {
        await saveData(user.uid, data);
      } catch (error) {
        toast.error('Failed to save data.');
      }
    }
  }, [user]);

  useEffect(() => {
    if (debouncedJobDescription && user) {
      handleSaveData({ jobDescription: debouncedJobDescription });
    }
  }, [debouncedJobDescription, user, handleSaveData]);

  const handleProcessResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume file first.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setIsLoading(true);

    const promise = extractText(formData).then(async result => {
      if (result.error) {
        throw new Error(result.error);
      }
      const newResumeText = result.text || '';
      setResumeText(newResumeText);
      await handleSaveData({ resumeText: newResumeText });
      return result;
    });


    toast.promise(promise, {
      loading: 'Extracting text from your resume...',
      success: 'Resume processed and saved successfully!',
      error: err => {
        return err.message || 'An unexpected error occurred.';
      },
      finally: () => {
        setIsLoading(false);
      },
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
          <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
          <CardDescription>
            Upload your resume and paste the target job description below to get
            started. Your work is saved automatically.
          </CardDescription>
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
                    readOnly
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
