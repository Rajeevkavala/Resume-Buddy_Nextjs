
'use server';

import {z} from 'zod';
import {analyzeResumeContent} from '@/ai/flows/analyze-resume-content';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import {generateInterviewQuestions} from '@/ai/flows/generate-interview-questions';
import {generateResumeQA} from '@/ai/flows/generate-resume-qa';
import {suggestResumeImprovements} from '@/ai/flows/suggest-resume-improvements';
import {structureJobDescription} from '@/ai/flows/structure-job-description';
import {parseResumeIntelligently} from '@/ai/flows/parse-resume-intelligently';
import {Packer, Document, Paragraph, TextRun, HeadingLevel} from 'docx';
import mammoth from 'mammoth';
import pdf from 'pdf-parse-fork';
import { saveData as saveToDb, clearData as clearFromDb, updateUserProfileInDb } from '@/lib/firestore';
import type { AnalysisResult, JobRole } from '@/lib/types';
import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getJobDescriptionForRole, shouldUsePreset } from '@/lib/job-description-presets';

const baseSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  resumeText: z
    .string()
    .min(100, 'Resume text is too short. Please provide a more detailed resume.'),
  jobDescription: z
    .string()
    .optional(),
  jobRole: z.string().optional(),
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
  jobDescription?: string;
  jobRole?: JobRole | '';
  jobUrl?: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  
  // Determine the job description to use
  let finalJobDescription = input.jobDescription || '';
  const jobRoleValue = (input.jobRole && input.jobRole.length > 0 ? input.jobRole : undefined) as JobRole | undefined;
  
  // Use preset if job description is missing or too short and a role is selected
  if (shouldUsePreset(finalJobDescription, jobRoleValue)) {
    if (jobRoleValue) {
      finalJobDescription = getJobDescriptionForRole(jobRoleValue);
    } else {
      throw new Error('Please provide either a job description or select a target role.');
    }
  }
  
  const analysis = await analyzeResumeContent({
    resumeText: validatedFields.data.resumeText,
    jobDescription: finalJobDescription,
  });
  
  // Prepare data for saving - exclude undefined values
  const dataToSave: any = { 
    analysis, 
    resumeText: input.resumeText, 
    jobDescription: finalJobDescription,
  };
  
  if (jobRoleValue) {
    dataToSave.jobRole = jobRoleValue;
  }
  
  if (input.jobUrl) {
    dataToSave.jobUrl = input.jobUrl;
  }
  
  await saveToDb(input.userId, dataToSave);
  return analysis;
}

export async function runQAGenerationAction(input: {
  userId: string;
  resumeText: string;
  jobDescription?: string;
  topic: "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";
  numQuestions: number;
  jobRole?: JobRole | '';
  jobUrl?: string;
}) {
  const validatedFields = qaSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  
  // Determine the job description to use
  let finalJobDescription = input.jobDescription || '';
  const jobRoleValue = (input.jobRole && input.jobRole.length > 0 ? input.jobRole : undefined) as JobRole | undefined;
  
  // Use preset if job description is missing or too short and a role is selected
  if (shouldUsePreset(finalJobDescription, jobRoleValue)) {
    if (jobRoleValue) {
      finalJobDescription = getJobDescriptionForRole(jobRoleValue);
    }
  }
  
  const qaResult = await generateResumeQA({
    resumeText: validatedFields.data.resumeText,
    topic: validatedFields.data.topic,
    numQuestions: validatedFields.data.numQuestions,
  });

  // Prepare data for saving - exclude undefined values
  const dataToSave: any = {
      [`qa.${input.topic}`]: qaResult,
      resumeText: input.resumeText,
      jobDescription: finalJobDescription,
  };
  
  if (jobRoleValue) {
    dataToSave.jobRole = jobRoleValue;
  }
  
  if (input.jobUrl) {
    dataToSave.jobUrl = input.jobUrl;
  }

  await saveToDb(input.userId, dataToSave);
  return qaResult;
}

export async function runInterviewGenerationAction(input: GenerateInterviewQuestionsInput & { userId: string; jobRole?: JobRole | ''; jobUrl?: string; jobDescription?: string }) {
  const validatedFields = interviewSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  
  // Determine the job description to use
  let finalJobDescription = input.jobDescription || '';
  const jobRoleValue = (input.jobRole && input.jobRole.length > 0 ? input.jobRole : undefined) as JobRole | undefined;
  
  // Use preset if job description is missing or too short and a role is selected
  if (shouldUsePreset(finalJobDescription, jobRoleValue)) {
    if (jobRoleValue) {
      finalJobDescription = getJobDescriptionForRole(jobRoleValue);
    } else {
      throw new Error('Please provide either a job description or select a target role.');
    }
  }
  
  const interview = await generateInterviewQuestions({
    resumeText: validatedFields.data.resumeText,
    jobDescription: finalJobDescription,
    numQuestions: validatedFields.data.numQuestions,
    interviewType: validatedFields.data.interviewType,
    difficultyLevel: validatedFields.data.difficultyLevel,
  });
  
  // Prepare data for saving - exclude undefined values
  const dataToSave: any = { 
    interview, 
    resumeText: input.resumeText, 
    jobDescription: finalJobDescription,
  };
  
  if (jobRoleValue) {
    dataToSave.jobRole = jobRoleValue;
  }
  
  if (input.jobUrl) {
    dataToSave.jobUrl = input.jobUrl;
  }
  
  await saveToDb(input.userId, dataToSave);
  return interview;
}

export async function runImprovementsGenerationAction(input: {
  userId: string;
  resumeText: string;
  jobDescription?: string;
  previousAnalysis?: AnalyzeResumeContentOutput | null;
  jobRole?: JobRole | '';
  jobUrl?: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  
  // Determine the job description to use
  let finalJobDescription = input.jobDescription || '';
  const jobRoleValue = (input.jobRole && input.jobRole.length > 0 ? input.jobRole : undefined) as JobRole | undefined;
  
  // Use preset if job description is missing or too short and a role is selected
  if (shouldUsePreset(finalJobDescription, jobRoleValue)) {
    if (jobRoleValue) {
      finalJobDescription = getJobDescriptionForRole(jobRoleValue);
    } else {
      throw new Error('Please provide either a job description or select a target role.');
    }
  }
  
  const improvements = await suggestResumeImprovements({
    resumeText: validatedFields.data.resumeText,
    jobDescription: finalJobDescription,
    previousAnalysis: input.previousAnalysis || undefined,
  });
  
  // Prepare data for saving - exclude undefined values
  const dataToSave: any = { 
    improvements, 
    resumeText: input.resumeText, 
    jobDescription: finalJobDescription,
  };
  
  if (jobRoleValue) {
    dataToSave.jobRole = jobRoleValue;
  }
  
  if (input.jobUrl) {
    dataToSave.jobUrl = input.jobUrl;
  }
  
  await saveToDb(input.userId, dataToSave);
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
  if (!text || text.trim().length === 0) {
    throw new Error('Resume text is empty');
  }

  // Parse the text into sections and format accordingly
  const sections = text.split('\n\n');
  const paragraphs: Paragraph[] = [];

  for (const section of sections) {
    const lines = section.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detect headers (all caps, ends with colon, or starts with ###)
      const isHeader = line === line.toUpperCase() || 
                      line.endsWith(':') || 
                      line.startsWith('#');
      
      // Clean markdown
      const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      
      if (isHeader) {
        // Create header paragraph
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanLine,
                bold: true,
                size: 28, // 14pt
                color: '1a1a1a',
              })
            ],
            spacing: {
              before: i === 0 ? 0 : 200, // Extra space before headers (except first)
              after: 100,
            },
            heading: HeadingLevel.HEADING_2,
          })
        );
      } else {
        // Regular paragraph with better formatting
        // Check if it's a bullet point
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const displayText = isBullet ? cleanLine.replace(/^[•\-*]\s*/, '') : cleanLine;
        
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: displayText,
                size: 22, // 11pt
                color: '333333',
              })
            ],
            spacing: {
              before: 40,
              after: 40,
            },
            bullet: isBullet ? { level: 0 } : undefined,
          })
        );
      }
    }
    
    // Add spacing between sections
    if (sections.indexOf(section) < sections.length - 1) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun('')],
          spacing: { before: 100, after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: paragraphs,
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    };

    // Fetch the webpage
    const response = await axios.get(validatedData.url, { 
      headers,
      timeout: 15000, // 15 second timeout
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 4xx errors too
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unnecessary elements but keep the content
    $('script, style, noscript, iframe, nav, header, footer, aside').remove();
    $('<!--').remove();

    // Helper function to clean text
    const cleanText = (text: string) => {
      return text
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n\s*\n+/g, '\n\n') // Clean up excessive line breaks
        .trim();
    };

    // STEP 1: Extract full page content with priority-based approach
    let rawContent = '';
    let extractionMethod = '';

    // Try site-specific selectors first for better content quality
    if (url.includes('linkedin.com')) {
      const content = $('.jobs-description__content, .jobs-box__html-content, .description__text').text();
      if (content.length > 500) {
        rawContent = content;
        extractionMethod = 'LinkedIn-specific';
      }
    } else if (url.includes('indeed.com')) {
      const content = $('#jobDescriptionText, .jobsearch-jobDescriptionText, [id*="jobDescriptionText"]').text();
      if (content.length > 500) {
        rawContent = content;
        extractionMethod = 'Indeed-specific';
      }
    } else if (url.includes('glassdoor.com')) {
      const content = $('[data-test="jobDescriptionContent"], .jobDescriptionContent, [class*="JobDetails_jobDescription"]').text();
      if (content.length > 500) {
        rawContent = content;
        extractionMethod = 'Glassdoor-specific';
      }
    } else if (url.includes('monster.com')) {
      const content = $('[data-test-id="job-description-content"]').text();
      if (content.length > 500) {
        rawContent = content;
        extractionMethod = 'Monster-specific';
      }
    } else if (url.includes('ziprecruiter.com')) {
      const content = $('.job_description, [itemprop="description"]').text();
      if (content.length > 500) {
        rawContent = content;
        extractionMethod = 'ZipRecruiter-specific';
      }
    }

    // Fallback: Try main content containers
    if (!rawContent || rawContent.length < 500) {
      const selectors = [
        'main',
        'article',
        '[role="main"]',
        '[class*="job-description"]',
        '[class*="jobDescription"]',
        '[id*="description"]',
        '.content',
        '#content',
      ];

      for (const selector of selectors) {
        const content = $(selector).text().trim();
        if (content.length > rawContent.length && content.length > 500) {
          rawContent = content;
          extractionMethod = `Generic: ${selector}`;
        }
      }
    }

    // Final fallback: Get entire body content
    if (!rawContent || rawContent.length < 500) {
      rawContent = $('body').text().trim();
      extractionMethod = 'Full body extraction';
    }

    // Clean the extracted content
    rawContent = cleanText(rawContent);

    // Validate we have enough content
    if (!rawContent || rawContent.length < 200) {
      return {
        success: false,
        error: 'Could not extract meaningful content from this URL. The page might be protected, use dynamic content loading, or require authentication.',
      };
    }

    // STEP 2: Use AI to structure the raw content
    try {
      const structuredData = await structureJobDescription({
        rawContent: rawContent.substring(0, 15000), // Limit to prevent token overflow
        url: validatedData.url,
      });

      // Validate that we got meaningful structured data
      if (!structuredData.jobTitle || structuredData.responsibilities.length === 0) {
        return {
          success: false,
          error: 'Could not identify job details from the content. Please ensure the URL points to a job posting.',
        };
      }

      // Return the AI-structured data
      return {
        success: true,
        data: {
          jobTitle: structuredData.jobTitle,
          company: structuredData.company || 'Not specified',
          location: structuredData.location || 'Not specified',
          description: structuredData.formattedDescription,
          url: validatedData.url,
        },
      };

    } catch (aiError: any) {
      // If AI fails, return raw content as fallback
      return {
        success: true,
        data: {
          jobTitle: 'Job Position',
          company: 'See description',
          location: 'See description',
          description: `Extracted content from: ${validatedData.url}\n\n${rawContent.substring(0, 3000)}`,
          url: validatedData.url,
        },
      };
    }

  } catch (error: any) {
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

// AI-powered intelligent resume parsing action
export async function parseResumeIntelligentlyAction(
  resumeText: string
): Promise<{success: boolean; data?: any; error?: string}> {
  try {
    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'Resume text is too short. Please provide a more detailed resume.',
      };
    }

    const result = await parseResumeIntelligently({ resumeText });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse resume with AI. Please try again.',
    };
  }
}

// Server-side PDF export removed - now using client-side jsPDF in improvement page
