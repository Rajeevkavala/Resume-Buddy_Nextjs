/**
 * Modern Resume Export Utilities
 * Direct PDF and DOCX export from HTML/CSS
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ResumeData } from './types';

/**
 * Export resume to PDF using html2canvas + jsPDF
 * This captures the exact visual appearance
 */
export async function exportToPDF(
  elementId: string,
  filename: string = 'resume.pdf'
): Promise<void> {
  try {
    toast.loading('Generating PDF...', { id: 'pdf-export' });

    // Try multiple element selectors to find the resume content
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.getElementById('resume-preview-container');
    }
    if (!element) {
      element = document.querySelector('.resume-preview-container') as HTMLElement;
    }
    if (!element) {
      element = document.querySelector('.resume-container') as HTMLElement;
    }
    if (!element) {
      element = document.querySelector('[id*="resume"]') as HTMLElement;
    }
    
    if (!element) {
      throw new Error('Resume element not found. Please refresh and try again.');
    }

    console.log('Found element for PDF export:', element);

    // CRITICAL: Remove any parent transforms that could interfere
    const parentElement = element.parentElement;
    const grandParentElement = parentElement?.parentElement;
    const originalParentTransform = parentElement?.style.transform;
    const originalGrandParentTransform = grandParentElement?.style.transform;
    
    // Store original styles to restore later
    const originalStyles = {
      display: element.style.display,
      overflow: element.style.overflow,
      maxHeight: element.style.maxHeight,
      transform: element.style.transform,
      width: element.style.width,
      height: element.style.height
    };
    
    // Prepare element for capture
    element.style.display = 'block';
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    element.style.transform = 'none'; // Remove any zoom transforms
    element.style.width = '210mm';
    
    // Remove parent transforms
    if (parentElement) parentElement.style.transform = 'none';
    if (grandParentElement) grandParentElement.style.transform = 'none';
    
    // Find and prepare the resume container
    const resumeContainer = element.querySelector('.resume-container') as HTMLElement || element;
    if (resumeContainer && resumeContainer !== element) {
      resumeContainer.style.height = 'auto';
      resumeContainer.style.minHeight = 'auto';
      resumeContainer.style.overflow = 'visible';
    }

    // Apply export preparation styles
    element.classList.add('preparing-export');

    // Wait for layout to settle and ensure all content is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Wait for any dynamic content (like fonts or async components)
    await document.fonts.ready;
    
    // Additional wait for any animations or dynamic content to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Element dimensions before capture:', {
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      hasContent: element.textContent?.length || 0
    });

    // Final check that element has content
    if (!element.textContent?.trim()) {
      throw new Error('Resume content is empty. Please ensure the resume has loaded properly.');
    }
    
    // Capture the element as canvas with enhanced settings
    const canvas = await html2canvas(element, {
      scale: 2, // Good balance of quality and performance
      useCORS: true,
      logging: true, // Enable logging for debugging
      backgroundColor: '#ffffff',
      width: element.scrollWidth, // Capture full width
      height: element.scrollHeight, // Capture full height - no limits
      scrollY: 0,
      scrollX: 0,
      imageTimeout: 30000,
      removeContainer: false,
      allowTaint: false,
      foreignObjectRendering: true,
      ignoreElements: (element: Element) => {
        // Ignore any zoom controls or buttons
        return element.classList.contains('no-export') || 
               element.tagName === 'BUTTON' ||
               element.getAttribute('role') === 'button';
      },
      onclone: (clonedDoc, clonedElement) => {
        // Apply print styles to cloned document
        const resumeEl = clonedElement.querySelector('.resume-preview-container') ||
                        clonedElement.querySelector('.resume-container') ||
                        clonedElement;
        
        if (resumeEl) {
          (resumeEl as HTMLElement).classList.add('preparing-export');
          (resumeEl as HTMLElement).style.width = '210mm';
          (resumeEl as HTMLElement).style.fontOpticalSizing = 'auto';
          (resumeEl as HTMLElement).style.textRendering = 'optimizeLegibility';
          (resumeEl as HTMLElement).style.setProperty('-webkit-font-smoothing', 'antialiased');
          (resumeEl as HTMLElement).style.setProperty('-moz-osx-font-smoothing', 'grayscale');
        }
        
        // Ensure all fonts are loaded in cloned document
        const fontFaces = Array.from(document.fonts.values());
        return Promise.all(fontFaces.map(font => font.load()));
      }
    });

    console.log('Canvas captured successfully:', {
      width: canvas.width,
      height: canvas.height
    });

    // Check if canvas is empty (common cause of blank PDFs)
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas capture failed - element may be hidden or have no content');
    }

    // Restore original styles
    Object.entries(originalStyles).forEach(([property, value]) => {
      (element.style as any)[property] = value;
    });
    element.classList.remove('preparing-export');
    
    // Restore parent transforms
    if (parentElement && originalParentTransform) {
      parentElement.style.transform = originalParentTransform;
    }
    if (grandParentElement && originalGrandParentTransform) {
      grandParentElement.style.transform = originalGrandParentTransform;
    }
    
    if (resumeContainer) {
      resumeContainer.style.height = '';
      resumeContainer.style.minHeight = '';
      resumeContainer.style.maxHeight = '';
      resumeContainer.style.overflow = '';
    }

    // Convert to PDF with standard settings
    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG for text clarity
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false, // Don't compress to maintain quality
      precision: 16 // Higher precision for better rendering
    });

    // A4 dimensions: 210mm × 297mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    console.log('PDF dimensions:', { pdfWidth, pdfHeight, imgWidth, imgHeight });
    
    // Calculate scaling to fit width with margins
    const margin = 10; // 10mm margins
    const contentWidth = pdfWidth - (margin * 2);
    const scaleFactor = contentWidth / imgWidth;
    const scaledHeight = imgHeight * scaleFactor;
    
    console.log('Scaled dimensions:', { contentWidth, scaleFactor, scaledHeight });
    
    // If content fits on one page, add it directly
    if (scaledHeight <= pdfHeight - (margin * 2)) {
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        contentWidth,
        scaledHeight,
        undefined,
        'FAST'
      );
    } else {
      // Multi-page content - split across pages
      const pageContentHeight = pdfHeight - (margin * 2);
      let currentY = 0;
      let pageNumber = 0;
      
      while (currentY < imgHeight) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        // Calculate how much of the image to show on this page
        const sourceY = currentY;
        const sourceHeight = Math.min(imgHeight - currentY, pageContentHeight / scaleFactor);
        
        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Draw the portion of the original canvas onto the page canvas
          pageCtx.drawImage(
            canvas,
            0, sourceY,           // Source position
            imgWidth, sourceHeight, // Source dimensions
            0, 0,                  // Destination position
            imgWidth, sourceHeight  // Destination dimensions
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          const scaledPageHeight = sourceHeight * scaleFactor;
          
          pdf.addImage(
            pageImgData,
            'PNG',
            margin,
            margin,
            contentWidth,
            scaledPageHeight,
            undefined,
            'FAST'
          );
        }
        
        currentY += sourceHeight;
        pageNumber++;
      }
    }

    // Save the PDF
    pdf.save(filename);

    toast.success('PDF exported successfully!', { id: 'pdf-export' });
  } catch (error) {
    console.error('PDF export error:', error);
    toast.error('Failed to export PDF. Please try again.', { id: 'pdf-export' });
  }
}

/**
 * Export resume to DOCX format
 */
export async function exportToDOCX(
  resumeData: ResumeData,
  filename: string = 'resume.docx'
): Promise<void> {
  try {
    toast.loading('Generating DOCX...', { id: 'docx-export' });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header with name
            new Paragraph({
              text: resumeData.personalInfo.fullName,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            // Contact info
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: [
                    resumeData.personalInfo.email,
                    resumeData.personalInfo.phone,
                    resumeData.personalInfo.location,
                  ]
                    .filter(Boolean)
                    .join(' | '),
                }),
              ],
              spacing: { after: 400 },
            }),

            // Summary
            ...(resumeData.summary
              ? [
                  new Paragraph({
                    text: 'PROFESSIONAL SUMMARY',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    text: resumeData.summary,
                    spacing: { after: 300 },
                  }),
                ]
              : []),

            // Experience
            new Paragraph({
              text: 'PROFESSIONAL EXPERIENCE',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            ...resumeData.experience.flatMap((exp) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.title,
                    bold: true,
                  }),
                  new TextRun({
                    text: ` | ${exp.company}`,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate} | ${exp.location}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 100 },
              }),
              ...exp.achievements.map(
                (achievement) =>
                  new Paragraph({
                    text: `• ${achievement}`,
                    spacing: { after: 50 },
                    indent: { left: 360 },
                  })
              ),
              new Paragraph({ text: '', spacing: { after: 200 } }),
            ]),

            // Education
            new Paragraph({
              text: 'EDUCATION',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            ...resumeData.education.flatMap((edu) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree,
                    bold: true,
                  }),
                ],
                spacing: { after: 50 },
              }),
              new Paragraph({
                text: `${edu.institution} | ${edu.graduationDate}`,
                spacing: { after: 200 },
              }),
            ]),

            // Skills
            ...(resumeData.skills.length > 0
              ? [
                  new Paragraph({
                    text: 'SKILLS',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...resumeData.skills.map(
                    (skill) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${skill.category}: `,
                            bold: true,
                          }),
                          new TextRun({
                            text: skill.items.join(', '),
                          }),
                        ],
                        spacing: { after: 100 },
                      })
                  ),
                ]
              : []),

            // Projects
            ...(resumeData.projects && resumeData.projects.length > 0
              ? [
                  new Paragraph({
                    text: 'PROJECTS',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...resumeData.projects.flatMap((project) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.name,
                          bold: true,
                        }),
                        new TextRun({
                          text: ` | ${project.technologies.join(', ')}`,
                        }),
                      ],
                      spacing: { after: 50 },
                    }),
                    new Paragraph({
                      text: project.description,
                      spacing: { after: 100 },
                    }),
                    ...project.achievements.map(
                      (achievement) =>
                        new Paragraph({
                          text: `• ${achievement}`,
                          spacing: { after: 50 },
                          indent: { left: 360 },
                        })
                    ),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                  ]),
                ]
              : []),

            // Certifications
            ...(resumeData.certifications && resumeData.certifications.length > 0
              ? [
                  new Paragraph({
                    text: 'CERTIFICATIONS',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  ...resumeData.certifications.map(
                    (cert) =>
                      new Paragraph({
                        text: `${cert.name} | ${cert.issuer} | ${cert.date}`,
                        spacing: { after: 100 },
                      })
                  ),
                ]
              : []),
          ],
        },
      ],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);

    toast.success('DOCX exported successfully!', { id: 'docx-export' });
  } catch (error) {
    console.error('DOCX export error:', error);
    toast.error('Failed to export DOCX. Please try again.', { id: 'docx-export' });
  }
}

/**
 * Print resume (opens browser print dialog)
 */
export function printResume(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error('Resume not found');
    return;
  }

  // Create print window
  const printWindow = window.open('', '', 'height=800,width=800');
  if (!printWindow) {
    toast.error('Please allow popups to print');
    return;
  }

  // Get all stylesheets from the current page
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(link => {
      if (link.tagName === 'LINK') {
        return `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`;
      } else {
        return `<style>${link.innerHTML}</style>`;
      }
    })
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Resume</title>
        <meta charset="utf-8">
        ${stylesheets}
        <style>
          body { 
            margin: 0; 
            padding: 10px; 
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
          }
          
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            
            body { 
              margin: 0; 
              padding: 0;
              font-size: 10pt;
              line-height: 1.4;
            }
            
            .resume-container {
              width: 100%;
              overflow: visible;
            }
            
            h1 { font-size: 18pt; margin-bottom: 6pt; line-height: 1.2; }
            h2 { font-size: 13pt; margin-bottom: 4pt; margin-top: 8pt; line-height: 1.2; }
            h3 { font-size: 11pt; margin-bottom: 3pt; margin-top: 5pt; line-height: 1.2; }
            
            p { margin-bottom: 6pt; line-height: 1.4; }
            ul, ol { margin-bottom: 6pt; padding-left: 15pt; }
            li { margin-bottom: 2pt; font-size: 10pt; line-height: 1.4; }
            
            .experience-item,
            .education-item,
            .project-item {
              margin-bottom: 12pt;
              page-break-inside: avoid;
            }
            
            .no-print,
            button,
            .export-buttons,
            .zoom-controls {
              display: none !important;
            }
          }
          
          @media screen {
            .resume-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
