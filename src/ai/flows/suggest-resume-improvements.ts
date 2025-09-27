
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
import { AnalyzeResumeContentOutputSchema } from './analyze-resume-content';


const SuggestResumeImprovementsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description for tailoring the resume improvements.'),
  previousAnalysis: AnalyzeResumeContentOutputSchema.optional().describe('The output from a previous run of the resume analyzer flow. Use this for the "before" values in the impact forecast.')
});
export type SuggestResumeImprovementsInput = z.infer<
  typeof SuggestResumeImprovementsInputSchema
>;

const ImpactForecastSchema = z.object({
    before: z.number().describe('The score before the improvement.'),
    after: z.number().describe('The score after the improvement.'),
});

const SuggestResumeImprovementsOutputSchema = z.object({
  improvedResumeText: z
    .string()
    .describe('The improved resume text with professional formatting and content.'),
  improvementsSummary: z
    .string()
    .describe('A concise, high-level summary of the most important improvements made to the resume.'),
  impactForecast: z.object({
      atsScore: ImpactForecastSchema.describe("The estimated ATS (Applicant Tracking System) score change."),
      skillsMatch: ImpactForecastSchema.describe("The skills match score change based on the job description."),
      quantifiedAchievements: ImpactForecastSchema.describe("The count of achievements with measurable metrics."),
  }).describe('A forecast of the impact of the improvements.'),
  quantifiedAchievements: z.array(z.object({
      original: z.string().optional().describe('The original, less impactful phrase from the resume.'),
      improved: z.string().describe('The new, quantified achievement.'),
      section: z.string().describe('The resume section where the improvement was made (e.g., "Software Engineer at Acme Corp").')
  })).describe('A list of specific achievements that were rewritten to be more impactful and metric-based.'),
  integratedSkills: z.array(z.object({
      skill: z.string().describe('The skill or keyword that was missing.'),
      integrationPoint: z.string().describe('A brief quote or description of where the skill was integrated.')
  })).describe('A list of skills from the job description that were integrated into the resume.'),
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

{{#if previousAnalysis}}
**Previous Analysis Data (for "before" scores):**
\`\`\`json
{{{json anysis=previousAnalysis}}}
\`\`\`
{{/if}}


**Instructions:**

Your output **must** be a valid JSON object that strictly adheres to the provided schema.

1.  **Analyze and Rewrite:** Do not just edit; completely rewrite the resume for maximum impact. Reorganize sections if necessary. The final output must be the full, complete resume text in the \`improvedResumeText\` field.

2.  **Generate an Impact Forecast (\`impactForecast\`):**
    *   **"Before" Scores**: Use the data from the \`previousAnalysis\` input for the 'before' scores.
        *   For \`atsScore\`, use \`previousAnalysis.atsScore\`.
        *   For \`skillsMatch\`, calculate the percentage of present keywords from \`previousAnalysis.keywordAnalysis\`.
        *   For \`quantifiedAchievements\`, count the number of bullet points in the original resume that already contain numbers or percentages.
    *   **If \`previousAnalysis\` is NOT provided, you must estimate these "before" values yourself.**
    *   **"After" Scores**: Estimate the impact of the changes you are about to make and provide "after" numbers for:
        *   \`atsScore\`: A percentage (0-100).
        *   \`skillsMatch\`: A percentage (0-100), relevant only if a job description is provided.
        *   \`quantifiedAchievements\`: The total count of bullet points containing specific, measurable results in your rewritten resume.

3.  **Craft a Powerful Summary (\`improvementsSummary\`):** Write a concise summary (2-3 sentences) explaining the key changes you made. Highlight the most significant improvements, such as adding quantified metrics and integrating skills.

4.  **Quantify Achievements (\`quantifiedAchievements\`):** This is a crucial step.
    *   Identify at least 5-7 key responsibilities or generic statements in the original resume.
    *   Transform them into specific, metric-based achievements. Invent realistic, industry-appropriate metrics where they are missing.
    *   For each transformation, create an object containing the \`original\` phrase, the \`improved\` achievement, and the \`section\` where it appears.
    *   *Example:*
        *   original: "Managed a team"
        *   improved: "Led a team of 8 developers, resulting in a 25% increase in productivity."
        *   section: "Lead Developer at TechCorp"

5.  **Integrate Missing Keywords (\`integratedSkills\`):**
    *   If a job description is provided, identify important missing keywords.
    *   Seamlessly weave these keywords into the professional summary and work experience sections.
    *   For each skill you add, create an object with the \`skill\` and a brief \`integrationPoint\` showing where it was added.
    *   *Example:*
        *   skill: "CI/CD"
        *   integrationPoint: "...resulting in a 25% increase in productivity through the implementation of a new CI/CD pipeline."

6.  **Use Powerful Action Verbs:** Start every bullet point in the improved resume with a strong, impactful action verb (e.g., "Architected," "Orchestrated," "Spearheaded").

7.  **Format for Readability:** Ensure the \`improvedResumeText\` is well-formatted with clear headings and consistent spacing for ATS-compliance and human readability.
`,
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
