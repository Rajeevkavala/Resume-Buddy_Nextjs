'use server';

/**
 * @fileOverview A flow for intelligently parsing resume text into structured fields using AI.
 *
 * - parseResumeIntelligently - A function that uses AI to parse resume text into structured data.
 * - ParseResumeIntelligentlyInput - The input type for the parseResumeIntelligently function.
 * - ParseResumeIntelligentlyOutput - The return type for the parseResumeIntelligently function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalInfoSchema = z.object({
  fullName: z.string().describe('Full name of the person'),
  email: z.string().describe('Email address'),
  phone: z.string().describe('Phone number'),
  location: z.string().describe('Location (City, State/Country)'),
  linkedin: z.string().optional().describe('LinkedIn profile URL'),
  github: z.string().optional().describe('GitHub profile URL'),
  portfolio: z.string().optional().describe('Portfolio website URL'),
  website: z.string().optional().describe('Personal website URL'),
});

const SkillCategorySchema = z.object({
  category: z.string().describe('Name of the skill category (e.g., Programming Languages, Frameworks)'),
  items: z.array(z.string()).describe('List of skills in this category'),
});

const ExperienceSchema = z.object({
  title: z.string().describe('Job title/position'),
  company: z.string().describe('Company name'),
  location: z.string().describe('Job location'),
  startDate: z.string().describe('Start date (e.g., Jan 2020, 2020)'),
  endDate: z.string().describe('End date or "Present" if current'),
  current: z.boolean().describe('Whether this is the current position'),
  achievements: z.array(z.string()).describe('List of key achievements and responsibilities'),
});

const EducationSchema = z.object({
  degree: z.string().describe('Degree type and field (e.g., Bachelor of Science in Computer Science)'),
  institution: z.string().describe('University/Institution name'),
  location: z.string().describe('Institution location'),
  graduationDate: z.string().describe('Graduation date or expected graduation'),
  gpa: z.string().optional().describe('GPA if mentioned (e.g., 3.8/4.0)'),
  honors: z.array(z.string()).optional().describe('Academic honors (e.g., [Magna Cum Laude, Dean\'s List])'),
  major: z.string().optional().describe('Major field of study if different from degree'),
  minor: z.string().optional().describe('Minor field of study if applicable'),
});

const ProjectSchema = z.object({
  name: z.string().describe('Project name'),
  description: z.string().describe('Brief description of the project'),
  technologies: z.array(z.string()).describe('Technologies/tools used in the project'),
  link: z.string().optional().describe('Project link (GitHub, demo, etc.)'),
  achievements: z.array(z.string()).describe('Key achievements and features of the project'),
});

const CertificationSchema = z.object({
  name: z.string().describe('Certification name'),
  issuer: z.string().describe('Issuing organization'),
  date: z.string().describe('Date obtained'),
  expirationDate: z.string().optional().describe('Expiration date if applicable'),
  credentialId: z.string().optional().describe('Credential ID if provided'),
});

const AwardSchema = z.object({
  title: z.string().describe('Award title'),
  issuer: z.string().describe('Issuing organization'),
  date: z.string().describe('Date received'),
  description: z.string().optional().describe('Award description'),
});

const LanguageSchema = z.object({
  language: z.string().describe('Language name'),
  proficiency: z.enum(['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic']).describe('Proficiency level'),
});

const ParseResumeIntelligentlyInputSchema = z.object({
  resumeText: z.string().describe('The resume text to be parsed into structured data'),
});

export type ParseResumeIntelligentlyInput = z.infer<typeof ParseResumeIntelligentlyInputSchema>;

const ParseResumeIntelligentlyOutputSchema = z.object({
  personalInfo: PersonalInfoSchema.describe('Personal contact information'),
  summary: z.string().optional().describe('Professional summary or objective'),
  skills: z.array(SkillCategorySchema).describe('Skills organized by categories'),
  experience: z.array(ExperienceSchema).describe('Work experience entries'),
  education: z.array(EducationSchema).describe('Educational background'),
  projects: z.array(ProjectSchema).optional().describe('Personal or professional projects'),
  certifications: z.array(CertificationSchema).optional().describe('Professional certifications'),
  awards: z.array(AwardSchema).optional().describe('Awards and recognition'),
  languages: z.array(LanguageSchema).optional().describe('Language proficiencies'),
});

export type ParseResumeIntelligentlyOutput = z.infer<typeof ParseResumeIntelligentlyOutputSchema>;

/**
 * Parse resume text intelligently using AI to extract structured data
 */
export const parseResumeIntelligently = ai.defineFlow(
  {
    name: 'parseResumeIntelligently',
    inputSchema: ParseResumeIntelligentlyInputSchema,
    outputSchema: ParseResumeIntelligentlyOutputSchema,
  },
  async (input) => {
    const prompt = `
You are an expert resume parser. Your task is to carefully analyze the provided resume text and extract all information into a structured format.

IMPORTANT PARSING GUIDELINES:
1. **Personal Information**: Extract complete contact details, clean up formatting
2. **Skills**: Group related skills into logical categories (e.g., Programming Languages, Frameworks, Tools, Soft Skills)
3. **Experience**: Parse each job with accurate dates, company names, and detailed achievements
4. **Education**: Extract degree, institution, dates, GPA, honors, major/minor if mentioned
5. **Projects**: Identify personal or professional projects with technologies and achievements
6. **Dates**: Standardize date formats (e.g., "Jan 2020", "2020-2023", "Present")
7. **Achievements**: Extract specific, quantifiable accomplishments and responsibilities
8. **Technologies**: Identify and categorize all technical skills and tools mentioned

QUALITY STANDARDS:
- Clean up any formatting issues or typos
- Ensure consistency in date formats
- Group similar skills together
- Extract specific achievements rather than generic responsibilities
- Maintain professional language and formatting
- Handle abbreviations and expand them when appropriate

RESUME TEXT TO PARSE:
${input.resumeText}

Parse this resume text and return the structured data following the exact schema provided. Ensure all fields are properly filled with accurate information from the resume.
`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      prompt,
      output: {
        schema: ParseResumeIntelligentlyOutputSchema,
      },
    });

    if (!response.output) {
      throw new Error('Failed to parse resume with AI');
    }

    return response.output;
  }
);