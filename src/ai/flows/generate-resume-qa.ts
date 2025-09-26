'use server';

/**
 * @fileOverview A resume Q&A generator AI agent.
 *
 * - generateResumeQA - A function that handles the resume Q&A generation process.
 * - GenerateResumeQAInput - The input type for the generateResumeQA function.
 * - GenerateResumeQAOutput - The return type for the generateResumeQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeQAInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  topic: z.string().describe('The specific topic for Q&A generation.'),
});
export type GenerateResumeQAInput = z.infer<typeof GenerateResumeQAInputSchema>;

const GenerateResumeQAOutputSchema = z.object({
  qaPairs: z
    .array(z.object({question: z.string(), answer: z.string()}))
    .describe('An array of question and answer pairs relevant to the resume and topic.'),
});
export type GenerateResumeQAOutput = z.infer<typeof GenerateResumeQAOutputSchema>;

export async function generateResumeQA(input: GenerateResumeQAInput): Promise<GenerateResumeQAOutput> {
  return generateResumeQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeQAPrompt',
  input: {schema: GenerateResumeQAInputSchema},
  output: {schema: GenerateResumeQAOutputSchema},
  prompt: `You are an AI assistant specialized in generating relevant questions and answers based on a user's resume and a specific topic.

  Resume Text: {{{resumeText}}}
  Topic: {{{topic}}}

  Generate a list of 5 question and answer pairs that are relevant to both the resume and the specified topic. Each question should be insightful and help the user prepare for potential interviews. The answers should be comprehensive and well-crafted, providing practical guidance and demonstrating a deep understanding of the topic and the user's experience as described in their resume. Focus on generating unique and thoughtful questions that go beyond basic information retrieval.
  Format the output as a JSON array of objects, where each object has a "question" and an "answer" field.
  `,
});

const generateResumeQAFlow = ai.defineFlow(
  {
    name: 'generateResumeQAFlow',
    inputSchema: GenerateResumeQAInputSchema,
    outputSchema: GenerateResumeQAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
