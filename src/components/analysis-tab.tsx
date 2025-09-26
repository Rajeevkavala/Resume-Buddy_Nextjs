import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Button} from './ui/button';
import {Loader2, CheckCircle, XCircle} from 'lucide-react';
import { Separator } from './ui/separator';

interface AnalysisTabProps {
  analysis: AnalyzeResumeContentOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function AnalysisTab({
  analysis,
  onGenerate,
  isLoading,
}: AnalysisTabProps) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          Generate an in-depth analysis of your resume against the job description.
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Analysis
        </Button>
      </div>
    );
  }

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
            <CardDescription>
              How well your resume is optimized for applicant tracking systems.
            </CardDescription>
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
                <span className="text-3xl font-bold font-headline">
                  {analysis.atsScore}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Coverage</CardTitle>
            <CardDescription>
              How much of the job description is covered in your resume.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
            <p className="text-3xl font-bold font-headline">
              {analysis.contentCoveragePercentage}%
            </p>
            <Progress
              value={analysis.contentCoveragePercentage}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground text-center">
              of job description keywords found.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
          <CardDescription>
            Specific suggestions to improve your resume's content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Action Verb Feedback</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.actionVerbFeedback}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Quantifiable Results Feedback</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.quantifiableResultsFeedback}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Keyword and Skill Analysis</CardTitle>
          <CardDescription>
            Keywords and skills from the job description compared to your resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Present Keywords</h4>
            {analysis.keywordAnalysis.presentKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.keywordAnalysis.presentKeywords.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No matching keywords found.
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-3 flex items-center"><XCircle className="mr-2 h-5 w-5 text-red-500" /> Missing Keywords & Skills</h4>
            {analysis.skillGaps.length > 0 || analysis.keywordAnalysis.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[...new Set([...analysis.skillGaps, ...analysis.keywordAnalysis.missingKeywords])].map((skill, index) => (
                  <Badge key={index} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skill gaps found. Great job!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
