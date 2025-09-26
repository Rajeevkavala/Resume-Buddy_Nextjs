
'use client';

import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResumeContext } from '@/context/resume-context';

export default function Home() {
  const { resumeText, setResumeText, jobDescription, setJobDescription } = useContext(ResumeContext);

  return (
    <main className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Dashboard</CardTitle>
          <CardDescription>
            Paste your resume and the target job description below to get started. The content will be available across all tools.
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
                className="min-h-[400px] text-sm"
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
