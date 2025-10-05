/**
 * Resume Template Export Utilities
 * Provides functions to export resumes in PDF, DOCX, and HTML formats with template support
 */

import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2canvas from 'html2canvas';
import { ResumeData, TemplateMetadata, TemplateCustomization, ExportOptions } from '@/lib/types';

/**
 * Export resume as PDF with optional template
 */
export async function exportResumeAsPDF(
  resumeData: ResumeData,
  options?: Partial<ExportOptions>
): Promise<Blob> {
  const elementId = 'resume-preview-container';
  let element = document.getElementById(elementId);
  
  if (!element) {
    // Fallback: try to find the resume preview element by class
    element = document.querySelector('.resume-container') as HTMLElement;
    if (!element) {
      throw new Error('Resume preview element not found');
    }
  }

  try {
    // Apply print styles temporarily for accurate PDF rendering
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible';

    // Wait for any dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture HTML as canvas with optimized settings
    const canvas = await html2canvas(element, {
      scale: 3, // Higher resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: Math.min(element.scrollHeight, 1120), // Limit height to A4 equivalent pixels
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123, // A4 height in pixels at 96 DPI
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Apply print styles to cloned document
        const clonedElement = clonedDoc.getElementById(elementId) || clonedDoc.querySelector('.resume-container');
        if (clonedElement) {
          // Ensure font rendering is optimal
          (clonedElement as HTMLElement).style.fontOpticalSizing = 'auto';
          (clonedElement as HTMLElement).style.textRendering = 'optimizeLegibility';
        }
      }
    });

    // Restore original styles
    element.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false // Don't compress to maintain quality
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Ensure the resume fits on one page by scaling if necessary
    if (imgHeight > pageHeight) {
      const scaleFactor = pageHeight / imgHeight;
      const scaledWidth = imgWidth * scaleFactor;
      const scaledHeight = pageHeight;
      const xOffset = (imgWidth - scaledWidth) / 2; // Center horizontally
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    } else {
      // Image fits within one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    
    return pdf.output('blob');
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Export resume as DOCX with optional template
 */
export async function exportResumeAsDOCX(
  resumeData: ResumeData,
  options?: Partial<ExportOptions>
): Promise<Blob> {
  const { personalInfo, summary, experience, education, skills, projects, certifications, awards } = resumeData;
  const colors = options?.customization?.colorScheme || options?.template?.colorScheme;

  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header Section
          new Paragraph({
            text: personalInfo.fullName,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          
          // Contact Information
          new Paragraph({
            children: [
              new TextRun({
                text: `${personalInfo.email} | ${personalInfo.phone}${personalInfo.location ? ` | ${personalInfo.location}` : ''}`,
                size: 20
              })
            ],
            spacing: { after: 300 }
          }),

          // LinkedIn and GitHub
          ...(personalInfo.linkedin || personalInfo.github ? [
            new Paragraph({
              children: [
                ...(personalInfo.linkedin ? [new TextRun({ text: `LinkedIn: ${personalInfo.linkedin}`, size: 18 })] : []),
                ...(personalInfo.linkedin && personalInfo.github ? [new TextRun({ text: ' | ', size: 18 })] : []),
                ...(personalInfo.github ? [new TextRun({ text: `GitHub: ${personalInfo.github}`, size: 18 })] : [])
              ],
              spacing: { after: 300 }
            })
          ] : []),

          // Professional Summary
          ...(summary ? [
            new Paragraph({
              text: 'Professional Summary',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: summary,
              spacing: { after: 300 }
            })
          ] : []),

          // Skills Section
          ...(skills.length > 0 ? [
            new Paragraph({
              text: 'Skills',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...skills.map(skillCategory => 
              new Paragraph({
                children: [
                  new TextRun({ text: `${skillCategory.category}: `, bold: true }),
                  new TextRun({ text: skillCategory.items.join(', ') })
                ],
                spacing: { after: 50 }
              })
            )
          ] : []),

          // Experience Section
          ...(experience.length > 0 ? [
            new Paragraph({
              text: 'Professional Experience',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...experience.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true }),
                  new TextRun({ text: ` at ${exp.company}` })
                ],
                spacing: { before: 100 }
              }),
              new Paragraph({
                text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}${exp.location ? ` | ${exp.location}` : ''}`,
                spacing: { after: 50 }
              }),
              ...exp.achievements.map(achievement => 
                new Paragraph({
                  text: `• ${achievement}`,
                  spacing: { after: 50 }
                })
              )
            ])
          ] : []),

          // Projects Section
          ...(projects && projects.length > 0 ? [
            new Paragraph({
              text: 'Projects',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...projects.flatMap(project => [
              new Paragraph({
                children: [
                  new TextRun({ text: project.name, bold: true }),
                  ...(project.link ? [new TextRun({ text: ` (${project.link})` })] : [])
                ],
                spacing: { before: 100 }
              }),
              new Paragraph({
                text: project.description,
                spacing: { after: 50 }
              }),
              ...(project.technologies.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Technologies: ', bold: true }),
                    new TextRun({ text: project.technologies.join(', ') })
                  ],
                  spacing: { after: 50 }
                })
              ] : []),
              ...project.achievements.map(achievement => 
                new Paragraph({
                  text: `• ${achievement}`,
                  spacing: { after: 50 }
                })
              )
            ])
          ] : []),

          // Education Section
          ...(education.length > 0 ? [
            new Paragraph({
              text: 'Education',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...education.map(edu => [
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true }),
                  new TextRun({ text: ` - ${edu.institution}` })
                ],
                spacing: { after: 30 }
              }),
              new Paragraph({
                text: `${edu.graduationDate}${edu.location ? ` | ${edu.location}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
                spacing: { after: 100 }
              })
            ]).flat()
          ] : []),

          // Certifications Section
          ...(certifications && certifications.length > 0 ? [
            new Paragraph({
              text: 'Certifications',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...certifications.map(cert => 
              new Paragraph({
                children: [
                  new TextRun({ text: cert.name, bold: true }),
                  new TextRun({ text: ` - ${cert.issuer} (${cert.date})` })
                ],
                spacing: { after: 50 }
              })
            )
          ] : []),

          // Awards Section
          ...(awards && awards.length > 0 ? [
            new Paragraph({
              text: 'Awards',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            ...awards.map(award => 
              new Paragraph({
                children: [
                  new TextRun({ text: award.title, bold: true }),
                  new TextRun({ text: ` - ${award.issuer} (${award.date})` })
                ],
                spacing: { after: 50 }
              })
            )
          ] : [])
        ]
      }]
    });

    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('DOCX export failed:', error);
    throw new Error('Failed to generate DOCX. Please try again.');
  }
}

/**
 * Export resume as HTML with optional template
 */
export async function exportResumeAsHTML(
  resumeData: ResumeData,
  options?: Partial<ExportOptions>
): Promise<Blob> {
  const content = generateResumeHTML(resumeData, options?.template, options?.customization);
  
  const blob = new Blob([content], { type: 'text/html' });
  
  return blob;
}

/**
 * Generate HTML content for resume with template styling
 */
function generateResumeHTML(
  data: ResumeData,
  template?: TemplateMetadata,
  customization?: TemplateCustomization
): string {
  const colors = customization?.colorScheme || template?.colorScheme || {
    primary: '#1A73E8',
    secondary: '#333333',
    accent: '#F1F3F4',
    background: '#FFFFFF',
    text: '#000000',
  };

  const fonts = customization?.fonts || template?.fonts || {
    heading: 'Arial, sans-serif',
    body: 'Arial, sans-serif',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personalInfo.fullName} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${fonts.body};
      color: ${colors.text};
      background-color: ${colors.background};
      line-height: 1.6;
      padding: 40px;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    h1, h2, h3 {
      font-family: ${fonts.heading};
      color: ${colors.primary};
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      border-bottom: 3px solid ${colors.primary};
      padding-bottom: 12px;
    }
    
    h2 {
      font-size: 20px;
      margin-top: 24px;
      margin-bottom: 12px;
      border-bottom: 2px solid ${colors.accent};
      padding-bottom: 8px;
    }
    
    h3 {
      font-size: 16px;
      margin-bottom: 6px;
    }
    
    .header {
      margin-bottom: 24px;
    }
    
    .contact-info {
      color: ${colors.secondary};
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .contact-info span {
      margin-right: 16px;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .experience-item, .education-item, .project-item {
      margin-bottom: 20px;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    
    .item-title {
      font-weight: 600;
      font-size: 16px;
    }
    
    .item-subtitle {
      color: ${colors.secondary};
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .item-date {
      color: ${colors.secondary};
      font-size: 13px;
      white-space: nowrap;
    }
    
    ul {
      margin-left: 20px;
      margin-top: 8px;
    }
    
    li {
      margin-bottom: 6px;
      font-size: 14px;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    
    .skill-category {
      margin-bottom: 12px;
    }
    
    .skill-category-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .skill-items {
      font-size: 13px;
      color: ${colors.secondary};
    }
    
    .tech-stack {
      color: ${colors.secondary};
      font-size: 13px;
      font-style: italic;
      margin-top: 4px;
    }
    
    a {
      color: ${colors.primary};
      text-decoration: none;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.personalInfo.fullName}</h1>
    <div class="contact-info">
      ${data.personalInfo.email ? `<span>${data.personalInfo.email}</span>` : ''}
      ${data.personalInfo.phone ? `<span>${data.personalInfo.phone}</span>` : ''}
      ${data.personalInfo.location ? `<span>${data.personalInfo.location}</span>` : ''}
    </div>
    <div class="contact-info">
      ${data.personalInfo.linkedin ? `<span><a href="${data.personalInfo.linkedin}">LinkedIn</a></span>` : ''}
      ${data.personalInfo.github ? `<span><a href="${data.personalInfo.github}">GitHub</a></span>` : ''}
      ${data.personalInfo.portfolio ? `<span><a href="${data.personalInfo.portfolio}">Portfolio</a></span>` : ''}
    </div>
  </div>

  ${data.summary ? `
  <div class="section">
    <h2>Professional Summary</h2>
    <p>${data.summary}</p>
  </div>
  ` : ''}

  ${data.skills.length > 0 ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${data.skills.map(skillGroup => `
        <div class="skill-category">
          <div class="skill-category-title">${skillGroup.category}</div>
          <div class="skill-items">${skillGroup.items.join(', ')}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${data.experience.length > 0 ? `
  <div class="section">
    <h2>Professional Experience</h2>
    ${data.experience.map(exp => `
      <div class="experience-item">
        <div class="item-header">
          <div>
            <h3 class="item-title">${exp.title}</h3>
            <div class="item-subtitle">${exp.company} | ${exp.location}</div>
          </div>
          <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
        </div>
        <ul>
          ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.projects && data.projects.length > 0 ? `
  <div class="section">
    <h2>Projects</h2>
    ${data.projects.map(project => `
      <div class="project-item">
        <div class="item-header">
          <h3 class="item-title">${project.name}</h3>
          ${project.link ? `<a href="${project.link}">View Project</a>` : ''}
        </div>
        <p>${project.description}</p>
        <div class="tech-stack">Technologies: ${project.technologies.join(', ')}</div>
        <ul>
          ${project.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.education.length > 0 ? `
  <div class="section">
    <h2>Education</h2>
    ${data.education.map(edu => `
      <div class="education-item">
        <div class="item-header">
          <div>
            <h3 class="item-title">${edu.degree}</h3>
            <div class="item-subtitle">${edu.institution} | ${edu.location}</div>
            ${edu.gpa ? `<div class="item-subtitle">GPA: ${edu.gpa}</div>` : ''}
          </div>
          <div class="item-date">${edu.graduationDate}</div>
        </div>
        ${edu.honors && edu.honors.length > 0 ? `<p>${edu.honors.join(', ')}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.certifications && data.certifications.length > 0 ? `
  <div class="section">
    <h2>Certifications</h2>
    ${data.certifications.map(cert => `
      <div>
        <h3 class="item-title">${cert.name}</h3>
        <div class="item-subtitle">${cert.issuer} | ${cert.date}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.awards && data.awards.length > 0 ? `
  <div class="section">
    <h2>Awards & Recognition</h2>
    ${data.awards.map(award => `
      <div>
        <h3 class="item-title">${award.title}</h3>
        <div class="item-subtitle">${award.issuer} | ${award.date}</div>
        ${award.description ? `<p>${award.description}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.languages && data.languages.length > 0 ? `
  <div class="section">
    <h2>Languages</h2>
    <div class="skill-items">
      ${data.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')}
    </div>
  </div>
  ` : ''}
</body>
</html>
  `.trim();
}

/**
 * Download file helper
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Unified export function with download
 */
export async function downloadResume(
  resumeData: ResumeData,
  format: 'pdf' | 'docx' | 'html',
  filename: string,
  options?: Partial<ExportOptions>
): Promise<void> {
  let blob: Blob;
  let mimeType: string;
  let extension: string;

  try {
    switch (format) {
      case 'pdf':
        blob = await exportResumeAsPDF(resumeData, options);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'docx':
        blob = await exportResumeAsDOCX(resumeData, options);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        extension = 'docx';
        break;
      case 'html':
        blob = await exportResumeAsHTML(resumeData, options);
        mimeType = 'text/html';
        extension = 'html';
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`${format.toUpperCase()} download failed:`, error);
    throw error;
  }
}

/**
 * Legacy export function - kept for backward compatibility
 */
export async function exportResume(
  resumeData: ResumeData,
  format: 'pdf' | 'docx' | 'html',
  filename: string,
  options?: Partial<ExportOptions>
): Promise<void> {
  return downloadResume(resumeData, format, filename, options);
}
