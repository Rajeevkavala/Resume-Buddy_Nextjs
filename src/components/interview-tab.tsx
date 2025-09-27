'use client';

import { useState } from 'react';
import type { GenerateInterviewQuestionsOutput, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import type { InterviewType, DifficultyLevel } from '@/app/interview/page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Loader2, Sparkles, Check, X, RefreshCw } from 'lucide-react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

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

function ConfigurationPanel({ onGenerate, isLoading, isRegenerating = false }: Pick<InterviewTabProps, 'onGenerate' | 'isLoading'> & { isRegenerating?: boolean }) {
  const [interviewType, setInterviewType] = useState<InterviewType>('General');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('Mid');
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleGenerateClick = () => {
    onGenerate({ interviewType, difficultyLevel, numQuestions });
  };

  const buttonText = isRegenerating ? 'Regenerate Quiz' : 'Generate Interview Quiz';
  const buttonIcon = isRegenerating ? <RefreshCw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />;

  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg", isRegenerating ? "min-h-0" : "min-h-[400px]")}>
      {!isRegenerating && (
        <>
          <h3 className="text-lg font-semibold mb-2">Setup Your Interview Quiz</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Choose the interview type, difficulty level, and number of questions to get a personalized quiz.
          </p>
        </>
      )}

      <div className="w-full max-w-2xl space-y-8 mb-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="font-semibold mb-3 block">Interview Type</Label>
            <RadioGroup value={interviewType} onValueChange={(val) => setInterviewType(val as InterviewType)} disabled={isLoading}>
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
            <RadioGroup value={difficultyLevel} onValueChange={(val) => setDifficultyLevel(val as DifficultyLevel)} disabled={isLoading}>
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
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <>{buttonIcon} {buttonText}</>
        )}
      </Button>
    </div>
  );
}

function QuizView({ quiz, onRestart }: { quiz: GenerateInterviewQuestionsOutput, onRestart: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    setShowResults(false);
  }

  if (showResults) {
    const score = selectedAnswers.reduce((acc, answer, index) => {
        return answer === quiz.questions[index].correctAnswerIndex ? acc + 1 : acc;
    }, 0);
    const scorePercentage = Math.round((score / quiz.questions.length) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Quiz Completed!</CardTitle>
                <CardDescription className="text-center">You scored {score} out of {quiz.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="text-5xl font-bold text-primary">{scorePercentage}%</div>
                <Progress value={scorePercentage} className="w-full max-w-sm" />
                 <div className="flex gap-4 mt-4">
                    <Button onClick={handleRetake}>Retake Quiz</Button>
                    <Button onClick={onRestart} variant="outline">Start New Quiz</Button>
                </div>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardTitle>
          <div className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">{currentQuestion.category}</div>
        </div>
        <CardDescription className="pt-4 text-base text-foreground">{currentQuestion.question}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = currentQuestion.correctAnswerIndex === index;
            const showAsCorrect = selectedAnswer !== null && isCorrect;
            const showAsIncorrect = selectedAnswer !== null && isSelected && !isCorrect;

            return (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                  "hover:bg-muted/50",
                  selectedAnswer === null ? "border-input" : "cursor-default",
                  showAsCorrect && "bg-green-100 dark:bg-green-900/50 border-green-500",
                  showAsIncorrect && "bg-red-100 dark:bg-red-900/50 border-red-500",
                )}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-sm">
                    {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-grow">{option}</div>
                 {showAsCorrect && <Check className="h-5 w-5 text-green-600" />}
                 {showAsIncorrect && <X className="h-5 w-5 text-red-600" />}
              </div>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-lg">Explanation</h4>
            <p className="text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
            <Button onClick={handleNext} disabled={selectedAnswer === null}>
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function InterviewTab({
  interview,
  onGenerate,
  isLoading,
}: InterviewTabProps) {

  const handleRestart = () => {
    // This is a bit of a hack to force a re-render of the configuration panel
    // A better solution would involve lifting state up, but this is simpler for now.
    // By calling onGenerate with a dummy config, we reset the parent page's 'interview' state to null.
    onGenerate({ interviewType: 'General', difficultyLevel: 'Mid', numQuestions: -1 });
  };


  if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Generating Your Interview Quiz...</p>
            <p className="text-muted-foreground">Please wait while we tailor your questions.</p>
        </div>
      )
  }

  if (!interview || !interview.questions || interview.questions.length === 0) {
    return <ConfigurationPanel onGenerate={onGenerate} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-6">
      <QuizView quiz={interview} onRestart={handleRestart} />
       <Card>
        <CardHeader>
          <CardTitle>Start a New Quiz</CardTitle>
          <CardDescription>
            Generate a new set of questions with different settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ConfigurationPanel onGenerate={onGenerate} isLoading={isLoading} isRegenerating={true} />
        </CardContent>
      </Card>
    </div>
  );
}
