import type { GenerateResumeQAOutput } from '@/ai/flows/generate-resume-qa';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface QATabProps {
  qa: GenerateResumeQAOutput;
}

export default function QATab({ qa }: QATabProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Resume Q&A</CardTitle>
            <CardDescription>AI-generated questions and answers based on your resume.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
            {qa.qaPairs.map((pair, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left">{pair.question}</AccordionTrigger>
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
