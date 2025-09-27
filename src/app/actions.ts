'use server';

import {z} from 'zod';
import {analyzeResumeContent} from '@/ai/flows/analyze-resume-content';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import {generateInterviewQuestions} from '@/ai/flows/generate-interview-questions';
import {generateResumeQA} from '@/ai/flows/generate-resume-qa';
import {suggestResumeImprovements} from '@/ai/flows/suggest-resume-improvements';
import {Packer, Document, Paragraph, TextRun} from 'docx';
import PDFDocument from 'pdfkit';
import mammoth from 'mammoth';
import pdf from 'pdf-parse-fork';
import { saveData as saveToDb, clearData as clearFromDb } from '@/lib/firestore';
import type { AnalysisResult } from '@/lib/types';
import type { AnalyzeResumeContentOutput } from '@/ai/flows/analyze-resume-content';

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

export async function exportPdf(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72,
      },
    });
    const buffers: any[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData.toString('base64'));
    });
    doc.on('error', reject);
    doc.font('Helvetica').fontSize(12).text(text, {
      align: 'left',
    });
    doc.end();
  });
}
