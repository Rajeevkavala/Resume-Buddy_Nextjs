/**
 * FAANG Template
 * Clean, simple template inspired by FAANGPath with excellent ATS compatibility
 * Features: Single column, clear sections, professional typography, optimized for tech roles
 */

import React from 'react';
import { ResumeData } from '@/lib/types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface FaangTemplateProps {
  resumeData: ResumeData;
}

export function FaangTemplate({ resumeData }: FaangTemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, awards, languages } = resumeData;

  return (
    <div className="template-faang font-faang p-12 bg-white text-gray-900" style={{ minHeight: '297mm' }}>
      {/* Header Section */}
      <header className="mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 tracking-tight">
          {personalInfo.fullName}
        </h1>
        
        {/* Contact Information */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gray-600" />
              <a href={`mailto:${personalInfo.email}`} className="hover:text-blue-600">
                {personalInfo.email}
              </a>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-gray-600" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="h-4 w-4 text-gray-600" />
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                LinkedIn
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1.5">
              <Github className="h-4 w-4 text-gray-600" />
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                GitHub
              </a>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-gray-600" />
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                Portfolio
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Summary Section */}
      {summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-800">
            {summary}
          </p>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Work Experience
          </h2>
          <div className="space-y-5">
            {experience.map((exp, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {exp.title}
                    </h3>
                    <div className="text-sm font-semibold text-gray-700">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm text-gray-800">
                    {exp.achievements.map((achievement: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {edu.degree}
                    </h3>
                    <div className="text-sm font-semibold text-gray-700">
                      {edu.institution} {edu.location && `• ${edu.location}`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {edu.graduationDate}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-sm text-gray-700">
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.honors && edu.honors.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Honors:</span> {edu.honors.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills && Object.keys(skills).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Technical Skills
          </h2>
          <div className="space-y-2">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category} className="flex text-sm">
                <span className="font-bold text-gray-900 min-w-[140px]">
                  {category}:
                </span>
                <span className="text-gray-800">
                  {typeof skillList === 'string' 
                    ? skillList 
                    : Array.isArray(skillList)
                    ? skillList.join(', ')
                    : typeof skillList === 'object' && 'items' in skillList
                    ? skillList.items.join(', ')
                    : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {project.name}
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-normal"
                    >
                      [Link]
                    </a>
                  )}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-800 leading-relaxed mb-2">
                    {project.description}
                  </p>
                )}
                {project.achievements && project.achievements.length > 0 && (
                  <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-800 mb-2">
                    {project.achievements.map((achievement: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-gray-900">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-sm text-gray-700"> - {cert.issuer}</span>
                  )}
                </div>
                {cert.date && (
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {cert.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards Section */}
      {awards && awards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Awards & Achievements
          </h2>
          <div className="space-y-2">
            {awards.map((award, index) => (
              <div key={index} className="flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-gray-900">{award.title}</span>
                  {award.issuer && (
                    <span className="text-sm text-gray-700"> - {award.issuer}</span>
                  )}
                  {award.description && (
                    <p className="text-sm text-gray-700 mt-1">{award.description}</p>
                  )}
                </div>
                {award.date && (
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {award.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Languages
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {languages.map((lang, index) => (
              <div key={index}>
                <span className="font-bold text-gray-900">{lang.language}:</span>{' '}
                <span className="text-gray-700">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
