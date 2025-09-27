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
      missingKeywords: z.array(z.object({
        skill: z.string().describe('The missing skill or keyword.'),
        criticality: z.enum(["Critical", "High", "Medium", "Low"]).describe('The priority for adding this skill.')
      })).describe('Keywords from the job description missing from the resume, with a criticality rating.'),
    })
    .describe('Analysis of keywords from the job description.'),
  actionVerbFeedback: z
    .string()
    .describe('Feedback on the usage of action verbs in the resume. This should be a paragraph that assesses the strength and variety of verbs used. If weak verbs are present (e.g., "Responsible for," "Helped with"), suggest stronger alternatives (e.g., "Managed," "Orchestrated," "Accelerated").'),
  quantifiableResultsFeedback: z
    .string()
    .describe('Feedback on the use of quantifiable results to demonstrate impact. This should be a paragraph explaining the importance of quantifying achievements. Provide 2-3 specific examples from the resume and show how they could be improved by adding metrics (e.g., "Increased sales" could become "Increased quarterly sales by 15% through strategic outreach campaigns").'),
  qualityMetrics: z.object({
      lengthScore: z.number().min(0).max(100).describe('Score from 0-100 based on resume length. Optimal is 300-800 words.'),
      structureScore: z.number().min(0).max(100).describe('Score from 0-100 based on the presence and organization of standard resume sections (Summary, Experience, Education, Skills).'),
      readabilityScore: z.number().min(0).max(100).describe('Score from 0-100 based on clarity, professional language, and ease of reading.'),
      wordCount: z.number().describe('The total word count of the resume.')
  }),
  industryCompatibility: z.array(z.object({
      industry: z.string().describe('The name of the industry.'),
      score: z.number().min(0).max(100).describe('The compatibility score (0-100) for that industry.'),
      status: z.enum(["High", "Good", "Fair", "Low"]).describe('A qualitative status of the compatibility.')
  })).describe('An array of objects showing how well the resume aligns with different industries, especially the one from the job description.')
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
  prompt: `You are an expert career coach and resume analyst for the "ResumeWise" platform. Your task is to provide a detailed, professional, and actionable analysis of the provided resume against the given job description.

Resume Text:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Analyze the resume on the following criteria and provide the output in a valid JSON format. The analysis must be critical, high-quality, and follow all instructions precisely.

1.  **ATS Score (0-100)**: Evaluate the resume's compatibility with Applicant Tracking Systems. Consider keyword density, formatting, and standard section headings. A higher score means better optimization. This must be a numerical value.
2.  **Content Coverage Percentage (0-100)**: Calculate the percentage of skills, qualifications, and requirements from the job description that are addressed in the resume. This must be a numerical value.
3.  **Summary**: Write a concise, professional summary (3-4 sentences) of the resume's strengths and weaknesses in relation to this specific job.
4.  **Keyword and Skill Analysis**:
    *   Identify crucial keywords and skills from the job description.
    *   List the keywords that are present in the resume.
    *   List the important keywords and skills that are missing from the resume. For each missing skill, assign a criticality level: "Critical", "High", "Medium", or "Low". "Critical" skills are absolute must-haves for the role. "High" are strongly preferred. "Medium" are good to have. "Low" are minor.
5.  **Action Verb Feedback**: Analyze the use of action verbs. The feedback should be a paragraph that assesses the strength and variety of verbs used. If weak verbs are present (e.g., "Responsible for," "Helped with"), suggest stronger alternatives (e.g., "Managed," "Orchestrated," "Accelerated").
6.  **Quantifiable Results Feedback**: Analyze how well the resume uses numbers and data to show impact. The feedback should be a paragraph explaining the importance of quantifying achievements. Provide 2-3 specific examples from the resume and show how they could be improved by adding metrics (e.g., "Increased sales" could become "Increased quarterly sales by 15% through strategic outreach campaigns").
7.  **Quality Metrics**:
    *   Calculate the total word count of the resume.
    *   Provide a \'lengthScore\' (0-100). The optimal range is 300-800 words. Score 100 if within this range. Decrease the score for resumes that are too short or too long.
    *   Provide a \'structureScore\' (0-100) based on the presence and logical organization of standard sections (e.g., Summary, Experience, Education, Skills).
    *   Provide a \'readabilityScore\' (0-100) based on the clarity of the content, professional tone, and avoidance of jargon.
8.  **Industry Compatibility**:
    *   Detect the primary industry from the job description (e.g., Technology, Fintech, Healthcare Tech).
    *   Generate a list of 3-4 related industries.
    *   For each industry, provide a \'score\' (0-100) for how well the resume aligns with it and a qualitative \'status\' ("High", "Good", "Fair", "Low"). The primary industry from the job description should have the most detailed analysis and score.`,
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
