
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

const ImpactForecastSchema = z.object({
    before: z.number().describe('The score before the improvement.'),
    after: z.number().describe('The score after the improvement.'),
});

const SuggestResumeImprovementsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description for tailoring the resume improvements.'),
  previousAnalysis: z.object({
      atsScore: z.number().optional(),
      keywordAnalysis: z.object({
          presentKeywords: z.array(z.string()).optional(),
          missingKeywords: z.array(z.object({ skill: z.string(), criticality: z.string()})).optional(),
      }).optional(),
  }).optional().describe('The output from a previous run of the resume analyzer flow. Use this for the "before" values in the impact forecast.')
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
  input: {
    schema: SuggestResumeImprovementsInputSchema.extend({
      stringifiedAnalysis: z.string().optional(),
    }),
  },
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

{{#if stringifiedAnalysis}}
**Previous Analysis Data (for "before" scores):**
\`\`\`json
{{{stringifiedAnalysis}}}
\`\`\`
{{/if}}


**Instructions:**

Your output **must** be a valid JSON object that strictly adheres to the provided schema.

1.  **Analyze and Rewrite for COMPACT, One-Page Format:** 
    *   Completely rewrite the resume for maximum impact within single-page constraints.
    *   **STRICT Compact Content Guidelines (6 sections max):**
        - Header: Compact format with contact info in single line
        - Professional Summary: Concise overview (60-80 words max)
        - Technical Skills: Group into 5 categories max: Languages, Frameworks, Databases, Tools, Cloud/CI
        - Key Projects: Limit to TOP 2-3 most impactful projects only
        - Professional Experience: MAX 2 bullet points per role for conciseness
        - Education & Certifications: Merge into single section, one line per item
    *   **Compression Rules:**
        - Remove filler words: "successfully," "effectively," "comprehensive," "ensuring"
        - Use short, direct verbs: built, designed, deployed, integrated, improved
        - Replace full sentences with impact phrases
        - Keep white space minimal but balanced for readability
    *   The final output must be the full, complete resume text in the \`improvedResumeText\` field.

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

3.  **Craft a Powerful Summary (\`improvementsSummary\`):** Write a comprehensive summary (3-4 sentences) explaining the key changes you made. Highlight the most significant improvements, such as adding quantified metrics and integrating skills for optimal professional presentation.

4.  **Quantify Achievements (\`quantifiedAchievements\`) - COMPACT FORMAT:**
    *   Select ONLY the most impactful achievements for quantification (max 20-22 total bullet points).
    *   Transform them into CONCISE, metric-based achievements using compressed wording.
    *   Keep each bullet point to maximum 2 lines for single-page optimization.
    *   For each transformation, create an object containing the \`original\` phrase, the \`improved\` achievement, and the \`section\` where it appears.
    *   *Compact Example:*
        *   original: "Successfully completed a 6-week intensive internship focused on modern web application development"
        *   improved: "Completed 6-week MERN stack internship; ranked Top 10/100+ for project quality and UX"
        *   section: "Intern at EY GDS"

5.  **Integrate Missing Keywords (\`integratedSkills\`) - COMPREHENSIVE INTEGRATION:**
    *   If a job description is provided, identify all relevant missing keywords for complete coverage.
    *   Seamlessly weave these keywords into the professional summary, experience sections, and skills areas.
    *   Prioritize natural integration that enhances the overall professional narrative.
    *   For each skill you add, create an object with the \`skill\` and a brief \`integrationPoint\` showing where it was added.

6.  **Use Powerful Action Verbs:** Start every bullet point with impactful action verbs (e.g., "Architected," "Delivered," "Optimized").

7.  **Format for COMPACT Single-Page Layout:** 
    *   Ensure the \`improvedResumeText\` uses optimized formatting for single-page presentation.
    *   STRICT section order: Header → Professional Summary → Technical Skills → Key Projects → Experience → Education & Certifications
    *   Use 10.5-11pt font equivalent spacing with minimal white space.
    *   Skills section: Group into max 5 lines (Languages, Frameworks, Databases, Tools, Cloud/CI).
    *   Limit projects to TOP 2-3 with 1-line descriptions and max 2 bullet points each.
    *   Experience: Max 2 bullet points per role, no paragraph longer than 2 lines.
    *   Education & Certifications: Merge into single section, one line per item.
`,
});

const suggestResumeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestResumeImprovementsFlow',
    inputSchema: SuggestResumeImprovementsInputSchema,
    outputSchema: SuggestResumeImprovementsOutputSchema,
  },
  async input => {
    let stringifiedAnalysis: string | undefined;
    if (input.previousAnalysis) {
      stringifiedAnalysis = JSON.stringify(input.previousAnalysis);
    }
    const {output} = await prompt({
      ...input,
      stringifiedAnalysis,
    });
    return output!;
  }
);
