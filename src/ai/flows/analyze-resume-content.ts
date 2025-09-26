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
    .describe(
      'A score representing how well the resume is optimized for Applicant Tracking Systems (ATS).'
    ),
  skillGaps: z
    .array(z.string())
    .describe(
      'A list of skills mentioned in the job description that are missing from the resume.'
    ),
  contentCoveragePercentage: z
    .number()
    .describe(
      'The percentage of required content from the job description that is covered in the resume.'
    ),
  summary: z
    .string()
    .describe('A summary of how well the resume matches the job description.'),
  keywordAnalysis: z
    .object({
      presentKeywords: z.array(z.string()).describe('Keywords from the job description found in the resume.'),
      missingKeywords: z.array(z.string()).describe('Keywords from the job description missing from the resume.'),
    })
    .describe('Analysis of keywords from the job description.'),
  actionVerbFeedback: z
    .string()
    .describe('Feedback on the usage of action verbs in the resume, with suggestions for improvement.'),
  quantifiableResultsFeedback: z
    .string()
    .describe('Feedback on the use of quantifiable results to demonstrate accomplishments, with examples.'),
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
  prompt: `You are an AI resume analyst. Analyze the resume text against the job description provided.

Resume Text: {{{resumeText}}}

Job Description: {{{jobDescription}}}

Provide a detailed analysis including:
1. An ATS score (0-100).
2. A list of skill gaps (skills from the job description not found in the resume).
3. The content coverage percentage (percentage of job description keywords covered).
4. A brief summary of how well the resume matches the job description.
5. A keyword analysis, listing keywords present and missing from the resume based on the job description.
6. Feedback on the use of action verbs, suggesting stronger alternatives if needed.
7. Feedback on the use of quantifiable results, providing examples on how to improve.


Ensure that the output is in a valid JSON format that adheres to the provided schema.`,
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
