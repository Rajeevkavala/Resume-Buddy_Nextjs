
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
import {Loader2, RefreshCw} from 'lucide-react';

interface InterviewTabProps {
  interview: GenerateInterviewQuestionsOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
}

export default function InterviewTab({
  interview,
  onGenerate,
  isLoading,
  hasDataChanged,
}: InterviewTabProps) {
  
  const getButtonContent = () => {
    if (isLoading) {
      return <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>;
    }
    if (interview && hasDataChanged) {
      return <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Questions</>;
    }
    return 'Generate Interview Questions';
  }

  if (!interview || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          {interview && hasDataChanged
            ? 'Your resume or job description has changed.'
            : 'Generate interview questions and answers tailored to the role.'}
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {getButtonContent()}
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Regenerate Questions</CardTitle>
            <CardDescription>
                Click the button below to regenerate the questions with the same resume and job description.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={onGenerate} disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate Questions</>
                )}
            </Button>
        </CardContent>
      </Card>
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
    </div>
  );
}
