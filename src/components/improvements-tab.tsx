
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
import {Download, FileText, Loader2, RefreshCw, ArrowRight, TrendingUp, CheckCircle, Target, Trophy, FileBadge } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from './ui/table';

interface ImprovementsTabProps {
  improvements: SuggestResumeImprovementsOutput | null;
  originalResume: string;
  onExport: (format: 'docx' | 'pdf') => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
}

const StatCard = ({ icon, title, before, after, suffix = "" }: { icon: React.ReactNode, title: string, before: number, after: number, suffix?: string }) => {
    const improvement = after - before;
    const isPositive = improvement >= 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{after}{suffix}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                        {isPositive ? '+' : ''}{improvement}{suffix}
                    </span>
                    <span className="mx-1"> from {before}{suffix}</span>
                </p>
            </CardContent>
        </Card>
    );
};


export default function ImprovementsTab({
  improvements,
  originalResume,
  onExport,
  onGenerate,
  isLoading,
  hasDataChanged,
}: ImprovementsTabProps) {

  const getButtonContent = () => {
    if (isLoading) {
      return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>;
    }
    if (improvements && hasDataChanged) {
      return <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Improvements</>;
    }
    return 'Generate Improvements';
  }

  if (!improvements || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <h3 className="text-lg font-semibold mb-2">Enhance Your Resume</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {improvements && hasDataChanged
            ? 'Your resume or job description has changed. Regenerate to get new improvements.'
            : 'Let AI transform your resume by quantifying achievements, integrating skills, and optimizing for ATS.'}
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {getButtonContent()}
        </Button>
      </div>
    );
  }
  
  const { impactForecast, improvementsSummary, quantifiedAchievements, integratedSkills, improvedResumeText } = improvements;

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
             <Button onClick={onGenerate} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Improvements</>
                )}
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary"/> Enhancement Impact Forecast</CardTitle>
                <CardDescription>Projected improvements based on AI enhancements.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <StatCard 
                    icon={<FileBadge className="h-4 w-4 text-muted-foreground" />}
                    title="ATS Score"
                    before={impactForecast?.atsScore?.before ?? 0}
                    after={impactForecast?.atsScore?.after ?? 0}
                    suffix="%"
                />
                 <StatCard 
                    icon={<Target className="h-4 w-4 text-muted-foreground" />}
                    title="Skills Match"
                    before={impactForecast?.skillsMatch?.before ?? 0}
                    after={impactForecast?.skillsMatch?.after ?? 0}
                    suffix="%"
                />
                 <StatCard 
                    icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
                    title="Quantified Achievements"
                    before={impactForecast?.quantifiedAchievements?.before ?? 0}
                    after={impactForecast?.quantifiedAchievements?.after ?? 0}
                />
            </CardContent>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Summary of Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {improvementsSummary}
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Resume Before & After</CardTitle>
          <CardDescription>Compare the original version with the AI-enhanced version.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    {improvedResumeText}
                    </p>
                </ScrollArea>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>New Quantified Achievements</CardTitle>
                <CardDescription>Responsibilities transformed into measurable results.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                        {(quantifiedAchievements ?? []).map((item, index) => (
                            <div key={index} className="space-y-2 text-sm">
                                <p className="text-muted-foreground line-through">{item.original || 'General duty'}</p>
                                <div className="flex items-start gap-2">
                                    <ArrowRight className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                    <p className="font-semibold">{item.improved}</p>
                                </div>
                                <Badge variant="outline">{item.section}</Badge>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Integrated Skills</CardTitle>
                <CardDescription>Missing skills from the job description woven into your resume.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[300px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Skill</TableHead>
                                <TableHead>Integration Point</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(integratedSkills ?? []).map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell><Badge>{item.skill}</Badge></TableCell>
                                    <TableCell className="text-xs text-muted-foreground">"...{item.integrationPoint}..."</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </ScrollArea>
            </CardContent>
        </Card>
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
