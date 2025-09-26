import type {SuggestResumeImprovementsOutput} from '@/ai/flows/suggest-resume-improvements';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Download, FileText, Loader2} from 'lucide-react';

interface ImprovementsTabProps {
  improvements: SuggestResumeImprovementsOutput | null;
  originalResume: string;
  onExport: (format: 'docx' | 'pdf') => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function ImprovementsTab({
  improvements,
  originalResume,
  onExport,
  onGenerate,
  isLoading,
}: ImprovementsTabProps) {
  if (!improvements) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          Generate an improved version of your resume.
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Improvements
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary of Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {improvements.improvementsSummary}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-muted-foreground">
            Original Resume
          </h3>
          <ScrollArea className="h-96 rounded-md border p-4">
            <p className="text-sm whitespace-pre-wrap">{originalResume}</p>
          </ScrollArea>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Improved Resume</h3>
          <ScrollArea className="h-96 rounded-md border p-4 bg-primary/5">
            <p className="text-sm whitespace-pre-wrap">
              {improvements.improvedResumeText}
            </p>
          </ScrollArea>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Improved Resume</CardTitle>
          <CardDescription>
            Download your enhanced resume in your preferred format.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => onExport('docx')} className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Export as DOCX
          </Button>
          <Button onClick={() => onExport('pdf')} variant="secondary" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
