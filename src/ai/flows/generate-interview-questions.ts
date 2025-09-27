'use server';

/**
 * @fileOverview Generates role-specific interview questions and answers using AI based on a resume, job description, interview type, and difficulty level.
 *
 * - generateInterviewQuestions - A function that generates interview questions and answers.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text extracted from the resume.'),
  jobDescription: z.string().describe('The job description for the role.'),
  interviewType: z.enum(["Technical", "Behavioral", "Leadership", "General"]).describe("The type of interview to prepare for."),
  difficultyLevel: z.enum(["Entry", "Mid", "Senior", "Executive"]).describe("The career level for which the questions should be tailored."),
  numQuestions: z
    .number()
    .min(3)
    .max(15)
    .default(5)
    .describe('The number of interview questions to generate.'),
});

export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questionsAndAnswers: z.array(
    z.object({
      question: z.string().describe('The generated interview question, tailored to the specified inputs.'),
      answer: z.string().describe('A detailed, structured sample answer using frameworks like STAR where applicable. The answer should reference the provided resume content to be as personalized as possible.'),
      category: z.string().describe('A brief category for the question (e.g., "System Design", "Leadership", "Teamwork").')
    })
  ),
});

export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an AI-powered interview preparation coach. Your task is to generate a list of insightful interview questions and comprehensive sample answers based on the provided resume, job description, and user-defined settings.

**Inputs:**
1.  **Resume Text**:
    {{{resumeText}}}

2.  **Job Description**:
    {{{jobDescription}}}

3.  **Interview Type**: {{{interviewType}}}
4.  **Difficulty Level**: {{{difficultyLevel}}}
5.  **Number of Questions**: {{numQuestions}}

**Instructions:**
1.  **Analyze Context**: Thoroughly analyze the resume and job description to understand the candidate's experience and the role's requirements.
2.  **Tailor Questions**: Generate exactly {{numQuestions}} questions that are highly relevant to the specified **Interview Type** and **Difficulty Level**.
    *   For **Technical** interviews, focus on areas like system design, coding problems, and technology deep-dives relevant to the job.
    *   For **Behavioral** interviews, create scenarios that probe into competencies like teamwork, problem-solving, and leadership.
    *   For **Leadership** interviews, focus on strategic thinking, team management, and decision-making.
    *   For **General** interviews, provide a mix of question types.
3.  **Craft Sample Answers**: For each question, provide a detailed, well-structured sample answer.
    *   **Personalize**: Reference specific projects, skills, or experiences directly from the resume to make the answer authentic.
    *   **Use Frameworks**: For behavioral questions, structure the answer using the STAR (Situation, Task, Action, Result) method.
    *   **Be Specific**: Include quantifiable results and concrete examples.
4.  **Categorize**: Assign a relevant, brief category to each question (e.g., "System Design", "Conflict Resolution", "Strategic Planning").

Format your output as a valid JSON object matching the defined schema. Ensure the content is professional, insightful, and genuinely helpful for interview preparation.
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
