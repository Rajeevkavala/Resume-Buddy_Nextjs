
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
import { PieChart, Pie, Label } from 'recharts';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './ui/chart';
import { useMemo } from 'react';


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

  const missingSkillsByCriticality = useMemo(() => {
    if (!analysis?.keywordAnalysis?.missingKeywords) {
      return [];
    }
    const counts = analysis.keywordAnalysis.missingKeywords.reduce((acc, skill) => {
      acc[skill.criticality] = (acc[skill.criticality] || 0) + 1;
      return acc;
    }, {} as Record<"Critical" | "High" | "Medium" | "Low", number>);

    return [
      { name: 'Critical', value: counts.Critical || 0, fill: 'hsl(var(--destructive))' },
      { name: 'High', value: counts.High || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'Medium', value: counts.Medium || 0, fill: 'hsl(var(--chart-3))' },
      { name: 'Low', value: counts.Low || 0, fill: 'hsl(var(--chart-5))' },
    ].filter(item => item.value > 0);

  }, [analysis?.keywordAnalysis?.missingKeywords]);
  
  const criticalityChartConfig = {
    value: {
      label: 'Skills',
    },
    Critical: {
      label: 'Critical',
      color: 'hsl(var(--destructive))',
    },
    High: {
      label: 'High',
      color: 'hsl(var(--chart-2))',
    },
    Medium: {
      label: 'Medium',
      color: 'hsl(var(--chart-3))',
    },
    Low: {
      label: 'Low',
      color: 'hsl(var(--chart-5))',
    },
  };
  

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
  const atsChartConfig = {
      Score: {
        label: "ATS Score",
        color: "hsl(var(--primary))",
      },
  };

  const presentKeywordsCount = analysis.keywordAnalysis?.presentKeywords?.length || 0;
  const missingKeywordsCount = analysis.keywordAnalysis?.missingKeywords?.length || 0;
  const totalKeywords = presentKeywordsCount + missingKeywordsCount;
  const skillsMatchPercentage = totalKeywords > 0 ? Math.round((presentKeywordsCount / totalKeywords) * 100) : 0;

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
            <Button onClick={onGenerate} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Analysis</>
                )}
            </Button>
        </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[120px] flex items-center justify-center">
                    <ChartContainer config={atsChartConfig} className="w-full h-full">
                        <PieChart>
                             <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={atsChartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={35}
                                outerRadius={50}
                                strokeWidth={2}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {atsScore.toFixed(0)}
                                            </tspan>
                                            </text>
                                        );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skills Match</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[120px]">
             <div className="text-4xl font-bold">{presentKeywordsCount}<span className="text-lg text-muted-foreground">/{totalKeywords}</span></div>
             <div className="text-xs text-muted-foreground">{skillsMatchPercentage}% match</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[120px]">
            <div className="text-4xl font-bold">{analysis.contentCoveragePercentage || 0}%</div>
            <div className="text-xs text-muted-foreground">Job description coverage</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Word Count</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[120px]">
            <div className="text-4xl font-bold">{analysis.qualityMetrics?.wordCount || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">300-800 optimal</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Skills Breakdown</CardTitle>
                    <CardDescription>Comparison of skills from the job description against your resume.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div>
                        <h4 className="font-semibold mb-3 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Matched Skills ({presentKeywordsCount})</h4>
                        {analysis.keywordAnalysis?.presentKeywords && analysis.keywordAnalysis.presentKeywords.length > 0 ? (
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
                     <div>
                        <h4 className="font-semibold mb-3 flex items-center"><XCircle className="mr-2 h-5 w-5 text-red-500" /> Missing Skills ({missingKeywordsCount})</h4>
                        {analysis.keywordAnalysis?.missingKeywords && analysis.keywordAnalysis.missingKeywords.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                                {analysis.keywordAnalysis.missingKeywords.map((skill, index) => (
                                <Badge key={index} variant="outline" className="flex items-center">
                                    {getCriticalityIcon(skill.criticality)}
                                    {skill.skill}
                                </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No missing keywords found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-2">
            <Card className="h-full">
                 <CardHeader>
                    <CardTitle>Missing Skills Criticality</CardTitle>
                    <CardDescription>A breakdown of missing skills by their importance for the role.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    {missingKeywordsCount > 0 ? (
                        <ChartContainer
                            config={criticalityChartConfig}
                            className="mx-auto aspect-square h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={missingSkillsByCriticality}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    strokeWidth={2}
                                    labelLine={false}
                                    label={({
                                        cy,
                                        midAngle,
                                        innerRadius,
                                        outerRadius,
                                        value,
                                        index,
                                    }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = 15 + innerRadius + (outerRadius - innerRadius);
                                        const x = cy + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                className="fill-muted-foreground text-xs"
                                                textAnchor={x > cy ? "start" : "end"}
                                                dominantBaseline="central"
                                            >
                                                {missingSkillsByCriticality[index].name} ({value})
                                            </text>
                                        );
                                    }}
                                >
                                     <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-2xl font-bold"
                                                        >
                                                            {missingKeywordsCount}
                                                        </tspan>
                                                         <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 20}
                                                            className="fill-muted-foreground"
                                                        >
                                                            Missing
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                            <p className="text-sm font-medium">No Skill Gaps Found</p>
                            <p className="text-xs text-muted-foreground">Great job! All skills match.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      
      {analysis.industryCompatibility && analysis.industryCompatibility.length > 0 && (
            <Card>
                <CardHeader>
                <CardTitle>Industry Compatibility</CardTitle>
                <CardDescription>How your resume aligns with different industries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Industry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Compatibility</TableHead>
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
      )}

      {analysis.qualityMetrics && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Quality Factors</CardTitle>
                    <CardDescription>Assessment of your resume's content and structure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    
                        <>
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
                        </>
                    
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
      )}
    </div>
  );
}

