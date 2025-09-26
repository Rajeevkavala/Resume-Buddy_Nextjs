import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface InterviewTabProps {
  interview: GenerateInterviewQuestionsOutput;
}

export default function InterviewTab({ interview }: InterviewTabProps) {
  return (
     <Card>
        <CardHeader>
            <CardTitle>Interview Prep</CardTitle>
            <CardDescription>AI-generated practice questions and answers for your interview.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
            {interview.questionsAndAnswers.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
                    <h4 className="font-semibold text-foreground">Suggested Answer:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.answer}</p>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}
