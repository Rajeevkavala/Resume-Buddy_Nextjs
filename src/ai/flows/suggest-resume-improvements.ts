'use server';

/**
 * @fileOverview A flow for suggesting improvements to resume content using AI.
 *
 * - suggestResumeImprovements - A function that suggests improvements to the resume content.
 * - SuggestResumeImprovementsInput - The input type for the suggestResumeImprovements function.
 * - SuggestResumeImprovementsOutput - The return type for the suggestResumeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResumeImprovementsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description for tailoring the resume improvements.'),
});
export type SuggestResumeImprovementsInput = z.infer<
  typeof SuggestResumeImprovementsInputSchema
>;

const SuggestResumeImprovementsOutputSchema = z.object({
  improvedResumeText: z
    .string()
    .describe('The improved resume text with professional formatting and content.'),
  improvementsSummary: z
    .string()
    .describe('A summary of the improvements made to the resume.'),
});
export type SuggestResumeImprovementsOutput = z.infer<
  typeof SuggestResumeImprovementsOutputSchema
>;

export async function suggestResumeImprovements(
  input: SuggestResumeImprovementsInput
): Promise<SuggestResumeImprovementsOutput> {
  return suggestResumeImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResumeImprovementsPrompt',
  input: {schema: SuggestResumeImprovementsInputSchema},
  output: {schema: SuggestResumeImprovementsOutputSchema},
  prompt: `You are an expert resume writer. You will improve the provided resume text to be more professional and effective, optimizing it for both ATS systems and human recruiters. If a job description is provided, tailor the resume to match the job requirements and highlight relevant skills and experiences.

Resume Text:
{{{resumeText}}}

Job Description (if provided):
{{{jobDescription}}}

Instructions:
1. Rewrite the resume content to be more concise, clear, and impactful.
2. Use action verbs and quantifiable results to demonstrate accomplishments.
3. Optimize the resume for ATS systems by including relevant keywords from the job description.
4. Ensure proper formatting and structure for easy readability.
5. Provide a summary of the improvements made.

Output the improved resume text and a summary of the changes.

Improved Resume Text:

Improvements Summary:`,
});

const suggestResumeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestResumeImprovementsFlow',
    inputSchema: SuggestResumeImprovementsInputSchema,
    outputSchema: SuggestResumeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
