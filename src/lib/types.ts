import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import type {GenerateInterviewQuestionsOutput} from '@/ai/flows/generate-interview-questions';
import type {GenerateResumeQAOutput} from '@/ai/flows/generate-resume-qa';
import type {SuggestResumeImprovementsOutput} from '@/ai/flows/suggest-resume-improvements';

// Re-export AI flow types for easier imports
export type { AnalyzeResumeContentOutput, GenerateInterviewQuestionsOutput, GenerateResumeQAOutput, SuggestResumeImprovementsOutput };

export type QATopic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

export type JobRole = 
  | "Frontend Developer"
  | "Backend Developer" 
  | "Full Stack Developer"
  | "DevOps Engineer"
  | "Data Scientist"
  | "Mobile Developer"
  | "UI/UX Designer"
  | "Product Manager"
  | "QA Engineer"
  | "Software Engineer"
  | "Other";

export type AnalysisResult = {
  resumeText?: string;
  jobDescription?: string;
  jobRole?: JobRole;
  jobUrl?: string;
  analysis?: AnalyzeResumeContentOutput | null;
  qa?: Record<QATopic, GenerateResumeQAOutput | null> | null;
  interview?: GenerateInterviewQuestionsOutput | null;
  improvements?: SuggestResumeImprovementsOutput | null;
  updatedAt?: string;
};
