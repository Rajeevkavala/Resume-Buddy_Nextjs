'use server';

/**
 * @fileOverview Generates a multiple-choice quiz for interview preparation using AI,
 * based on a resume, job description, interview type, and difficulty level.
 *
 * - generateInterviewQuestions - A function that generates an interview quiz.
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

const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question text.'),
  options: z.array(z.string()).length(4).describe('An array of exactly 4 possible answer choices.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The index (0-3) of the correct answer in the `options` array.'),
  explanation: z.string().describe('A detailed explanation of why the correct answer is correct, and why the others are incorrect.'),
  category: z.string().describe('A brief category for the question (e.g., "System Design", "Leadership", "Teamwork").')
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(MCQSchema),
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
  prompt: `You are an AI-powered interview preparation coach. Your task is to generate a multiple-choice quiz with insightful questions, clear options, and comprehensive explanations based on the provided resume, job description, and user-defined settings.

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
2.  **Generate {{numQuestions}} MCQs**: Create exactly {{numQuestions}} multiple-choice questions that are highly relevant to the specified **Interview Type** and **Difficulty Level**.
    *   For **Technical** interviews, focus on areas like system design, coding problems, and technology deep-dives relevant to the job.
    *   For **Behavioral** interviews, create scenarios that probe into competencies like teamwork, problem-solving, and leadership.
    *   For **Leadership** interviews, focus on strategic thinking, team management, and decision-making.
    *   For **General** interviews, provide a mix of question types.
3.  **Create Options**: For each question, provide exactly 4 distinct answer options. One option must be clearly correct, and the others should be plausible but incorrect distractors.
4.  **Identify Correct Answer**: Specify the index (0-3) of the correct answer.
5.  **Craft Explanations**: For each question, write a detailed explanation that clarifies why the correct answer is right and provides context on the other options. This is a critical learning tool for the user.
6.  **Categorize**: Assign a relevant, brief category to each question (e.g., "System Design", "Conflict Resolution", "Strategic Planning").

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
