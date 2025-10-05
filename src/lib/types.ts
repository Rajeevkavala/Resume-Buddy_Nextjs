import type {AnalyzeResumeContentOutput} from '@/ai/flows/analyze-resume-content';
import type {GenerateInterviewQuestionsOutput} from '@/ai/flows/generate-interview-questions';
import type {GenerateResumeQAOutput} from '@/ai/flows/generate-resume-qa';
import type {SuggestResumeImprovementsOutput} from '@/ai/flows/suggest-resume-improvements';

// Re-export AI flow types for easier imports
export type { AnalyzeResumeContentOutput, GenerateInterviewQuestionsOutput, GenerateResumeQAOutput, SuggestResumeImprovementsOutput };

export type QATopic = "General" | "Technical" | "Work Experience" | "Projects" | "Career Goals" | "Education";

export type JobRole = 
  | "Frontend Developer"
  | "Backend Developer" 
  | "Full Stack Developer"
  | "DevOps Engineer"
  | "Data Scientist"
  | "Mobile Developer"
  | "UI/UX Designer"
  | "Product Manager"
  | "QA Engineer"
  | "Software Engineer"
  | "Other";

export type AnalysisResult = {
  resumeText?: string;
  jobDescription?: string;
  jobRole?: JobRole;
  jobUrl?: string;
  analysis?: AnalyzeResumeContentOutput | null;
  qa?: Record<QATopic, GenerateResumeQAOutput | null> | null;
  interview?: GenerateInterviewQuestionsOutput | null;
  improvements?: SuggestResumeImprovementsOutput | null;
  updatedAt?: string;
};

// Resume Template Types
export type Industry = "Tech" | "Creative" | "Corporate" | "Healthcare" | "Finance" | "Marketing" | "Education" | "Other";

export type ExperienceLevel = "Fresher" | "Mid-level" | "Senior" | "Executive";

export type TemplateLayout = "single-column" | "two-column" | "modern" | "classic" | "creative";

export type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
  text?: string;
};

export type FontPairing = {
  heading: string;
  body: string;
  accent?: string;
};

export type TemplateMetadata = {
  templateId: string;
  name: string;
  description: string;
  industry: Industry[];
  recommendedFor: JobRole[];
  experienceLevel: ExperienceLevel[];
  atsScore: number;
  layout: TemplateLayout;
  colorScheme: ColorScheme;
  fonts: FontPairing;
  thumbnail?: string;
  isPremium?: boolean;
};

export type SectionOrder = 
  | "header" 
  | "summary" 
  | "skills" 
  | "projects"
  | "experience" 
  | "educationAndCertifications";

export type TemplateStructure = {
  sections: SectionOrder[];
  emphasizedSections: SectionOrder[];
  contentDensity: "compact" | "balanced" | "spacious";
  visualElements: {
    useIcons: boolean;
    useDividers: boolean;
    useProgressBars: boolean;
    useTimeline: boolean;
  };
};

export type TemplateRecommendation = {
  metadata: TemplateMetadata;
  structure: TemplateStructure;
  rationale: {
    whySuitable: string;
    atsConsiderations: string[];
    industryNotes: string;
    customizationTips: string[];
  };
};

export type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  summary?: string;
  // New compact skills structure with predefined groups
  skills: {
    languages?: string[]; // JavaScript, TypeScript, Python, etc.
    frameworks?: string[]; // React, Next.js, Express, etc.
    databases?: string[]; // MongoDB, PostgreSQL, etc.
    tools?: string[]; // Git, Docker, VS Code, etc.
    cloud?: string[]; // AWS, Azure, Vercel, etc.
    other?: string[]; // Any additional skills
  };
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    achievements: string[]; // Limit to 2 bullet points max
  }[];
  // Merged education and certifications section
  educationAndCertifications: {
    education: {
      degree: string;
      institution: string;
      location: string;
      graduationDate: string;
      gpa?: string;
      honors?: string[];
      major?: string;
      minor?: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      date: string;
      expirationDate?: string;
      credentialId?: string;
    }[];
  };
  projects?: {
    name: string;
    description: string; // Limit to 1 line
    technologies: string[];
    link?: string;
    achievements: string[]; // Limit to 2 bullet points max
  }[];
  // Removed separate awards, languages, interests sections for compactness
};

export type TemplateCustomization = {
  templateId: string;
  colorScheme: ColorScheme;
  fonts: FontPairing;
  sectionOrder: SectionOrder[];
  spacing: "compact" | "normal" | "relaxed";
  fontSize: "small" | "medium" | "large";
};

export type ExportFormat = "pdf" | "docx" | "html";

export type ExportOptions = {
  format: ExportFormat;
  template: TemplateMetadata;
  customization: TemplateCustomization;
  includePhoto: boolean;
  watermark?: string;
};
