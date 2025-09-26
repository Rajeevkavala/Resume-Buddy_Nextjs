'use server';

import { z } from 'zod';
import { analyzeResumeContent } from '@/ai/flows/analyze-resume-content';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { generateResumeQA } from '@/ai/flows/generate-resume-qa';
import { suggestResumeImprovements } from '@/ai/flows/suggest-resume-improvements';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';

const analysisInputSchema = z.object({
  resumeText: z.string().min(100, 'Resume text is too short. Please provide a more detailed resume.'),
  jobDescription: z.string().min(100, 'Job description is too short. Please provide a more detailed job description.'),
});

export async function runAnalysis(prevState: any, formData: FormData) {
  try {
    const validatedFields = analysisInputSchema.safeParse({
      resumeText: formData.get('resumeText'),
      jobDescription: formData.get('jobDescription'),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.errors.map((e) => e.message).join(', '),
        data: null,
      };
    }

    const { resumeText, jobDescription } = validatedFields.data;

    const [analysis, qa, interview, improvements] = await Promise.all([
      analyzeResumeContent({ resumeText, jobDescription }),
      generateResumeQA({ resumeText, topic: 'General' }),
      generateInterviewQuestions({ resumeText, jobDescription, numQuestions: 5 }),
      suggestResumeImprovements({ resumeText, jobDescription }),
    ]);

    return {
      data: { analysis, qa, interview, improvements },
      error: null,
    };
  } catch (error) {
    console.error('Error during analysis:', error);
    return {
      ...prevState,
      error: 'An unexpected error occurred during analysis. Please try again.',
      data: null,
    };
  }
}

export async function exportDocx(text: string) {
  const doc = new Document({
    sections: [
      {
        children: text.split('\n').map(
          (p) =>
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
            right: 72
          }
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
