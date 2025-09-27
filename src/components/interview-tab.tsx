'use client';

import { useState } from 'react';
import type { GenerateInterviewQuestionsOutput, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import type { InterviewType, DifficultyLevel } from '@/app/interview/page';
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
import { Button } from './ui/button';
import { Loader2, Sparkles, MessageCircleQuestion, BotMessageSquare, Badge } from 'lucide-react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Slider } from './ui/slider';

interface InterviewTabProps {
  interview: GenerateInterviewQuestionsOutput | null;
  onGenerate: (config: Omit<GenerateInterviewQuestionsInput, 'resumeText' | 'jobDescription'>) => void;
  isLoading: boolean;
}

const interviewTypes: { id: InterviewType, title: string, description: string }[] = [
    { id: 'Technical', title: 'Technical', description: 'System design, coding, architecture' },
    { id: 'Behavioral', title: 'Behavioral', description: 'STAR method, soft skills' },
    { id: 'Leadership', title: 'Leadership', description: 'Management, strategy, vision' },
    { id: 'General', title: 'General', description: 'Mixed question types' },
];

const difficultyLevels: { id: DifficultyLevel, title: string, description: string }[] = [
    { id: 'Entry', title: 'Entry Level', description: '0-2 years experience' },
    { id: 'Mid', title: 'Mid Level', description: '3-7 years experience' },
    { id: 'Senior', title: 'Senior Level', description: '8-15 years experience' },
    { id: 'Executive', title: 'Executive', description: '15+ years experience' },
];

function ConfigurationPanel({ onGenerate, isLoading }: Pick<InterviewTabProps, 'onGenerate' | 'isLoading'>) {
  const [interviewType, setInterviewType] = useState<InterviewType>('General');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('Mid');
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleGenerateClick = () => {
    onGenerate({ interviewType, difficultyLevel, numQuestions });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
      <h3 className="text-lg font-semibold mb-2">Setup Your Mock Interview</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Choose the interview type, difficulty level, and number of questions to get a personalized practice session.
      </p>

      <div className="w-full max-w-2xl space-y-8 mb-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="font-semibold mb-3 block">Interview Type</Label>
            <RadioGroup value={interviewType} onValueChange={(val) => setInterviewType(val as InterviewType)}>
              {interviewTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                  <Label htmlFor={`type-${type.id}`} className="font-normal">{type.title}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="font-semibold mb-3 block">Difficulty Level</Label>
            <RadioGroup value={difficultyLevel} onValueChange={(val) => setDifficultyLevel(val as DifficultyLevel)}>
              {difficultyLevels.map(level => (
                 <div key={level.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.id} id={`level-${level.id}`} />
                  <Label htmlFor={`level-${level.id}`} className="font-normal">{level.title}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label htmlFor="numQuestions" className="font-semibold mb-4 block text-center">Number of Questions: <span className="text-primary font-bold">{numQuestions}</span></Label>
          <Slider
            id="numQuestions"
            min={3}
            max={15}
            step={1}
            value={[numQuestions]}
            onValueChange={(val) => setNumQuestions(val[0])}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button onClick={handleGenerateClick} disabled={isLoading} size="lg">
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Questions...</>
        ) : (
          <><Sparkles className="mr-2 h-4 w-4" /> Generate Interview Prep</>
        )}
      </Button>
    </div>
  );
}


export default function InterviewTab({
  interview,
  onGenerate,
  isLoading,
}: InterviewTabProps) {

  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Generating Your Interview Prep...</p>
            <p className="text-muted-foreground">Please wait while we tailor your questions.</p>
        </div>
      )
  }

  if (!interview) {
    return <ConfigurationPanel onGenerate={onGenerate} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generated Interview Questions</CardTitle>
          <CardDescription>
            Here are your personalized questions. You can start a new session below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {interview.questionsAndAnswers.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left font-semibold text-base hover:no-underline">
                  <div className="flex items-start gap-3">
                    <MessageCircleQuestion className="h-5 w-5 mt-1 shrink-0 text-primary" />
                    <span>{item.question}</span>
                    {item.category && <Badge variant="secondary" className="ml-auto shrink-0">{item.category}</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-4 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><BotMessageSquare className='h-4 w-4 text-muted-foreground'/> Suggested Answer</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                      {item.answer}
                    </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Start a New Session</CardTitle>
          <CardDescription>
            Generate a new set of questions with different settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ConfigurationPanel onGenerate={onGenerate} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
