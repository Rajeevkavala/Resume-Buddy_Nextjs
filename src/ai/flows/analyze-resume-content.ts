'use server';

/**
 * @fileOverview Analyzes resume content against a job description to provide an ATS score,
 * identify skill gaps, and determine content coverage.
 *
 * - analyzeResumeContent - A function that analyzes resume content.
 * - AnalyzeResumeContentInput - The input type for the analyzeResumeContent function.
 * - AnalyzeResumeContentOutput - The return type for the analyzeResumeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeContentInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume extracted from the uploaded file.'),
  jobDescription: z
    .string()
    .describe('The job description for the role the user is applying for.'),
});
export type AnalyzeResumeContentInput = z.infer<typeof AnalyzeResumeContentInputSchema>;

const AnalyzeResumeContentOutputSchema = z.object({
  atsScore: z
    .number()
    .min(0).max(100)
    .describe(
      'A score from 0 to 100 representing how well the resume is optimized for Applicant Tracking Systems (ATS).'
    ),
  skillGaps: z
    .array(z.string())
    .describe(
      'A list of important skills mentioned in the job description that are missing from the resume.'
    ),
  contentCoveragePercentage: z
    .number()
    .min(0).max(100)
    .describe(
      'The percentage (0-100) of required skills and qualifications from the job description that are covered in the resume.'
    ),
  summary: z
    .string()
    .describe('A concise, professional summary (3-4 sentences) of the resume\'s strengths and weaknesses in relation to this specific job.'),
  keywordAnalysis: z
    .object({
      presentKeywords: z.array(z.string()).describe('Keywords from the job description found in the resume.'),
      missingKeywords: z.array(z.string()).describe('Keywords from the job description missing from the resume.'),
    })
    .describe('Analysis of keywords from the job description.'),
  actionVerbFeedback: z
    .string()
    .describe('Feedback on the usage of action verbs in the resume. This should be a paragraph that assesses the strength and variety of verbs used. If weak verbs are present (e.g., "Responsible for," "Helped with"), suggest stronger alternatives (e.g., "Managed," "Orchestrated," "Accelerated").'),
  quantifiableResultsFeedback: z
    .string()
    .describe('Feedback on the use of quantifiable results to demonstrate impact. This should be a paragraph explaining the importance of quantifying achievements. Provide 2-3 specific examples from the resume and show how they could be improved by adding metrics (e.g., "Increased sales" could become "Increased quarterly sales by 15% through strategic outreach campaigns").'),
});
export type AnalyzeResumeContentOutput = z.infer<typeof AnalyzeResumeContentOutputSchema>;

export async function analyzeResumeContent(
  input: AnalyzeResumeContentInput
): Promise<AnalyzeResumeContentOutput> {
  return analyzeResumeContentFlow(input);
}

const analyzeResumeContentPrompt = ai.definePrompt({
  name: 'analyzeResumeContentPrompt',
  input: {schema: AnalyzeResumeContentInputSchema},
  output: {schema: AnalyzeResumeContentOutputSchema},
  prompt: `You are an expert career coach and resume analyst. Your task is to provide a detailed, professional, and actionable analysis of the provided resume against the given job description.

Resume Text:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Analyze the resume on the following criteria and provide the output in a valid JSON format that adheres to the schema. The analysis must be critical and of high quality.

1.  **ATS Score (0-100)**: Evaluate the resume's compatibility with Applicant Tracking Systems. Consider keyword density, formatting, and standard section headings. A higher score means better optimization. This should be a numerical value between 0 and 100.
2.  **Content Coverage Percentage (0-100)**: Calculate the percentage of skills, qualifications, and requirements from the job description that are addressed in the resume. This should be a numerical value between 0 and 100.
3.  **Summary**: Write a concise, professional summary (3-4 sentences) of the resume's strengths and weaknesses in relation to this specific job.
4.  **Keyword and Skill Analysis**:
    *   Identify crucial keywords and skills from the job description.
    *   List the keywords that are present in the resume.
    *   List the important keywords and skills that are missing from the resume. This list will be used for both `skillGaps` and `missingKeywords`.
5.  **Action Verb Feedback**: Analyze the use of action verbs. The feedback should be a paragraph that assesses the strength and variety of verbs used. If weak verbs are present (e.g., "Responsible for," "Helped with"), suggest stronger alternatives (e.g., "Managed," "Orchestrated," "Accelerated").
6.  **Quantifiable Results Feedback**: Analyze how well the resume uses numbers and data to show impact. The feedback should be a paragraph explaining the importance of quantifying achievements. Provide 2-3 specific examples from the resume and show how they could be improved by adding metrics (e.g., "Increased sales" could become "Increased quarterly sales by 15% through strategic outreach campaigns").`,
});

const analyzeResumeContentFlow = ai.defineFlow(
  {
    name: 'analyzeResumeContentFlow',
    inputSchema: AnalyzeResumeContentInputSchema,
    outputSchema: AnalyzeResumeContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumeContentPrompt(input);
    return output!;
  }
);
