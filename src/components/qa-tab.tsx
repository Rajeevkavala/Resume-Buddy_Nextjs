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
import {Loader2, FileQuestion, MessageSquareQuote, CheckSquare, Tags } from 'lucide-react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface QATabProps {
  qa: Record<QATopic, GenerateResumeQAOutput | null> | null;
  onGenerate: (topic: QATopic, numQuestions: number) => void;
  isLoading: boolean;
  hasDataChanged?: boolean;
  selectedTopic: QATopic;
  setSelectedTopic: (topic: QATopic) => void;
}

const topics: { id: QATopic, title: string, description: string }[] = [
    { id: 'General', title: 'General', description: 'Career progression and professional overview' },
    { id: 'Technical', title: 'Technical', description: 'Technology expertise and implementation' },
    { id: 'Work Experience', title: 'Work Experience', description: 'Detailed role and project discussions' },
    { id: 'Projects', title: 'Projects', description: 'Specific project deep-dives and outcomes' },
    { id: 'Career Goals', title: 'Career Goals', description: 'Future aspirations and motivation' },
    { id: 'Education', title: 'Education', description: 'Academic achievements and learning' },
];

export default function QATab({qa, onGenerate, isLoading, hasDataChanged, selectedTopic, setSelectedTopic}: QATabProps) {
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleGenerateClick = (topic: QATopic) => {
    onGenerate(topic, numQuestions);
  }

  const noDataGenerated = !qa || Object.values(qa).every(val => val === null);

  if (noDataGenerated || hasDataChanged) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
        <h3 className="text-lg font-semibold mb-2">Select a Topic and Generate Q&A</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {hasDataChanged
            ? 'Your resume or job description has changed. Please select a topic and regenerate to get updated Q&A pairs.'
            : 'Choose a focus area to generate tailored questions and answers based on your resume.'}
        </p>

        <div className="w-full max-w-2xl space-y-8 mb-8 text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border p-4">
                {topics.map(topic => (
                    <Button
                        key={topic.id}
                        variant={selectedTopic === topic.id ? 'default' : 'outline'}
                        onClick={() => setSelectedTopic(topic.id)}
                        className="flex-grow sm:flex-grow-0"
                    >
                        {topic.title}
                    </Button>
                ))}
            </div>
            <div className="px-4">
              <Label htmlFor="numQuestions" className="font-semibold mb-4 block text-center">Number of Questions: <span className="text-primary font-bold">{numQuestions}</span></Label>
              <Slider
                id="numQuestions"
                min={3}
                max={10}
                step={1}
                value={[numQuestions]}
                onValueChange={(val) => setNumQuestions(val[0])}
                disabled={isLoading}
              />
            </div>
        </div>
        
        <Button onClick={() => handleGenerateClick(selectedTopic)} disabled={isLoading} size="lg">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating for '{selectedTopic}'...</>
          ) : (
             <><FileQuestion className="mr-2 h-4 w-4" /> Generate Q&A for '{selectedTopic}'</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Q&A Topic Selection</CardTitle>
          <CardDescription>Select a topic to view or generate questions, and adjust the number of questions you want.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {topics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopic === topic.id ? 'default' : 'outline'}
                onClick={() => setSelectedTopic(topic.id)}
              >
                {topic.title}
              </Button>
            ))}
          </div>
           <div className="px-4">
              <Label htmlFor="numQuestions" className="font-semibold mb-4 block text-center">Number of Questions: <span className="text-primary font-bold">{numQuestions}</span></Label>
              <Slider
                id="numQuestions"
                min={3}
                max={10}
                step={1}
                value={[numQuestions]}
                onValueChange={(val) => setNumQuestions(val[0])}
                disabled={isLoading}
              />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Questions for: {selectedTopic}</CardTitle>
          <CardDescription>
            {topics.find(t => t.id === selectedTopic)?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && qa?.[selectedTopic] === null ? (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating questions for '{selectedTopic}'...</p>
            </div>
          ) : qa?.[selectedTopic] ? (
            <Accordion type="single" collapsible className="w-full">
              {qa[selectedTopic]!.qaPairs.map((pair, index) => (
                <AccordionItem value={`item-${selectedTopic}-${index}`} key={index}>
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
              <div className="mt-6 flex justify-center">
                  <Button onClick={() => handleGenerateClick(selectedTopic)} disabled={isLoading}>
                      {isLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                      ) : (
                          <>Regenerate for '{selectedTopic}'</>
                      )}
                  </Button>
              </div>
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No questions generated for this topic yet.</p>
              <Button onClick={() => handleGenerateClick(selectedTopic)} disabled={isLoading}>
                {isLoading ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 
                  <>Generate Q&A for {selectedTopic}</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
