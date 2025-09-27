'use server';

/**
 * @fileOverview A resume Q&A generator AI agent using a RAG-like approach.
 *
 * - generateResumeQA - A function that handles the resume Q&A generation process.
 * - GenerateResumeQAInput - The input type for the generateResumeQA function.
 * - GenerateResumeQAOutput - The return type for the generateResumeQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeQAInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  topic: z.enum([
    'General',
    'Technical',
    'Work Experience',
    'Projects',
    'Career Goals',
    'Education',
  ]).describe('The specific topic for Q&A generation.'),
  numQuestions: z.number().min(3).max(10).default(5).describe('The number of Q&A pairs to generate.'),
});
export type GenerateResumeQAInput = z.infer<typeof GenerateResumeQAInputSchema>;

const QAPairSchema = z.object({
  question: z.string().describe('An insightful, context-aware question an interviewer might ask.'),
  answer: z.string().describe('A structured, personalized answer using the STAR method, referencing specific examples from the resume.'),
  relatedSections: z.array(z.string()).describe('A list of resume sections or bullet points that are directly relevant to the question and answer.'),
  keyPoints: z.array(z.string()).describe('A list of key skills or achievements to emphasize when delivering the answer.')
});

const GenerateResumeQAOutputSchema = z.object({
  qaPairs: z
    .array(QAPairSchema)
    .describe('An array of intelligent question and answer pairs relevant to the resume and topic.'),
});
export type GenerateResumeQAOutput = z.infer<typeof GenerateResumeQAOutputSchema>;

export async function generateResumeQA(input: GenerateResumeQAInput): Promise<GenerateResumeQAOutput> {
  return generateResumeQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeQAPrompt',
  input: {schema: GenerateResumeQAInputSchema},
  output: {schema: GenerateResumeQAOutputSchema},
  prompt: `You are an expert AI interview coach. Your task is to generate {{numQuestions}} insightful, context-aware question-and-answer pairs based on the provided resume and a specific topic. Use a Retrieval-Augmented Generation (RAG) approach to ensure your output is deeply rooted in the resume's content.

Resume Text:
{{{resumeText}}}

Selected Topic: {{{topic}}}

Follow these steps for each of the {{numQuestions}} Q&A pairs:
1.  **Analyze and Retrieve**: Thoroughly analyze the resume to identify key projects, roles, skills, and achievements related to the selected topic.
2.  **Generate Insightful Question**: Based on the retrieved context, formulate a challenging and relevant question that an interviewer would likely ask to probe deeper into that area.
3.  **Synthesize a STAR-Method Answer**: Craft a personalized, high-quality answer that directly references the user's experience from the resume. Structure the answer using the STAR (Situation, Task, Action, Result) method. The answer should be detailed, professional, and showcase the candidate's strengths.
4.  **Identify Related Sections**: List the specific resume sections, job titles, or bullet points that provide the evidence for the answer.
5.  **Extract Key Points**: List the most important skills, achievements, or qualities the user should emphasize when delivering the answer.

Generate exactly {{numQuestions}} Q&A pairs.

**Example for 'Technical Skills' topic:**
*   **Question**: "Your resume mentions Python and data analysis. Can you describe a specific project where you used Python to solve a complex data problem?"
*   **Answer**: "In my role as Data Analyst at XYZ Corp, I used Python to analyze customer behavior... (Situation). The task was to identify patterns predicting churn... (Task). I implemented a solution using pandas and scikit-learn... (Action). This led to a proactive retention campaign that reduced churn by 23%... (Result)."
*   **Related Sections**: ["Data Analyst at XYZ Corp", "Skills: Python, pandas, scikit-learn, Machine Learning"]
*   **Key Points**: ["Problem-solving with Python", "Quantifiable business impact", "Machine learning application"]

Produce the output in a valid JSON format according to the provided schema.
  `,
});

const generateResumeQAFlow = ai.defineFlow(
  {
    name: 'generateResumeQAFlow',
    inputSchema: GenerateResumeQAInputSchema,
    outputSchema: GenerateResumeQAOutputSchema,
  },
  async input => {
    // Manually set the length for the output schema based on the input
    const dynamicOutputSchema = z.object({
        qaPairs: z
            .array(QAPairSchema)
            .length(input.numQuestions)
            .describe(`An array of ${input.numQuestions} intelligent question and answer pairs relevant to the resume and topic.`),
    });
    
    const {output} = await ai.generate({
        prompt: prompt.prompt,
        model: prompt.model,
        output: {
            schema: dynamicOutputSchema,
        },
        context: input,
    });

    return output!;
  }
);
