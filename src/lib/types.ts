import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import type {GenerateInterviewQuestionsOutput} from '@/ai/flows/generate-interview-questions';
import type {GenerateResumeQAOutput} from '@/ai/flows/generate-resume-qa';
import type {SuggestResumeImprovementsOutput} from '@/ai/flows/suggest-resume-improvements';

export type AnalysisResult = {
  analysis: AnalyzeResumeContentOutput | null;
  qa: GenerateResumeQAOutput | null;
  interview: GenerateInterviewQuestionsOutput | null;
  improvements: SuggestResumeImprovementsOutput | null;
};
