import type {GenerateResumeQAOutput} from '@/ai/flows/generate-resume-qa';
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

interface QATabProps {
  qa: GenerateResumeQAOutput | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function QATab({qa, onGenerate, isLoading}: QATabProps) {
  if (!qa) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <p className="text-muted-foreground mb-4">
          Generate questions and answers based on your resume.
        </p>
        <Button onClick={onGenerate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Q&A
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Q&A</CardTitle>
        <CardDescription>
          AI-generated questions and answers based on your resume.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {qa.qaPairs.map((pair, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">
                {pair.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                  {pair.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
