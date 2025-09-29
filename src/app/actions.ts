
'use server';

import {z} from 'zod';
import {analyzeResumeContent} from '@/ai/flows/analyze-resume-content';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import {generateInterviewQuestions} from '@/ai/flows/generate-interview-questions';
import {generateResumeQA} from '@/ai/flows/generate-resume-qa';
import {suggestResumeImprovements} from '@/ai/flows/suggest-resume-improvements';
import {Packer, Document, Paragraph, TextRun} from 'docx';
import mammoth from 'mammoth';
import pdf from 'pdf-parse-fork';
import { saveData as saveToDb, clearData as clearFromDb, updateUserProfileInDb } from '@/lib/firestore';
import type { AnalysisResult } from '@/lib/types';
import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import * as cheerio from 'cheerio';

const baseSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  resumeText: z
    .string()
    .min(100, 'Resume text is too short. Please provide a more detailed resume.'),
  jobDescription: z
    .string()
    .min(
      100,
      'Job description is too short. Please provide a more detailed job description.'
    ),
});

const qaSchema = baseSchema.extend({
    topic: z.enum([
    "General",
    "Technical",
    "Work Experience",
    "Projects",
    "Career Goals",
    "Education",
  ]),
  numQuestions: z.number().min(3).max(10),
})

const interviewSchema = baseSchema.extend({
  interviewType: z.enum(["Technical", "Behavioral", "Leadership", "General"]),
  difficultyLevel: z.enum(["Entry", "Mid", "Senior", "Executive"]),
  numQuestions: z.number().min(3).max(15),
});

export async function extractText(
  formData: FormData
): Promise<{text?: string; error?: string}> {
  const file = formData.get('resume') as File | null;

  if (!file) {
    return {error: 'No file uploaded.'};
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      return {text: data.text};
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({buffer});
      return {text: result.value};
    } else if (file.type === 'text/plain') {
      return {text: buffer.toString('utf8')};
    } else {
      return {
        error:
          'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
      };
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    return {error: 'Failed to extract text from the file.'};
  }
}

export async function saveData(
  userId: string,
  data: Partial<AnalysisResult>
) {
  return saveToDb(userId, data);
}

export async function clearData(userId: string) {
  return clearFromDb(userId);
}

export async function runAnalysisAction(input: {
  userId: string;
  resumeText: string;
  jobDescription: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  const analysis = await analyzeResumeContent(validatedFields.data);
  await saveToDb(input.userId, { analysis, resumeText: input.resumeText, jobDescription: input.jobDescription });
  return analysis;
}

export async function runQAGenerationAction(input: {
  userId: string;
  resumeText: string;
  jobDescription: string;
  topic: "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";
  numQuestions: number;
}) {
  const validatedFields = qaSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  const qaResult = await generateResumeQA({
    resumeText: validatedFields.data.resumeText,
    topic: validatedFields.data.topic,
    numQuestions: validatedFields.data.numQuestions,
  });

  const dataToSave = {
      [`qa.${input.topic}`]: qaResult,
      resumeText: input.resumeText,
      jobDescription: input.jobDescription,
  };

  await saveToDb(input.userId, dataToSave);
  return qaResult;
}

export async function runInterviewGenerationAction(input: GenerateInterviewQuestionsInput & { userId: string }) {
  const validatedFields = interviewSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  const interview = await generateInterviewQuestions(validatedFields.data);
  await saveToDb(input.userId, { interview, resumeText: input.resumeText, jobDescription: input.jobDescription });
  return interview;
}

export async function runImprovementsGenerationAction(input: {
  userId: string;
  resumeText: string;
  jobDescription: string;
  previousAnalysis?: AnalyzeResumeContentOutput | null;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  const improvements = await suggestResumeImprovements({
    resumeText: validatedFields.data.resumeText,
    jobDescription: validatedFields.data.jobDescription,
    previousAnalysis: input.previousAnalysis || undefined,
  });
  await saveToDb(input.userId, { improvements, resumeText: input.resumeText, jobDescription: input.jobDescription });
  return improvements;
}

export async function updateUserProfile(userId: string, formData: FormData): Promise<{ displayName: string; photoURL?: string }> {
  const displayName = formData.get('displayName') as string;
  const photoURL = formData.get('photoURL') as string | null; // Now expecting the URL from client-side Supabase upload

  if (!userId) {
    throw new Error('User ID is required.');
  }

  const profileData: { displayName?: string; photoURL?: string } = {};
  if (displayName) {
    profileData.displayName = displayName;
  }
  if (photoURL) {
    profileData.photoURL = photoURL;
  }
  
  if (Object.keys(profileData).length > 0) {
    await updateUserProfileInDb(userId, profileData);
  }

  return {
    displayName: displayName,
    photoURL: photoURL || undefined,
  };
}

export async function exportDocx(text: string) {
  const doc = new Document({
    sections: [
      {
        children: text.split('\n').map(
          p =>
            new Paragraph({
              children: [new TextRun(p)],
            })
        ),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.toString('base64');
}

const jobUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export async function enhanceJobDescriptionAction(input: {
  jobDescription: string;
  jobRole?: string;
}) {
  try {
    // Basic enhancement logic without AI (can be replaced with AI later)
    const originalDesc = input.jobDescription.trim();
    
    // Add basic enhancements
    let enhanced = originalDesc;
    const addedSections: string[] = [];
    const improvements: string[] = [];
    
    // Add role-specific enhancements if role is provided
    if (input.jobRole) {
      const roleSpecificContent = getRoleSpecificContent(input.jobRole);
      if (roleSpecificContent) {
        enhanced += `\n\n${roleSpecificContent}`;
        addedSections.push('Role-specific requirements');
        improvements.push('Added role-specific technical requirements');
      }
    }
    
    // Add generic professional sections if missing
    if (!enhanced.toLowerCase().includes('benefits') && !enhanced.toLowerCase().includes('perks')) {
      enhanced += `\n\nBenefits & Perks:
• Competitive salary and equity packages
• Comprehensive health, dental, and vision insurance
• 401(k) matching and retirement planning
• Flexible work arrangements and remote options
• Professional development and learning opportunities
• Collaborative and inclusive work environment`;
      addedSections.push('Benefits & Perks');
      improvements.push('Added comprehensive benefits section');
    }
    
    if (!enhanced.toLowerCase().includes('growth') && !enhanced.toLowerCase().includes('career')) {
      enhanced += `\n\nGrowth Opportunities:
• Career advancement pathways with clear progression
• Mentorship programs and leadership development
• Conference attendance and continued education support
• Cross-functional project exposure
• Innovation time for personal projects`;
      addedSections.push('Growth Opportunities');
      improvements.push('Added career growth information');
    }
    
    improvements.push('Improved formatting and structure');
    
    return {
      originalDescription: originalDesc,
      enhancedDescription: enhanced,
      addedSections,
      improvements,
    };
  } catch (error: any) {
    console.error('Job description enhancement error:', error);
    return {
      originalDescription: input.jobDescription,
      enhancedDescription: input.jobDescription,
      addedSections: [],
      improvements: ['Enhancement service temporarily unavailable'],
    };
  }
}

function getRoleSpecificContent(jobRole: string): string | null {
  const roleContent: Record<string, string> = {
    "Frontend Developer": `
Technical Requirements:
• Proficiency in HTML5, CSS3, and modern JavaScript (ES6+)
• Experience with React, Vue.js, or Angular frameworks
• Knowledge of responsive design and cross-browser compatibility
• Familiarity with build tools like Webpack, Vite, or Parcel
• Understanding of version control systems (Git)
• Experience with CSS preprocessors (Sass, Less) and CSS-in-JS
• Knowledge of testing frameworks (Jest, Cypress, Testing Library)`,
    
    "Backend Developer": `
Technical Requirements:
• Strong experience with server-side languages (Node.js, Python, Java, C#, Go)
• Proficiency in database design and management (SQL, NoSQL)
• Experience with RESTful API design and implementation
• Knowledge of cloud platforms (AWS, Azure, GCP)
• Understanding of microservices architecture
• Experience with containerization (Docker, Kubernetes)
• Familiarity with CI/CD pipelines and DevOps practices`,
    
    "Full Stack Developer": `
Technical Requirements:
• Frontend: React, Vue.js, or Angular with modern JavaScript/TypeScript
• Backend: Node.js, Python, or Java with framework experience
• Database: SQL and NoSQL database design and optimization
• Cloud: AWS, Azure, or GCP deployment and scaling
• DevOps: Docker, CI/CD, and infrastructure as code
• API: RESTful services and GraphQL implementation
• Testing: Unit, integration, and end-to-end testing strategies`,
    
    "DevOps Engineer": `
Technical Requirements:
• Infrastructure as Code (Terraform, CloudFormation, Pulumi)
• Container orchestration (Kubernetes, Docker Swarm)
• CI/CD pipeline design and implementation
• Cloud platforms expertise (AWS, Azure, GCP)
• Monitoring and logging solutions (Prometheus, Grafana, ELK stack)
• Automation scripting (Python, Bash, PowerShell)
• Security best practices and compliance frameworks`,
  };
  
  return roleContent[jobRole] || null;
}

export async function extractJobDescriptionFromUrl(url: string) {
  try {
    // Validate URL
    const validatedData = jobUrlSchema.parse({ url });
    
    // Set headers to mimic a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };

    // Fetch the webpage
    const response = await axios.get(validatedData.url, { 
      headers,
      timeout: 10000, // 10 second timeout
      maxRedirects: 3,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract job information based on common job site patterns
    let jobTitle = '';
    let company = '';
    let location = '';
    let description = '';
    let requirements = '';
    let benefits = '';

    // LinkedIn job posts
    if (url.includes('linkedin.com')) {
      jobTitle = $('.t-24.t-bold.inline').text().trim() || 
                $('h1[data-test-id="job-title"]').text().trim() ||
                $('h1.jobs-unified-top-card__job-title').text().trim();
      
      company = $('.jobs-unified-top-card__company-name').text().trim() ||
               $('a[data-test-id="job-poster-name"]').text().trim();
      
      location = $('.jobs-unified-top-card__bullet').text().trim();
      
      description = $('.jobs-description__content').text().trim() ||
                   $('.jobs-box__html-content').text().trim();
    }
    
    // Indeed job posts
    else if (url.includes('indeed.com')) {
      jobTitle = $('[data-testid="jobsearch-JobInfoHeader-title"]').text().trim() ||
                $('h1.jobsearch-JobInfoHeader-title').text().trim();
      
      company = $('[data-testid="inlineHeader-companyName"]').text().trim() ||
               $('.jobsearch-CompanyInfoContainer').text().trim();
      
      location = $('[data-testid="job-location"]').text().trim();
      
      description = $('#jobDescriptionText').text().trim() ||
                   $('.jobsearch-jobDescriptionText').text().trim();
    }
    
    // Glassdoor job posts
    else if (url.includes('glassdoor.com')) {
      jobTitle = $('[data-test="job-title"]').text().trim() ||
                $('.css-17x2pwl.e11nt52q6').text().trim();
      
      company = $('[data-test="employer-name"]').text().trim();
      location = $('[data-test="job-location"]').text().trim();
      description = $('[data-test="jobDescriptionContent"]').text().trim();
    }
    
    // Generic fallback for other sites
    else {
      // Try common selectors
      jobTitle = $('h1').first().text().trim() ||
                $('.job-title, .position-title, [class*="title"]').first().text().trim();
      
      company = $('.company-name, [class*="company"]').first().text().trim();
      location = $('.location, [class*="location"]').first().text().trim();
      
      // Look for job description in common containers
      description = $('.job-description, .description, [class*="description"], [class*="content"]')
                   .map((i, el) => $(el).text().trim())
                   .get()
                   .join('\n\n')
                   .substring(0, 3000); // Limit to prevent too much text
    }

    // Clean up the extracted text
    const cleanText = (text: string) => {
      return text
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();
    };

    // Format the extracted job description
    let formattedDescription = '';
    
    if (jobTitle) formattedDescription += `Job Title: ${cleanText(jobTitle)}\n\n`;
    if (company) formattedDescription += `Company: ${cleanText(company)}\n`;
    if (location) formattedDescription += `Location: ${cleanText(location)}\n\n`;
    
    if (description) {
      formattedDescription += `Job Description:\n${cleanText(description)}`;
    }

    // If we didn't extract much, fall back to getting all text content
    if (formattedDescription.length < 200) {
      const bodyText = $('body').text().trim();
      const cleanBodyText = cleanText(bodyText);
      
      if (cleanBodyText.length > 200) {
        formattedDescription = `Extracted content from: ${url}\n\n${cleanBodyText.substring(0, 2000)}...`;
      }
    }

    if (!formattedDescription || formattedDescription.length < 100) {
      return {
        success: false,
        error: 'Could not extract meaningful job description from this URL. The page might be protected or use dynamic content loading.',
      };
    }

    return {
      success: true,
      data: {
        jobTitle: cleanText(jobTitle),
        company: cleanText(company),
        location: cleanText(location),
        description: formattedDescription,
        url: validatedData.url,
      },
    };

  } catch (error: any) {
    console.error('Job extraction error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: 'Could not connect to the website. Please check the URL and try again.',
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timed out. The website might be slow or unavailable.',
      };
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return {
        success: false,
        error: 'Access denied. This website blocks automated requests.',
      };
    }
    
    if (error.response?.status === 404) {
      return {
        success: false,
        error: 'Job posting not found. The URL might be incorrect or the posting might have been removed.',
      };
    }

    return {
      success: false,
      error: 'Failed to extract job description. Please copy the job description manually.',
    };
  }
}

// Server-side PDF export removed - now using client-side jsPDF in improvement page
