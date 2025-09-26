import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalysisTabProps {
  analysis: AnalyzeResumeContentOutput;
}

export default function AnalysisTab({ analysis }: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ATS Score</CardTitle>
            <CardDescription>How well your resume is optimized for applicant tracking systems.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-2 pt-4">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="stroke-current text-gray-200 dark:text-gray-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className="stroke-current text-primary transition-all duration-500"
                  strokeDasharray={`${analysis.atsScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold font-headline">{analysis.atsScore}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Coverage</CardTitle>
            <CardDescription>How much of the job description is covered in your resume.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
             <p className="text-3xl font-bold font-headline">{analysis.contentCoveragePercentage}%</p>
             <Progress value={analysis.contentCoveragePercentage} className="w-full" />
             <p className="text-sm text-muted-foreground text-center">of job description keywords found.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Gaps</CardTitle>
          <CardDescription>Skills from the job description missing in your resume.</CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.skillGaps.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.skillGaps.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skill gaps found. Great job!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
