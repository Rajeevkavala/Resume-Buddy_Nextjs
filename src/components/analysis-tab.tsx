
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
import {Loader2, CheckCircle, XCircle, RefreshCw} from 'lucide-react';
import { Separator } from './ui/separator';
import { Bar, BarChart, LabelList, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';

interface AnalysisTabProps {
  analysis: AnalyzeResumeContentOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
}

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
  const remainingScore = 100 - atsScore;
  const atsChartData = [
    { name: 'Remaining', value: remainingScore, fill: 'hsl(var(--destructive))' },
    { name: 'ATS', value: atsScore, fill: 'hsl(var(--primary))' },
  ];

  const coverageChartData = [{ name: 'Coverage', value: analysis.contentCoveragePercentage }];
  const keywordChartData = [
    { name: 'Present', value: analysis.keywordAnalysis.presentKeywords.length, fill: 'hsl(var(--chart-2))' },
    { name: 'Missing', value: analysis.keywordAnalysis.missingKeywords.length, fill: 'hsl(var(--destructive))' },
  ];
  const chartConfig = {
      present: {
        label: "Present",
        color: "hsl(var(--chart-2))",
      },
      missing: {
        label: "Missing",
        color: "hsl(var(--destructive))",
      },
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Regenerate Analysis</CardTitle>
            <CardDescription>
                Click the button below to regenerate the analysis with the same resume and job description.
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
             <ChartContainer config={{}} className="mx-auto aspect-square h-[200px]">
              <RadialBarChart
                data={atsChartData}
                startAngle={90}
                endAngle={-270}
                innerRadius={80}
                outerRadius={100}
                barSize={20}
                stackOffset="expand"
              >
                <RadialBar dataKey="value" background cornerRadius={10} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold font-headline">
                  {analysis.atsScore}
                </text>
                <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                  out of 100
                </text>
              </RadialBarChart>
            </ChartContainer>
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
            <ChartContainer config={{}} className="w-full h-[200px]">
              <BarChart accessibilityLayer data={coverageChartData} layout="vertical" margin={{left:10, right: 50}}>
                  <XAxis type="number" hide domain={[0, 100]}/>
                  <YAxis type="category" dataKey="name" hide/>
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={5} barSize={30}>
                      <LabelList dataKey="value" position="right" formatter={(value: number) => `${value}%`} className="fill-foreground font-bold font-headline text-2xl" />
                  </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keyword and Skill Analysis</CardTitle>
          <CardDescription>
            Keywords and skills from the job description compared to your resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                 <ChartContainer config={chartConfig} className="w-full h-[150px]">
                    <BarChart accessibilityLayer data={keywordChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="value" layout="vertical" radius={5} barSize={25}>
                            <LabelList dataKey="value" position="right" offset={8} className="fill-foreground font-semibold" />
                             {keywordChartData.map((entry) => (
                                <rect key={entry.name} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                 </ChartContainer>
            </div>
            <div className="space-y-4">
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
                    {analysis.keywordAnalysis.missingKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                       {analysis.keywordAnalysis.missingKeywords.map((skill, index) => (
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
            </div>
        </CardContent>
      </Card>

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
      
    </div>
  );
}

    