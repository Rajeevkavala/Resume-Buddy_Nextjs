import type {GenerateInterviewQuestionsOutput} from '@/ai/flows/generate-interview-questions';
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
import {Loader2} from 'lucide-react';

interface InterviewTabProps {
  interview: GenerateInterviewQuestionsOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function InterviewTab({
  interview,
  onGenerate,
  isLoading,
}: InterviewTabProps) {
  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          Generate interview questions and answers tailored to the role.
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Interview Questions
        </Button>
      </div>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Prep</CardTitle>
        <CardDescription>
          AI-generated practice questions and answers for your interview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {interview.questionsAndAnswers.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Suggested Answer:
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
