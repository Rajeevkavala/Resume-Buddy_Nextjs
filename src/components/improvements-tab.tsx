4

import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Download, FileText, RefreshCw, ArrowRight, TrendingUp, CheckCircle, Target, Trophy, FileBadge, Sparkles, Wand2, Zap, BarChart3, Users, Award, Eye, ArrowUpRight, CheckSquare, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from './ui/table';
import EnhancedImpactForecast from './enhanced-impact-forecast';
import ImpactVisualization from './impact-visualization';
import ComprehensiveImpactForecast from './comprehensive-impact-forecast';

interface ImprovementsTabProps {
  improvements: SuggestResumeImprovementsOutput | null;
  originalResume: string;
  onExport: (format: 'docx' | 'pdf', filename?: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
}

const StatCard = ({ icon, title, before, after, suffix = "" }: { icon: React.ReactNode, title: string, before: number, after: number, suffix?: string }) => {
    const improvement = after - before;
    const isPositive = improvement >= 0;
    const improvementPercentage = before > 0 ? Math.round((improvement / before) * 100) : 0;

    return (
        <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 border-primary/10 bg-gradient-to-br from-card/80 to-card/50 hover:border-primary/30 backdrop-blur-sm overflow-hidden relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-tight">{title}</CardTitle>
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:shadow-md group-hover:scale-105 flex-shrink-0">
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="relative space-y-2 sm:space-y-3">
                <div className="flex items-baseline gap-1 sm:gap-2">
                    <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">{after}{suffix}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">target</div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">Current: {before}{suffix}</span>
                        <span className={`font-semibold flex items-center gap-1 transition-colors duration-300 ${isPositive ? "text-green-600 group-hover:text-green-500" : "text-red-600 group-hover:text-red-500"}`}>
                            <ArrowUpRight className="h-3 w-3" />
                            {isPositive ? '+' : ''}{improvement}{suffix}
                        </span>
                    </div>
                    
                    <div className="w-full bg-muted/50 group-hover:bg-muted/70 rounded-full h-2 group-hover:h-3 overflow-hidden transition-all duration-300">
                        <div 
                            className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${suffix === '%' ? after : Math.min((after / 100) * 100, 100)}%` }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-50" />
                        </div>
                    </div>
                    
                    {improvementPercentage > 0 && (
                        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-800/50 group-hover:from-green-100/90 group-hover:to-emerald-100/90 dark:group-hover:from-green-900/40 dark:group-hover:to-emerald-900/40 transition-all duration-300">
                            <Sparkles className="h-3 w-3 text-green-600 group-hover:text-green-500 transition-colors duration-300" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-300 group-hover:text-green-600 dark:group-hover:text-green-200 transition-colors duration-300">
                                {improvementPercentage}% improvement expected
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const ExportDialog = ({ 
  format, 
  onExport, 
  children 
}: { 
  format: 'docx' | 'pdf', 
  onExport: (format: 'docx' | 'pdf', filename?: string) => void,
  children: React.ReactNode 
}) => {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState(`Resume_Enhanced.${format}`);

  const handleExport = () => {
    // Ensure filename has correct extension
    const cleanFilename = filename.replace(/\.(docx|pdf)$/i, '');
    const finalFilename = `${cleanFilename}.${format}`;
    onExport(format, finalFilename);
    setOpen(false);
  };

  const formatName = format.toUpperCase();
  const isValidFilename = filename.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {format === 'docx' ? <FileText className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            Export as {formatName}
          </DialogTitle>
          <DialogDescription>
            Choose a filename for your enhanced resume. The file will be downloaded to your device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={`Resume_Enhanced.${format}`}
              className={!isValidFilename ? "border-red-500" : ""}
            />
            {!isValidFilename && (
              <p className="text-sm text-red-500">Please enter a valid filename</p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Naming Tips</span>
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• "Resume_John_Doe_Software_Engineer.{format}"</li>
                <li>• "Resume_Company_Position_2024.{format}"</li>
                <li>• "Enhanced_Resume_JobApplication.{format}"</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>File will be saved as: <strong>{filename.replace(/\.(docx|pdf)$/i, '')}.{format}</strong></span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!isValidFilename}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
          >
            {format === 'docx' ? <FileText className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
            Download {formatName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      return <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>Generating...</>;
    }
    if (improvements && hasDataChanged) {
      return <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Improvements</>;
    }
    return 'Generate Improvements';
  }

  if (!improvements || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/20 rounded-xl min-h-[600px] bg-gradient-to-br from-primary/5 to-transparent">
        <div className="mb-6 p-4 rounded-full bg-primary/10 backdrop-blur-sm">
          <Wand2 className="h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {improvements && hasDataChanged ? 'Content Updated - Regenerate Improvements' : 'Transform Your Resume with AI'}
        </h3>
        
        <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
          {improvements && hasDataChanged
            ? 'Your resume or job description has been updated. Regenerate to get fresh, personalized improvements and optimizations.'
            : 'Let our AI transform your resume by quantifying achievements, integrating missing skills, and optimizing for ATS systems to maximize your job prospects.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-2xl">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm">Quantify Impact</h4>
            <p className="text-xs text-muted-foreground">Add metrics to achievements</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm">Integrate Skills</h4>
            <p className="text-xs text-muted-foreground">Weave in missing keywords</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm">ATS Optimize</h4>
            <p className="text-xs text-muted-foreground">Improve system compatibility</p>
          </div>
        </div>
        
        <Button 
          onClick={onGenerate} 
          disabled={isLoading} 
          size="lg" 
          className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>Analyzing and enhancing...</>
          ) : (
            <><Sparkles className="mr-3 h-5 w-5" /> {improvements && hasDataChanged ? 'Regenerate Improvements' : 'Transform My Resume'}</>
          )}
        </Button>
      </div>
    );
  }
  
  const { impactForecast, improvementsSummary, quantifiedAchievements, integratedSkills, improvedResumeText } = improvements;

  return (
    <div className="space-y-6">

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg sm:text-xl">Impact Forecast</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Projected improvements after AI enhancement</CardDescription>
                        </div>
                    </div>
                    
                    <Button onClick={onGenerate} disabled={isLoading} variant="outline" size="sm" className="w-full sm:w-auto shrink-0 hover:bg-primary/5 transition-all duration-300">
                        {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>Regenerating...</>
                        ) : (
                            <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="comprehensive" className="w-full">
                    <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                        <TabsList className="inline-flex sm:grid w-auto sm:w-full grid-cols-4 bg-gradient-to-r from-muted/70 via-muted/50 to-muted/70 backdrop-blur-md border border-primary/10 rounded-xl p-1 shadow-lg gap-1 min-w-full sm:min-w-0">
                            <TabsTrigger 
                                value="comprehensive" 
                                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg font-medium text-[9px] sm:text-sm px-2 py-2 sm:p-2 whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span className="text-center leading-tight">Comprehensive</span>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                            </TabsTrigger>
                            <TabsTrigger 
                                value="enhanced" 
                                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 transition-all duration-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 rounded-lg font-medium text-[9px] sm:text-sm px-2 py-2 sm:p-2 whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-center leading-tight">Enhanced</span>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                            </TabsTrigger>
                            <TabsTrigger 
                                value="detailed" 
                                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 transition-all duration-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg font-medium text-[9px] sm:text-sm px-2 py-2 sm:p-2 whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    <span className="text-center leading-tight">Charts</span>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                            </TabsTrigger>
                            <TabsTrigger 
                                value="simple" 
                                className="relative group data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 transition-all duration-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300 rounded-lg font-medium text-[9px] sm:text-sm px-2 py-2 sm:p-2 whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                                    <Target className="h-3 w-3" />
                                    <span className="text-center leading-tight">Total Impact</span>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="comprehensive" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 rounded-xl -z-10" />
                            <ComprehensiveImpactForecast 
                                atsScore={{
                                    before: impactForecast?.atsScore?.before ?? 0,
                                    after: impactForecast?.atsScore?.after ?? 0,
                                    suffix: "%"
                                }}
                                skillsMatch={{
                                    before: impactForecast?.skillsMatch?.before ?? 0,
                                    after: impactForecast?.skillsMatch?.after ?? 0,
                                    suffix: "%"
                                }}
                                quantifiedAchievements={{
                                    before: impactForecast?.quantifiedAchievements?.before ?? 0,
                                    after: impactForecast?.quantifiedAchievements?.after ?? 0
                                }}
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="enhanced" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 rounded-xl -z-10" />
                            <EnhancedImpactForecast 
                                atsScore={{
                                    before: impactForecast?.atsScore?.before ?? 0,
                                    after: impactForecast?.atsScore?.after ?? 0,
                                    suffix: "%"
                                }}
                                skillsMatch={{
                                    before: impactForecast?.skillsMatch?.before ?? 0,
                                    after: impactForecast?.skillsMatch?.after ?? 0,
                                    suffix: "%"
                                }}
                                quantifiedAchievements={{
                                    before: impactForecast?.quantifiedAchievements?.before ?? 0,
                                    after: impactForecast?.quantifiedAchievements?.after ?? 0
                                }}
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="detailed" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 rounded-xl -z-10" />
                            <ImpactVisualization 
                                atsScore={{
                                    before: impactForecast?.atsScore?.before ?? 0,
                                    after: impactForecast?.atsScore?.after ?? 0,
                                    suffix: "%"
                                }}
                                skillsMatch={{
                                    before: impactForecast?.skillsMatch?.before ?? 0,
                                    after: impactForecast?.skillsMatch?.after ?? 0,
                                    suffix: "%"
                                }}
                                quantifiedAchievements={{
                                    before: impactForecast?.quantifiedAchievements?.before ?? 0,
                                    after: impactForecast?.quantifiedAchievements?.after ?? 0
                                }}
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="simple" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 rounded-xl -z-10" />
                            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                <StatCard 
                                    icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                                    title="ATS Compatibility"
                                    before={impactForecast?.atsScore?.before ?? 0}
                                    after={impactForecast?.atsScore?.after ?? 0}
                                    suffix="%"
                                />
                                 <StatCard 
                                    icon={<Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                                    title="Skills Match"
                                    before={impactForecast?.skillsMatch?.before ?? 0}
                                    after={impactForecast?.skillsMatch?.after ?? 0}
                                    suffix="%"
                                />
                                 <StatCard 
                                    icon={<Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                                    title="Quantified Results"
                                    before={impactForecast?.quantifiedAchievements?.before ?? 0}
                                    after={impactForecast?.quantifiedAchievements?.after ?? 0}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      
      <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Improvement Summary</CardTitle>
              <CardDescription>Overview of all enhancements made to your resume</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-primary">
            <p className="text-sm leading-relaxed text-foreground">
              {improvementsSummary}
            </p>
          </div>
        </CardContent>
      </Card>

       <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Before & After Comparison</CardTitle>
              <CardDescription>See the transformation side by side</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">
                        Original Resume
                    </h3>
                  </div>
                  <ScrollArea className="h-64 sm:h-80 lg:h-96 rounded-lg border border-red-200 dark:border-red-800 p-3 sm:p-4 bg-red-50/30 dark:bg-red-900/10">
                      <p className="text-xs sm:text-sm whitespace-pre-wrap text-foreground leading-relaxed break-words">{originalResume}</p>
                  </ScrollArea>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                    <h3 className="font-semibold text-xs sm:text-sm text-green-700 dark:text-green-400">
                        Enhanced Resume
                    </h3>
                  </div>
                  <ScrollArea className="h-64 sm:h-80 lg:h-96 rounded-lg border border-green-200 dark:border-green-800 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <p className="text-xs sm:text-sm whitespace-pre-wrap text-foreground leading-relaxed break-words">
                      {improvedResumeText}
                      </p>
                  </ScrollArea>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Quantified Achievements</CardTitle>
                        <CardDescription>Vague tasks transformed into measurable impact</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] sm:h-[350px]">
                    <div className="space-y-3 sm:space-y-4">
                        {(quantifiedAchievements ?? []).map((item, index) => (
                            <div key={index} className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-sm transition-all duration-200">
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                        <Badge variant="outline" className="text-xs">{item.section}</Badge>
                                    </div>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400">
                                            <p className="text-muted-foreground line-through break-words">{item.original || 'General duty'}</p>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-1 flex-shrink-0" />
                                            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500 flex-1 min-w-0">
                                                <p className="font-medium text-foreground break-words">{item.improved}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        
        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Integrated Skills</CardTitle>
                        <CardDescription>Missing keywords naturally woven into your content</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[300px] sm:h-[350px]">
                    <div className="space-y-2 sm:space-y-3">
                        {(integratedSkills ?? []).map((item, index) => (
                            <div key={index} className="p-3 sm:p-4 rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-sm transition-all duration-200">
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                            {item.skill}
                                        </Badge>
                                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                    </div>
                                    <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                                        <p className="text-xs sm:text-sm text-foreground italic break-words">
                                            "...{item.integrationPoint}..."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </ScrollArea>
            </CardContent>
        </Card>
      </div>


      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Export Enhanced Resume</CardTitle>
              <CardDescription>
                Download your AI-improved resume ready for job applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-200">Resume Ready!</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your resume has been optimized with quantified achievements, integrated skills, and ATS improvements.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <ExportDialog format="docx" onExport={onExport}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                <FileText className="mr-2 h-4 w-4" />
                Export as DOCX
              </Button>
            </ExportDialog>
            
            <ExportDialog format="pdf" onExport={onExport}>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto hover:bg-primary/5 border-primary/20 text-sm sm:text-base"
              >
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </ExportDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
