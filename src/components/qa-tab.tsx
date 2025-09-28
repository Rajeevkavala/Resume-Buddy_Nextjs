'use client';

import { useState } from 'react';
import type { GenerateResumeQAOutput, QATopic } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {Button} from './ui/button';
import {FileQuestion, MessageSquareQuote, CheckSquare, Tags, Briefcase, Code, Award, Target, GraduationCap, User, RefreshCw, Sparkles } from 'lucide-react';

import { Label } from './ui/label';
import { Slider } from './ui/slider';

// Helper function to safely validate QA pair structure
const validateQAPair = (pair: any) => {
  return {
    question: pair?.question || "Question not available",
    answer: pair?.answer || "Answer not available",
    relatedSections: Array.isArray(pair?.relatedSections) ? pair.relatedSections : [],
    keyPoints: Array.isArray(pair?.keyPoints) ? pair.keyPoints : []
  };
};

interface QATabProps {
  qa: Record<QATopic, GenerateResumeQAOutput | null> | null;
  onGenerate: (topic: QATopic, numQuestions: number) => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
  selectedTopic: QATopic;
  setSelectedTopic: (topic: QATopic) => void;
}

const topics: { id: QATopic, title: string, description: string, icon: any, color: string }[] = [
    { id: 'General', title: 'General', description: 'Career progression and professional overview', icon: User, color: 'from-blue-500 to-indigo-600' },
    { id: 'Technical', title: 'Technical', description: 'Technology expertise and implementation', icon: Code, color: 'from-green-500 to-emerald-600' },
    { id: 'Work Experience', title: 'Work Experience', description: 'Detailed role and project discussions', icon: Briefcase, color: 'from-purple-500 to-violet-600' },
    { id: 'Projects', title: 'Projects', description: 'Specific project deep-dives and outcomes', icon: Target, color: 'from-orange-500 to-red-600' },
    { id: 'Career Goals', title: 'Career Goals', description: 'Future aspirations and motivation', icon: Award, color: 'from-pink-500 to-rose-600' },
    { id: 'Education', title: 'Education', description: 'Academic achievements and learning', icon: GraduationCap, color: 'from-teal-500 to-cyan-600' },
];

export default function QATab({qa, onGenerate, isLoading, hasDataChanged, selectedTopic, setSelectedTopic}: QATabProps) {
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleGenerateClick = (topic: QATopic) => {
    onGenerate(topic, numQuestions);
  }

  const noDataGenerated = !qa || Object.values(qa).every(val => val === null);

  if (noDataGenerated || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/20 rounded-xl min-h-[600px] bg-gradient-to-br from-primary/5 to-transparent">
        <div className="mb-6 p-4 rounded-full bg-primary/10 backdrop-blur-sm">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {hasDataChanged ? 'Content Updated - Regenerate Q&A' : 'AI-Powered Interview Preparation'}
        </h3>
        
        <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
          {hasDataChanged
            ? 'Your resume or job description has been updated. Select a topic below and regenerate to get fresh, relevant Q&A pairs.'
            : 'Choose a focus area below to generate tailored interview questions and expertly crafted answers based on your resume content.'}
        </p>

        <div className="w-full max-w-4xl space-y-8 mb-8">
            {/* Topic Selection Cards */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-center">Choose Your Focus Area</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(topic => {
                  const IconComponent = topic.icon;
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <Card 
                      key={topic.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md transform scale-[1.02]' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${topic.color} flex items-center justify-center mb-3`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h5 className="font-semibold text-sm">{topic.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{topic.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Question Count Slider */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="text-center">
                  <Label htmlFor="numQuestions" className="text-lg font-semibold">
                    Number of Questions: <span className="text-primary font-bold text-xl">{numQuestions}</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Adjust the number of interview questions to generate</p>
                </div>
                <div className="px-4">
                  <Slider
                    id="numQuestions"
                    min={3}
                    max={10}
                    step={1}
                    value={[numQuestions]}
                    onValueChange={(val) => setNumQuestions(val[0])}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                    <span>3 - Quick Prep</span>
                    <span>6 - Balanced</span>
                    <span>10 - Comprehensive</span>
                  </div>
                </div>
              </div>
            </Card>
        </div>
        
        <Button 
          onClick={() => handleGenerateClick(selectedTopic)} 
          disabled={isLoading} 
          size="lg" 
          className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-3"></div>Generating {numQuestions} questions for '{selectedTopic}'...</>
          ) : (
             <><FileQuestion className="mr-3 h-5 w-5" /> Generate {numQuestions} Q&A pairs for '{selectedTopic}'</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Q&A Preparation</h2>
          <p className="text-muted-foreground">AI-generated questions and answers tailored to your resume</p>
        </div>
      </div> */}

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Topic Selection & Settings</CardTitle>
              <CardDescription>Choose your focus area and customize the number of questions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topics.map((topic) => {
              const IconComponent = topic.icon;
              const isSelected = selectedTopic === topic.id;
              return (
                <Button
                  key={topic.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`flex flex-col items-center gap-2 h-auto py-3 px-2 transition-all duration-300 ${
                    isSelected 
                      ? 'shadow-md transform scale-[1.02] bg-primary text-primary-foreground' 
                      : 'hover:shadow-sm hover:border-primary/50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs font-medium">{topic.title}</span>
                </Button>
              );
            })}
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <Label htmlFor="numQuestions" className="text-sm font-semibold">
                  Generate <span className="text-primary font-bold text-lg">{numQuestions}</span> questions
                </Label>
                <Slider
                  id="numQuestions"
                  min={3}
                  max={10}
                  step={1}
                  value={[numQuestions]}
                  onValueChange={(val) => setNumQuestions(val[0])}
                  disabled={isLoading}
                  className="w-full max-w-xs mx-auto"
                />
                <div className="flex justify-between text-xs text-muted-foreground max-w-xs mx-auto">
                  <span>Quick (3)</span>
                  <span>Balanced (6)</span>
                  <span>Deep (10)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${topics.find(t => t.id === selectedTopic)?.color || 'from-primary/20 to-primary/10'}`}>
                {(() => {
                  const IconComponent = topics.find(t => t.id === selectedTopic)?.icon || FileQuestion;
                  return <IconComponent className="h-5 w-5 text-white" />;
                })()}
              </div>
              <div>
                <CardTitle className="text-xl">Interview Questions: {selectedTopic}</CardTitle>
                <CardDescription className="text-sm">
                  {topics.find(t => t.id === selectedTopic)?.description}
                </CardDescription>
              </div>
            </div>
            {qa?.[selectedTopic] && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {qa[selectedTopic]!.qaPairs.length} questions
                </span>
                <Button 
                  onClick={() => handleGenerateClick(selectedTopic)} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/5"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>Regenerating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && qa?.[selectedTopic] === null ? (
            <div className="flex flex-col items-center justify-center text-center p-12 min-h-[300px] bg-gradient-to-br from-primary/5 to-transparent rounded-lg border-2 border-dashed border-primary/20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="mt-6 space-y-2">
                  <p className="font-medium">Generating {numQuestions} personalized questions</p>
                  <p className="text-sm text-muted-foreground">Tailored for '{selectedTopic}' based on your resume</p>
                </div>
            </div>
          ) : qa?.[selectedTopic] && qa[selectedTopic]?.qaPairs && Array.isArray(qa[selectedTopic]?.qaPairs) ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {qa[selectedTopic]!.qaPairs.map((pairData: any, index: number) => {
                const pair = validateQAPair(pairData);
                return (
                <AccordionItem 
                  value={`item-${selectedTopic}-${index}`} 
                  key={index}
                  className="border rounded-lg bg-card/50 hover:bg-card/80 transition-colors duration-300"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline px-6 py-4">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                        <span className="text-sm font-bold text-primary">Q{index + 1}</span>
                      </div>
                      <span className="flex-1 pr-4">{pair.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 space-y-6">
                    <div className="ml-12">
                      <div className='space-y-4'>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <MessageSquareQuote className='h-4 w-4 text-green-600'/> 
                            Your Tailored Answer
                          </h4>
                          <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {pair.answer}
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-semibold flex items-center gap-2 mb-3">
                              <Tags className='h-4 w-4 text-blue-600'/> 
                              Related Resume Sections
                            </h4>
                            <ul className="space-y-2">
                              {pair.relatedSections.length > 0 ? pair.relatedSections.map((section: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  {section}
                                </li>
                              )) : (
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                                  No related sections available
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                            <h4 className="font-semibold flex items-center gap-2 mb-3">
                              <CheckSquare className='h-4 w-4 text-purple-600'/> 
                              Key Points to Emphasize
                            </h4>
                            <ul className="space-y-2">
                              {pair.keyPoints.length > 0 ? pair.keyPoints.map((point: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                  {point}
                                </li>
                              )) : (
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                                  No key points available
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 min-h-[300px] bg-gradient-to-br from-muted/30 to-transparent rounded-lg border-2 border-dashed">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <FileQuestion className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No questions generated yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Generate personalized interview questions for {selectedTopic} based on your resume content.
              </p>
              <Button 
                onClick={() => handleGenerateClick(selectedTopic)} 
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isLoading ? 
                  <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>Generating {numQuestions} questions...</> : 
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate {numQuestions} Questions</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
