import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import type {GenerateInterviewQuestionsOutput} from '@/ai/flows/generate-interview-questions';
import type {GenerateResumeQAOutput} from '@/ai/flows/generate-resume-qa';
import type {SuggestResumeImprovementsOutput} from '@/ai/flows/suggest-resume-improvements';

export type QATopic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

export type AnalysisResult = {
  resumeText?: string;
  jobDescription?: string;
  analysis?: AnalyzeResumeContentOutput | null;
  qa?: Record<QATopic, GenerateResumeQAOutput | null> | null;
  interview?: GenerateInterviewQuestionsOutput | null;
  improvements?: SuggestResumeImprovementsOutput | null;
  updatedAt?: string;
};
