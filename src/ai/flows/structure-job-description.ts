import { ai } from '../genkit';
import { z } from 'zod';

// Input schema
const StructureJobDescriptionInputSchema = z.object({
  rawContent: z.string().min(100, 'Content too short to structure'),
  url: z.string().optional(),
});

// Output schema
const StructureJobDescriptionOutputSchema = z.object({
  jobTitle: z.string().describe('The job title/position name'),
  company: z.string().optional().describe('Company name if mentioned'),
  location: z.string().optional().describe('Job location if mentioned'),
  summary: z.string().optional().describe('Brief job summary (2-3 sentences)'),
  responsibilities: z.array(z.string()).describe('List of key responsibilities and duties'),
  requiredSkills: z.array(z.string()).describe('List of required technical and soft skills'),
  qualifications: z.array(z.string()).describe('List of required qualifications, education, and experience'),
  preferredSkills: z.array(z.string()).optional().describe('List of preferred/nice-to-have skills'),
  benefits: z.array(z.string()).optional().describe('List of benefits and perks if mentioned'),
  salaryRange: z.string().optional().describe('Salary range if mentioned'),
  employmentType: z.string().optional().describe('Employment type (Full-time, Part-time, Contract, etc.)'),
  workMode: z.string().optional().describe('Work mode (Remote, Hybrid, On-site)'),
  formattedDescription: z.string().describe('Complete formatted job description with all sections'),
});

export type StructureJobDescriptionInput = z.infer<typeof StructureJobDescriptionInputSchema>;
export type StructureJobDescriptionOutput = z.infer<typeof StructureJobDescriptionOutputSchema>;

export const structureJobDescription = ai.defineFlow(
  {
    name: 'structureJobDescription',
    inputSchema: StructureJobDescriptionInputSchema,
    outputSchema: StructureJobDescriptionOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert at analyzing and structuring job descriptions. Extract and organize information from the following job posting content.

RAW CONTENT FROM JOB POSTING:
${input.rawContent}

${input.url ? `SOURCE URL: ${input.url}\n` : ''}

INSTRUCTIONS:
1. Extract the job title, company name, and location
2. Create a brief 2-3 sentence summary of the role
3. Identify and list ALL key responsibilities (aim for 8-15 items)
4. Extract ALL required skills - both technical and soft skills (aim for 10-20 items)
5. List ALL qualifications including education, years of experience, certifications (aim for 5-10 items)
6. If mentioned, extract preferred/nice-to-have skills
7. If mentioned, extract benefits and perks
8. If mentioned, extract salary range
9. Identify employment type (Full-time, Part-time, Contract, Intern, etc.)
10. Identify work mode (Remote, Hybrid, On-site, Flexible)

IMPORTANT GUIDELINES:
- Be comprehensive - don't miss important details
- Keep each bullet point clear and concise (1-2 sentences max)
- Remove duplicates and redundant information
- Maintain professional language
- If information is not present in the content, leave that field empty
- For the formattedDescription, create a well-structured, professional job description with clear sections

Focus on extracting concrete, actionable information that would help a job seeker understand:
- What they'll be doing (responsibilities)
- What they need to have (required skills & qualifications)
- What would be nice to have (preferred skills)
- What they'll get (benefits)

Format the final description with clear headers and bullet points for easy reading.`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      prompt,
      output: {
        schema: StructureJobDescriptionOutputSchema,
      },
    });

    return result.output as StructureJobDescriptionOutput;
  }
);
