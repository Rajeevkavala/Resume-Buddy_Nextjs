'use client';

import React, { useState } from 'react';
import { ResumeData } from '@/lib/types';
import { ModernTemplateId } from '@/lib/modern-templates';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, FileText, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { exportToPDF, exportToDOCX, printResume } from '@/lib/resume-export';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

// Direct PDF generation function
const generateDirectPDF = async (resumeData: ResumeData, filename: string) => {
  console.log('📝 Generating PDF from resume data...');
  console.log('Resume data:', resumeData);
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Validate resume data
  if (!resumeData) {
    doc.setFontSize(12);
    doc.text('Error: No resume data available', margin, yPos);
    doc.save('resume.pdf');
    return;
  }

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: string = '#000000') => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Check if we need a new page
    const lineHeight = fontSize * 0.5;
    const totalHeight = lines.length * lineHeight;
    
    if (yPos + totalHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    
    lines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    
    return yPos;
  };

  const addSection = (title: string) => {
    yPos += 5; // Add space before section
    addText(title.toUpperCase(), 14, true, '#1a73e8');
    yPos += 3; // Add space after section title
  };

  try {
    // Header - Personal Information
    if (resumeData.personalInfo) {
      const { fullName, email, phone, location, linkedin, github, website } = resumeData.personalInfo;
      
      // Name
      addText(fullName || 'Your Name', 18, true, '#1a1a1a');
      yPos += 2;
      
      // Contact Info
      const contactInfo = [];
      if (email) contactInfo.push(`Email: ${email}`);
      if (phone) contactInfo.push(`Phone: ${phone}`);
      if (location) contactInfo.push(`Location: ${location}`);
      
      if (contactInfo.length > 0) {
        addText(contactInfo.join(' | '), 10, false, '#666666');
      }
      
      // Links
      const links = [];
      if (linkedin) links.push(`LinkedIn: ${linkedin}`);
      if (github) links.push(`GitHub: ${github}`);
      if (website) links.push(`Website: ${website}`);
      
      if (links.length > 0) {
        addText(links.join(' | '), 10, false, '#666666');
      }
      
      yPos += 5;
    }

    // Professional Summary
    if (resumeData.summary) {
      addSection('Professional Summary');
      addText(resumeData.summary);
      yPos += 5;
    }

    // Skills - New compact format
    if (resumeData.skills) {
      addSection('Technical Skills');
      const skillGroups = [];
      
      if (resumeData.skills.languages?.length) {
        skillGroups.push(`Languages: ${resumeData.skills.languages.join(', ')}`);
      }
      if (resumeData.skills.frameworks?.length) {
        skillGroups.push(`Frameworks: ${resumeData.skills.frameworks.join(', ')}`);
      }
      if (resumeData.skills.databases?.length) {
        skillGroups.push(`Databases: ${resumeData.skills.databases.join(', ')}`);
      }
      if (resumeData.skills.tools?.length) {
        skillGroups.push(`Tools: ${resumeData.skills.tools.join(', ')}`);
      }
      if (resumeData.skills.cloud?.length) {
        skillGroups.push(`Cloud/CI: ${resumeData.skills.cloud.join(', ')}`);
      }
      if (resumeData.skills.other?.length) {
        skillGroups.push(`Other: ${resumeData.skills.other.join(', ')}`);
      }
      
      // Render each skill group on its own line for better readability
      skillGroups.forEach(group => {
        addText(group, 10, false, '#333333');
      });
      yPos += 3;
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      addSection('Professional Experience');
      
      resumeData.experience.forEach((exp, index) => {
        // Company and Position
        const title = `${exp.title} at ${exp.company}`;
        addText(title, 12, true, '#1a1a1a');
        
        // Duration and Location
        const duration = `${exp.startDate} - ${exp.endDate || 'Present'}`;
        const locationText = exp.location ? ` | ${exp.location}` : '';
        addText(duration + locationText, 10, false, '#666666');
        yPos += 1;
        
        // Achievements
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach(achievement => {
            addText(`• ${achievement}`, 10);
          });
        }
        
        if (index < resumeData.experience.length - 1) {
          yPos += 3; // Space between jobs
        }
      });
      yPos += 5;
    }

    // Education & Certifications - Merged section
    if (resumeData.educationAndCertifications) {
      addSection('Education & Certifications');
      
      // Education entries
      if (resumeData.educationAndCertifications.education?.length > 0) {
        resumeData.educationAndCertifications.education.forEach((edu, index) => {
          const title = `${edu.degree}${edu.major ? ` in ${edu.major}` : ''}`;
          const schoolInfo = `${edu.institution}, ${edu.location}`;
          const dateAndGpa = [edu.graduationDate, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' | ');
          
          addText(`${title} – ${schoolInfo} (${dateAndGpa})`, 10, false, '#333333');
          
          if (index < resumeData.educationAndCertifications.education.length - 1) {
            yPos += 1;
          }
        });
        yPos += 2;
      }
      
      // Certifications entries
      if (resumeData.educationAndCertifications.certifications?.length > 0) {
        resumeData.educationAndCertifications.certifications.forEach((cert, index) => {
          const certLine = `${cert.name} – ${cert.issuer} (${cert.date})`;
          addText(certLine, 10, false, '#333333');
          
          if (index < resumeData.educationAndCertifications.certifications.length - 1) {
            yPos += 1;
          }
        });
      }
      yPos += 3;
    }

    // Projects - Compact format (max 2-3 key projects)
    if (resumeData.projects && resumeData.projects.length > 0) {
      addSection('Key Projects');
      
      // Limit to top 3 projects for single-page format
      const topProjects = resumeData.projects.slice(0, 3);
      
      topProjects.forEach((project, index) => {
        // Project title with technologies in one line
        const titleLine = `${project.name} (${project.technologies.join(', ')})`;
        addText(titleLine, 11, true, '#1a1a1a');
        
        // Description (keep it to 1 line)
        if (project.description) {
          addText(project.description, 10, false, '#333333');
        }
        
        // Achievements (max 2 bullet points)
        if (project.achievements && project.achievements.length > 0) {
          const topAchievements = project.achievements.slice(0, 2);
          topAchievements.forEach(achievement => {
            addText(`• ${achievement}`, 10);
          });
        }
        
        if (project.link) {
          addText(`🔗 ${project.link}`, 9, false, '#1a73e8');
        }
        
        if (index < topProjects.length - 1) {
          yPos += 2;
        }
      });
      yPos += 3;
    }



    console.log('💾 Saving PDF...');
    doc.save(filename);
    console.log('✅ PDF saved successfully!');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
};

// Import template components
import { ProfessionalTemplate } from '@/components/templates/professional-template';
import { ModernTemplate } from '@/components/templates/modern-template';
import { CreativeTemplate } from '@/components/templates/creative-template';
import { MinimalTemplate } from '@/components/templates/minimal-template';
import { ExecutiveTemplate } from '@/components/templates/executive-template';
import { TechTemplate } from '@/components/templates/tech-template';
import { FaangTemplate } from '@/components/templates/faang-template';

interface ModernResumePreviewProps {
  resumeData: ResumeData;
  templateId: ModernTemplateId;
  className?: string;
}

export function ModernResumePreview({
  resumeData,
  templateId,
  className = '',
}: ModernResumePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const zoomLevels = [50, 75, 100, 125, 150];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };
  
  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      console.log('� Starting direct PDF generation...');
      console.log('Resume data:', { 
        hasPersonalInfo: !!resumeData.personalInfo,
        name: resumeData.personalInfo?.fullName,
        hasExperience: !!resumeData.experience?.length,
        hasEducationAndCerts: !!resumeData.educationAndCertifications,
        hasSkills: !!(resumeData.skills?.languages?.length || resumeData.skills?.frameworks?.length || resumeData.skills?.databases?.length || resumeData.skills?.tools?.length || resumeData.skills?.cloud?.length || resumeData.skills?.other?.length)
      });
      
      // NEW APPROACH: Direct PDF generation from resume data
      await generateDirectPDF(resumeData, `${resumeData.personalInfo.fullName}-Resume.pdf`);
      
      console.log('✅ PDF generated successfully!');
      toast.success('PDF exported successfully!');
      
    } catch (error) {
      console.error('❌ PDF export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    try {
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName}-Resume.docx`);
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error('Failed to export DOCX. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    printResume('resume-preview-container');
  };

  const renderTemplate = () => {
    const props = { resumeData };
    
    switch (templateId) {
      case 'professional':
        return <ProfessionalTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'creative':
        return <CreativeTemplate {...props} />;
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'executive':
        return <ExecutiveTemplate {...props} />;
      case 'tech':
        return <TechTemplate {...props} />;
      case 'faang':
        return <FaangTemplate {...props} />;
      default:
        return <ProfessionalTemplate {...props} />;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoom === zoomLevels[0]}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {zoomLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setZoom(level)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      zoom === level
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomIn}
                disabled={zoom === zoomLevels[zoomLevels.length - 1]}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isExporting}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDOCX}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 overflow-auto">
          <div className="bg-gray-100 p-8 min-h-full flex justify-center">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out',
                marginBottom: `${Math.max(0, (zoom - 100) * 3)}px`, // Add bottom margin for zoomed content
                marginTop: zoom < 100 ? '20px' : '0',
              }}
            >
              <div 
                id="resume-preview"
                className="bg-white shadow-lg resume-preview-container resume-container"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '0',
                  overflow: 'visible',
                  position: 'relative'
                }}
              >
                <div 
                  id="resume-preview-container" 
                  className="resume-container"
                  style={{ 
                    overflow: 'visible',
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {renderTemplate()}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
