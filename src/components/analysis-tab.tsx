import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from './ui/button';
import {Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Separator } from './ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AnalysisTabProps {
  analysis: AnalyzeResumeContentOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
}

const getCriticalityIcon = (criticality: "Critical" | "High" | "Medium" | "Low") => {
  switch (criticality) {
    case "Critical":
      return <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />;
    case "High":
      return <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />;
    case "Medium":
      return <Info className="h-4 w-4 text-yellow-500 mr-2" />;
    case "Low":
      return <Info className="h-4 w-4 text-blue-500 mr-2" />;
    default:
      return null;
  }
};

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
};

const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
};


export default function AnalysisTab({
  analysis,
  onGenerate,
  isLoading,
  hasDataChanged,
}: AnalysisTabProps) {

  const getButtonContent = () => {
    if (isLoading) {
      return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>;
    }
    if (analysis && hasDataChanged) {
      return <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Analysis</>;
    }
    return 'Generate Analysis';
  }

  if (!analysis || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          {analysis && hasDataChanged 
            ? 'Your resume or job description has changed.' 
            : 'Generate an in-depth analysis of your resume against the job description.'}
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {getButtonContent()}
        </Button>
      </div>
    );
  }

  const atsScore = analysis.atsScore || 0;
  const atsChartData = [
    { name: 'Score', value: atsScore, fill: 'hsl(var(--primary))' },
    { name: 'Remaining', value: 100 - atsScore, fill: 'hsl(var(--muted))' },
  ];

  const presentKeywordsCount = analysis.keywordAnalysis.presentKeywords.length;
  const missingKeywordsCount = analysis.keywordAnalysis.missingKeywords.length;
  const totalKeywords = presentKeywordsCount + missingKeywordsCount;
  const skillsMatch = totalKeywords > 0 ? Math.round((presentKeywordsCount / totalKeywords) * 100) : 0;
  const skillsMatchChartData = [
    { name: 'Matched', value: skillsMatch, fill: 'hsl(var(--chart-2))' },
    { name: 'Missing', value: 100 - skillsMatch, fill: 'hsl(var(--muted))' },
  ];

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
            <CardTitle>Regenerate Analysis</CardTitle>
            <CardDescription>
                Click the button below to regenerate the analysis with the new data.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={onGenerate} disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Analysis</>
                )}
            </Button>
        </CardContent>
      </Card>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ATS Score</CardDescription>
            <CardTitle className={`text-4xl ${getScoreColor(analysis.atsScore)}`}>{analysis.atsScore}<span className="text-lg text-muted-foreground">/100</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xs font-medium ${getScoreColor(analysis.atsScore)}`}>{getScoreStatus(analysis.atsScore)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Skills Match</CardDescription>
            <CardTitle className="text-4xl">{presentKeywordsCount}<span className="text-lg text-muted-foreground">/{totalKeywords}</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">{skillsMatch}% match</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-4xl">{analysis.contentCoveragePercentage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Job description coverage</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Word Count</CardDescription>
            <CardTitle className="text-4xl">{analysis.qualityMetrics.wordCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">words (300-800 optimal)</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Analysis */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Skills Breakdown</CardTitle>
                    <CardDescription>Comparison of skills from the job description against your resume.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Matched Skills ({presentKeywordsCount})</h4>
                        {analysis.keywordAnalysis.presentKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.keywordAnalysis.presentKeywords.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                    {skill}
                                </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No matching keywords found.</p>
                        )}
                    </div>
                    <Separator/>
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center"><XCircle className="mr-2 h-5 w-5 text-red-500" /> Missing Skills ({missingKeywordsCount})</h4>
                        {analysis.keywordAnalysis.missingKeywords.length > 0 ? (
                            <div className="space-y-2">
                               {analysis.keywordAnalysis.missingKeywords.map((item, index) => (
                                <Badge key={index} variant={item.criticality === "Critical" || item.criticality === "High" ? "destructive" : "default"} className="flex items-center w-fit">
                                    {getCriticalityIcon(item.criticality)}
                                    <span>{item.skill} ({item.criticality})</span>
                                </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No skill gaps found. Great job!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        {/* Quality Metrics */}
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Quality Factors</CardTitle>
                    <CardDescription>Assessment of your resume's content and structure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Length Score</label>
                            <span className="text-sm font-bold">{analysis.qualityMetrics.lengthScore}/100</span>
                        </div>
                        <Progress value={analysis.qualityMetrics.lengthScore} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Structure</label>
                             <span className="text-sm font-bold">{analysis.qualityMetrics.structureScore}/100</span>
                        </div>
                        <Progress value={analysis.qualityMetrics.structureScore} />
                    </div>
                     <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-medium">Readability</label>
                             <span className="text-sm font-bold">{analysis.qualityMetrics.readabilityScore}/100</span>
                        </div>
                        <Progress value={analysis.qualityMetrics.readabilityScore} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Industry Compatibility</CardTitle>
          <CardDescription>How your resume aligns with different industries based on the job description.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Industry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Compatibility Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {analysis.industryCompatibility.map((item) => (
                        <TableRow key={item.industry}>
                            <TableCell className="font-medium">{item.industry}</TableCell>
                            <TableCell>
                                <Badge variant={item.status === 'High' || item.status === 'Good' ? 'secondary' : 'outline'}>
                                    {item.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">{item.score}/100</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
          <CardDescription>
            Specific AI-generated suggestions to improve your resume's content.
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
      
    </div>
  );
}