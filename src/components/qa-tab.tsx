
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
import {Loader2, FileQuestion, MessageSquareQuote, CheckSquare, Tags } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type Topic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

interface QATabProps {
  qa: GenerateResumeQAOutput | null;
  onGenerate: (topic: Topic) => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
  selectedTopic: Topic;
  setSelectedTopic: (topic: Topic) => void;
}

const topics: { id: Topic, title: string, description: string }[] = [
    { id: 'General', title: 'General Resume Questions', description: 'Career progression and professional overview' },
    { id: 'Technical', title: 'Technical Skills', description: 'Technology expertise and implementation' },
    { id: 'Work Experience', title: 'Work Experience', description: 'Detailed role and project discussions' },
    { id: 'Projects', title: 'Project Experience', description: 'Specific project deep-dives and outcomes' },
    { id: 'Career Goals', title: 'Career Goals', description: 'Future aspirations and motivation' },
    { id: 'Education', title: 'Education Background', description: 'Academic achievements and learning' },
];

export default function QATab({qa, onGenerate, isLoading, hasDataChanged, selectedTopic, setSelectedTopic}: QATabProps) {
  
  const handleGenerateClick = () => {
    onGenerate(selectedTopic);
  }
  
  if (!qa || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <h3 className="text-lg font-semibold mb-2">Select a Topic and Generate Q&A</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {hasDataChanged
            ? 'Your resume or job description has changed. Please select a topic and regenerate to get updated Q&A pairs.'
            : 'Choose a focus area to generate tailored questions and answers based on your resume.'}
        </p>

        <Card className="w-full max-w-lg text-left mb-6">
            <CardContent className="p-6">
                <RadioGroup value={selectedTopic} onValueChange={(value) => setSelectedTopic(value as Topic)}>
                    {topics.map(topic => (
                        <Label key={topic.id} className="flex items-start gap-4 rounded-md p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                             <RadioGroupItem value={topic.id} id={topic.id} className="mt-1" />
                             <div className="grid gap-1.5">
                                <span className="font-semibold">{topic.title}</span>
                                <span className="text-sm text-muted-foreground">{topic.description}</span>
                             </div>
                        </Label>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
        
        <Button onClick={handleGenerateClick} disabled={isLoading} size="lg">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
             <><FileQuestion className="mr-2 h-4 w-4" /> Generate Q&A</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Generate New Q&A</CardTitle>
            <CardDescription>
                Select a new topic to generate a different set of questions, or regenerate for the current topic.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <RadioGroup value={selectedTopic} onValueChange={(value) => setSelectedTopic(value as Topic)}>
                        {topics.map(topic => (
                            <Label key={topic.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                <RadioGroupItem value={topic.id} id={`regenerate-${topic.id}`} />
                                <span className="font-medium text-sm">{topic.title}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                <div className="flex items-center justify-center">
                    <Button onClick={handleGenerateClick} disabled={isLoading} size="lg">
                         {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                         ) : (
                             <><FileQuestion className="mr-2 h-4 w-4" /> Generate Q&A for '{selectedTopic}'</>
                         )}
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Interview Prep for "{selectedTopic}"</CardTitle>
          <CardDescription>
            Here are your AI-generated practice questions and tailored answers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {qa.qaPairs.map((pair, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  <div className="flex items-start gap-3">
                     <FileQuestion className="h-5 w-5 mt-1 shrink-0 text-primary" />
                    <span>{pair.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 space-y-6">
                    <div className='space-y-2'>
                        <h4 className="font-semibold flex items-center gap-2"><MessageSquareQuote className='h-4 w-4 text-muted-foreground'/> Your Tailored Answer</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                            {pair.answer}
                        </p>
                    </div>
                     <div className='space-y-2'>
                        <h4 className="font-semibold flex items-center gap-2"><Tags className='h-4 w-4 text-muted-foreground'/> Related Resume Sections</h4>
                        <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                           {pair.relatedSections.map((section, i) => <li key={i}>{section}</li>)}
                        </ul>
                    </div>
                     <div className='space-y-2'>
                        <h4 className="font-semibold flex items-center gap-2"><CheckSquare className='h-4 w-4 text-muted-foreground'/> Key Points to Emphasize</h4>
                        <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                           {pair.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
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
