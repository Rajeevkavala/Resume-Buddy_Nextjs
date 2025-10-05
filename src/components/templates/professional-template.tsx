'use client';

import React from 'react';
import { ResumeData } from '@/lib/types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface ProfessionalTemplateProps {
  resumeData: ResumeData;
}

export function ProfessionalTemplate({ resumeData }: ProfessionalTemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, awards, languages } = resumeData;

  return (
    <div className="resume-template template-professional resume-container" 
         style={{ 
           padding: '1.5rem', 
           background: 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)'
         }}>
      {/* Enhanced Header */}
      <header className="template-fade-in" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="template-name" style={{ 
          color: 'var(--color-professional-primary)',
          fontSize: '2.25rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          {personalInfo.fullName}
        </h1>

        <div className="template-contact" style={{ 
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--color-professional-accent)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          {[
            personalInfo.email && (
              <span key="email" className="template-contact-item">
                <Mail className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.email}
              </span>
            ),
            personalInfo.phone && (
              <span key="phone" className="template-contact-item">
                <Phone className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.phone}
              </span>
            ),
            personalInfo.location && (
              <span key="location" className="template-contact-item">
                <MapPin className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.location}
              </span>
            ),
            personalInfo.linkedin && (
              <span key="linkedin" className="template-contact-item">
                <Linkedin className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.linkedin}
              </span>
            ),
            personalInfo.github && (
              <span key="github" className="template-contact-item">
                <Github className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.github}
              </span>
            ),
            personalInfo.portfolio && (
              <span key="portfolio" className="template-contact-item">
                <Globe className="template-contact-icon" style={{ color: 'var(--color-professional-primary)' }} />
                {personalInfo.portfolio}
              </span>
            )
          ].filter(Boolean)}
        </div>
      </header>

      {/* Enhanced Summary */}
      {summary && (
        <section className="template-section template-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="template-section-title" style={{ 
            color: 'var(--color-professional-primary)',
            fontSize: '1.125rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem',
            borderBottom: '2px solid var(--color-professional-primary)',
            position: 'relative'
          }}>
            <span style={{ background: 'white', paddingRight: '1rem' }}>Professional Summary</span>
          </h2>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.05)',
            padding: '1rem',
            borderRadius: '0.5rem',
            borderLeft: '4px solid var(--color-professional-primary)'
          }}>
            <p className="template-description" style={{ 
              fontSize: '0.875rem',
              lineHeight: '1.6',
              color: 'var(--color-minimal-text)',
              margin: '0',
              fontStyle: 'italic'
            }}>
              {summary}
            </p>
          </div>
        </section>
      )}

      {/* Enhanced Experience */}
      {experience.length > 0 && (
        <section className="template-section template-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="template-section-title" style={{ 
            color: 'var(--color-professional-primary)',
            fontSize: '1.125rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem',
            borderBottom: '2px solid var(--color-professional-primary)'
          }}>
            <span style={{ background: 'white', paddingRight: '1rem' }}>Professional Experience</span>
          </h2>
          {experience.slice(0, 4).map((exp, index) => (
            <div key={index} style={{ 
              marginBottom: '1.25rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '0',
                left: '0',
                width: '4px',
                height: '100%',
                background: 'var(--color-professional-secondary)',
                borderRadius: '0.25rem 0 0 0.25rem'
              }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <h3 className="template-job-title" style={{ 
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--color-professional-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    {exp.title}
                  </h3>
                  <p className="template-company" style={{ 
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--color-professional-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    {exp.company}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="template-date" style={{ 
                    fontSize: '0.75rem',
                    color: 'var(--color-minimal-light)',
                    fontWeight: '500',
                    background: 'var(--color-professional-accent)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                  <br />
                  <span style={{ 
                    fontSize: '0.75rem',
                    color: 'var(--color-minimal-light)',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {exp.location}
                  </span>
                </div>
              </div>
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="template-achievements" style={{ margin: '0.5rem 0 0 0' }}>
                  {exp.achievements.slice(0, 3).map((achievement, idx) => (
                    <li key={idx} className="template-achievement" style={{ 
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      marginBottom: '0.25rem',
                      color: 'var(--color-minimal-text)'
                    }}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Enhanced Education */}
      {education.length > 0 && (
        <section className="template-section template-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="template-section-title" style={{ 
            color: 'var(--color-professional-primary)',
            fontSize: '1.125rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem',
            borderBottom: '2px solid var(--color-professional-primary)'
          }}>
            <span style={{ background: 'white', paddingRight: '1rem' }}>Education</span>
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '0.75rem'
          }}>
            {education.slice(0, 2).map((edu, index) => (
              <div key={index} style={{ 
                background: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '4px',
                  height: '100%',
                  background: 'var(--color-professional-secondary)',
                  borderRadius: '0.25rem 0 0 0.25rem'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--color-professional-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      {edu.degree}
                    </h3>
                    <p style={{ 
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: 'var(--color-professional-secondary)',
                      marginBottom: '0.25rem'
                    }}>
                      {edu.institution}
                    </p>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: 'var(--color-minimal-light)'
                    }}>
                      {edu.location}{edu.gpa && ` • GPA: ${edu.gpa}`}
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem',
                    color: 'var(--color-minimal-light)',
                    background: 'var(--color-professional-accent)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontWeight: '500'
                  }}>
                    {edu.graduationDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Enhanced Skills */}
      {skills.length > 0 && (
        <section className="template-section template-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="template-section-title" style={{ 
            color: 'var(--color-professional-primary)',
            fontSize: '1.125rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem',
            borderBottom: '2px solid var(--color-professional-primary)'
          }}>
            <span style={{ background: 'white', paddingRight: '1rem' }}>Core Competencies</span>
          </h2>
          <div className="template-skills-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '0.75rem'
          }}>
            {skills.map((skillGroup, index) => (
              <div key={index} className="template-skill-category" style={{ 
                background: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 className="template-skill-title" style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-professional-primary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {skillGroup.category}
                </h3>
                <div className="template-skill-items" style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.25rem'
                }}>
                  {skillGroup.items.slice(0, 8).map((skill, skillIndex) => (
                    <span key={skillIndex} className="template-skill-item" style={{ 
                      background: 'var(--color-professional-accent)',
                      color: 'var(--color-professional-primary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Enhanced Projects */}
      {projects && projects.length > 0 && (
        <section className="template-section template-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="template-section-title" style={{ 
            color: 'var(--color-professional-primary)',
            fontSize: '1.125rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem',
            borderBottom: '2px solid var(--color-professional-primary)'
          }}>
            <span style={{ background: 'white', paddingRight: '1rem' }}>Key Projects</span>
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {projects.slice(0, 4).map((project, index) => (
              <div key={index} className="template-project" style={{ 
                background: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '4px',
                  height: '100%',
                  background: 'var(--color-professional-secondary)',
                  borderRadius: '0.25rem 0 0 0.25rem'
                }} />
                <h3 className="template-project-title" style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-professional-primary)',
                  marginBottom: '0.5rem'
                }}>
                  {project.name}
                </h3>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="template-project-tech" style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    marginBottom: '0.5rem'
                  }}>
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <span key={techIndex} className="template-project-tech-item" style={{ 
                        background: 'var(--color-professional-accent)',
                        color: 'var(--color-professional-primary)',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.625rem',
                        fontWeight: '500',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ 
                  fontSize: '0.75rem',
                  lineHeight: '1.4',
                  color: 'var(--color-minimal-text)',
                  margin: '0'
                }}>
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Additional Qualifications Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Certifications */}
        {certifications && certifications.length > 0 && certifications.length <= 4 && (
          <section className="template-fade-in" style={{ 
            background: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              color: 'var(--color-professional-primary)',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: '1px solid var(--color-professional-primary)'
            }}>
              Certifications
            </h2>
            {certifications.slice(0, 4).map((cert, index) => (
              <div key={index} style={{ 
                marginBottom: '0.5rem',
                paddingBottom: '0.5rem',
                borderBottom: index < certifications.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--color-professional-primary)',
                  marginBottom: '0.125rem'
                }}>
                  {cert.name}
                </div>
                <div style={{ 
                  fontSize: '0.625rem',
                  color: 'var(--color-minimal-light)'
                }}>
                  {cert.issuer} • {cert.date}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && awards.length <= 3 && (
          <section className="template-fade-in" style={{ 
            background: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              color: 'var(--color-professional-primary)',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: '1px solid var(--color-professional-primary)'
            }}>
              Awards & Recognition
            </h2>
            {awards.slice(0, 3).map((award, index) => (
              <div key={index} style={{ 
                marginBottom: '0.5rem',
                paddingBottom: '0.5rem',
                borderBottom: index < awards.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--color-professional-primary)',
                  marginBottom: '0.125rem'
                }}>
                  {award.title}
                </div>
                <div style={{ 
                  fontSize: '0.625rem',
                  color: 'var(--color-minimal-light)'
                }}>
                  {award.issuer} • {award.date}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && languages.length <= 5 && (
          <section className="template-fade-in" style={{ 
            background: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              color: 'var(--color-professional-primary)',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: '1px solid var(--color-professional-primary)'
            }}>
              Languages
            </h2>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {languages.slice(0, 5).map((lang, index) => (
                <span key={index} style={{ 
                  background: 'var(--color-professional-accent)',
                  color: 'var(--color-professional-primary)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <span style={{ fontWeight: '600' }}>{lang.language}</span> - {lang.proficiency}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
