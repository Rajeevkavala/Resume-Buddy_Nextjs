
'use server';

/**
 * @fileOverview A flow for suggesting improvements to resume content using AI.
 *
 * - suggestResumeImprovements - A function that suggests improvements to the resume content.
 * - SuggestResumeImprovementsInput - The input type for the suggestResumeImprovements function.
 * - SuggestResumeImprovementsOutput - The return type for the suggestResumeimprovements function.
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
  prompt: `You are an expert resume writer and career coach. Your task is to perform a comprehensive overhaul of the provided resume text. If a job description is provided, you must tailor the resume to that specific role.

**Resume Text:**
\`\`\`
{{{resumeText}}}
\`\`\`

{{#if jobDescription}}
**Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`
{{/if}}

**Instructions:**

1.  **Rewrite and Restructure:** Do not just edit; completely rewrite the resume for maximum impact. Reorganize sections if necessary to better highlight the candidate's strengths for the target role. The output should be a full, complete resume text.

2.  **Craft a Powerful Summary:** Create a compelling new professional summary (3-4 sentences) that immediately captures a recruiter's attention. It must integrate key skills from the job description and state a clear value proposition.

3.  **Quantify Achievements (Crucial):** This is the most important step. Transform all generic responsibilities and duties into specific, metric-based achievements. Invent realistic, industry-appropriate metrics where they are missing. For example:
    *   "Managed a team" becomes "Led a team of 8 developers, resulting in a 25% increase in productivity."
    *   "Worked on web applications" becomes "Architected and launched three full-stack web applications, serving over 50,000 monthly active users."
    *   "Fixed bugs" becomes "Reduced production bugs by 40% through implementation of a comprehensive testing suite."

4.  **Integrate Missing Keywords:** Seamlessly weave keywords and skills from the job description into the professional summary and work experience sections. The integration must feel natural and be supported by the context of the achievement.

5.  **Use Powerful Action Verbs:** Start every bullet point with a strong, impactful action verb (e.g., "Architected," "Orchestrated," "Spearheaded," "Accelerated," "Quantified").

6.  **Format for Readability and ATS-Compliance:** Ensure the final text is well-formatted, with clear headings and consistent spacing. Use a structure that is easily parsed by Applicant Tracking Systems (ATS).

7.  **Generate a Summary of Improvements:** After creating the improved resume, write a concise summary explaining the key changes you made. Highlight the most significant improvements, such as the addition of quantified metrics, the new professional summary, and how you integrated missing skills.

Produce the output as a valid JSON object with \`improvedResumeText\` and \`improvementsSummary\` fields.`,
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
