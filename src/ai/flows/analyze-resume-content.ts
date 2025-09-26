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

Provide an ATS score (0-100), identify skill gaps (skills from the job description not found in the resume), and determine the content coverage percentage (percentage of the job description covered by the resume). Also, provide a brief summary of how well the resume matches the job description.

Ensure that the ATS score is a number between 0 and 100, the skillGaps field is an array of strings, and the contentCoveragePercentage is a number between 0 and 100.

Output in JSON format.`,
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
