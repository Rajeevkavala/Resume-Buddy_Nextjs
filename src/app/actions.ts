
'use server';

import {z} from 'zod';
import {analyzeResumeContent} from '@/ai/flows/analyze-resume-content';
import {generateInterviewQuestions} from '@/ai/flows/generate-interview-questions';
import {generateResumeQA} from '@/ai/flows/generate-resume-qa';
import {suggestResumeImprovements} from '@/ai/flows/suggest-resume-improvements';
import {Packer, Document, Paragraph, TextRun} from 'docx';
import PDFDocument from 'pdfkit';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const baseSchema = z.object({
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

export async function runAnalysisAction(input: {
  resumeText: string;
  jobDescription: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  return await analyzeResumeContent(validatedFields.data);
}

export async function runQAGenerationAction(input: {
  resumeText: string;
  jobDescription: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  return await generateResumeQA({
    resumeText: validatedFields.data.resumeText,
    topic: 'General',
  });
}

export async function runInterviewGenerationAction(input: {
  resumeText: string;
  jobDescription: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  return await generateInterviewQuestions({
    ...validatedFields.data,
    numQuestions: 5,
  });
}

export async function runImprovementsGenerationAction(input: {
  resumeText: string;
  jobDescription: string;
}) {
  const validatedFields = baseSchema.safeParse(input);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }
  return await suggestResumeImprovements(validatedFields.data);
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
