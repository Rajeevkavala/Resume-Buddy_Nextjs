'use client';

import React, { useState } from 'react';
import { ResumeData, SuggestResumeImprovementsOutput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, User, Briefcase, GraduationCap, Award, Sparkles, RefreshCw, Code, Trophy, Globe } from 'lucide-react';
import { parseResumeText } from '@/lib/resume-parser';
import { parseResumeIntelligentlyAction } from '@/app/actions';
import toast from 'react-hot-toast';

interface ResumeContentEditorProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
  improvements?: SuggestResumeImprovementsOutput | null;
}

export function ResumeContentEditor({ resumeData, onChange, improvements }: ResumeContentEditorProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isFillingFromImproved, setIsFillingFromImproved] = useState(false);

  const fillFromImprovedResume = async () => {
    if (!improvements?.improvedResumeText) {
      toast.error('No improved resume text available');
      return;
    }

    setIsFillingFromImproved(true);
    try {
      toast.loading('Using AI to intelligently parse your improved resume...', { duration: 2000 });
      console.log('Sending improved resume text to AI for parsing:', improvements.improvedResumeText);
      
      const result = await parseResumeIntelligentlyAction(improvements.improvedResumeText);
      
      if (result.success && result.data) {
        console.log('AI-parsed data:', result.data);
        onChange(result.data);
        
        const experienceCount = result.data.experience?.length || 0;
        const projectCount = result.data.projects?.length || 0;
        const skillCategories = result.data.skills?.length || 0;
        
        toast.success(
          `✨ AI-powered parsing complete! Found ${experienceCount} experiences, ${projectCount} projects, and ${skillCategories} skill categories.`,
          { duration: 4000 }
        );
      } else {
        console.warn('AI parsing failed, falling back to basic parsing:', result.error);
        toast.dismiss();
        toast.loading('AI parsing failed, using fallback parser...', { duration: 1500 });
        
        // Fallback to basic parsing
        const parsed = parseResumeText(improvements.improvedResumeText);
        console.log('Fallback parsed data:', parsed);
        onChange(parsed);
        
        const achievementCount = parsed.experience.reduce((acc, exp) => acc + exp.achievements.length, 0);
        toast.success(`Form filled from improved resume! Found ${parsed.experience.length} experience entries with ${achievementCount} achievements.`);
      }
    } catch (error) {
      console.error('Error parsing improved resume:', error);
      toast.error('Failed to parse improved resume');
    } finally {
      setIsFillingFromImproved(false);
    }
  };

  // Helper functions
  const updatePersonalInfo = (field: keyof typeof resumeData.personalInfo, value: string) => {
    onChange({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...resumeData, summary: value });
  };

  // Experience functions
  const addExperience = () => {
    onChange({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          achievements: ['']
        }
      ]
    });
  };

  const updateExperience = (index: number, field: keyof typeof resumeData.experience[0], value: any) => {
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resumeData, experience: updated });
  };

  const deleteExperience = (index: number) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index)
    });
  };

  const addAchievement = (expIndex: number) => {
    const updated = [...resumeData.experience];
    updated[expIndex].achievements.push('');
    onChange({ ...resumeData, experience: updated });
  };

  const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
    const updated = [...resumeData.experience];
    updated[expIndex].achievements[achievementIndex] = value;
    onChange({ ...resumeData, experience: updated });
  };

  const deleteAchievement = (expIndex: number, achievementIndex: number) => {
    const updated = [...resumeData.experience];
    updated[expIndex].achievements = updated[expIndex].achievements.filter((_, i) => i !== achievementIndex);
    onChange({ ...resumeData, experience: updated });
  };

  // Education functions
  const addEducation = () => {
    onChange({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          gpa: '',
          honors: [],
          major: '',
          minor: ''
        }
      ]
    });
  };

  const updateEducation = (index: number, field: keyof typeof resumeData.education[0], value: any) => {
    const updated = [...resumeData.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resumeData, education: updated });
  };

  const deleteEducation = (index: number) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index)
    });
  };

  // Skills functions
  const addSkillCategory = () => {
    onChange({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        {
          category: '',
          items: ['']
        }
      ]
    });
  };

  const updateSkillCategory = (index: number, field: 'category' | 'items', value: any) => {
    const updated = [...resumeData.skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resumeData, skills: updated });
  };

  const deleteSkillCategory = (index: number) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
    });
  };

  const addSkillItem = (categoryIndex: number) => {
    const updated = [...resumeData.skills];
    updated[categoryIndex].items.push('');
    onChange({ ...resumeData, skills: updated });
  };

  const updateSkillItem = (categoryIndex: number, itemIndex: number, value: string) => {
    const updated = [...resumeData.skills];
    updated[categoryIndex].items[itemIndex] = value;
    onChange({ ...resumeData, skills: updated });
  };

  const deleteSkillItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...resumeData.skills];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    onChange({ ...resumeData, skills: updated });
  };

  // Projects functions
  const addProject = () => {
    const newProjects = resumeData.projects || [];
    onChange({
      ...resumeData,
      projects: [
        ...newProjects,
        {
          name: '',
          description: '',
          technologies: [],
          link: '',
          achievements: ['']
        }
      ]
    });
  };

  const updateProject = (index: number, field: keyof NonNullable<typeof resumeData.projects>[0], value: any) => {
    const updated = [...(resumeData.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resumeData, projects: updated });
  };

  const deleteProject = (index: number) => {
    const updated = resumeData.projects?.filter((_, i) => i !== index);
    onChange({
      ...resumeData,
      projects: updated?.length ? updated : undefined
    });
  };

  const addProjectTechnology = (projectIndex: number) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].technologies.push('');
    onChange({ ...resumeData, projects: updated });
  };

  const updateProjectTechnology = (projectIndex: number, techIndex: number, value: string) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].technologies[techIndex] = value;
    onChange({ ...resumeData, projects: updated });
  };

  const deleteProjectTechnology = (projectIndex: number, techIndex: number) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].technologies = updated[projectIndex].technologies.filter((_, i) => i !== techIndex);
    onChange({ ...resumeData, projects: updated });
  };

  const addProjectAchievement = (projectIndex: number) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].achievements.push('');
    onChange({ ...resumeData, projects: updated });
  };

  const updateProjectAchievement = (projectIndex: number, achievementIndex: number, value: string) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].achievements[achievementIndex] = value;
    onChange({ ...resumeData, projects: updated });
  };

  const deleteProjectAchievement = (projectIndex: number, achievementIndex: number) => {
    const updated = [...(resumeData.projects || [])];
    updated[projectIndex].achievements = updated[projectIndex].achievements.filter((_, i) => i !== achievementIndex);
    onChange({ ...resumeData, projects: updated });
  };

  return (
    <div className="w-full space-y-6">
      {/* Global Fill from Improved Resume Button */}
      {improvements?.improvedResumeText && (
        <div className="flex justify-center">
          <Button 
            onClick={fillFromImprovedResume} 
            size="lg" 
            variant="outline"
            disabled={isFillingFromImproved}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300 hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {isFillingFromImproved ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            AI-Powered Fill from Improved Resume
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Briefcase className="w-4 h-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <GraduationCap className="w-4 h-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Code className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Award className="w-4 h-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-slate-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-950/50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={resumeData.personalInfo.linkedin || ''}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={resumeData.personalInfo.github || ''}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={resumeData.personalInfo.portfolio || ''}
                    onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                    placeholder="https://johndoe.dev"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={resumeData.personalInfo.website || ''}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Summary Tab */}
        <TabsContent value="summary" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="summary" className="text-base font-medium">Professional Summary *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Write a compelling professional summary that highlights your key strengths, career objectives, and what makes you unique as a candidate.
                </p>
                <Textarea
                  id="summary"
                  value={resumeData.summary || ''}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Dynamic and results-driven professional with X years of experience in [field]. Proven track record of [key achievements]. Skilled in [core competencies] and passionate about [relevant interests]. Seeking to leverage expertise in [specific areas] to contribute to [type of organization/role]..."
                  rows={6}
                  className="resize-none border-2 focus:border-green-300 dark:focus:border-green-600 transition-colors"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Tip: Keep it concise (2-4 sentences) and focus on your most relevant qualifications.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resumeData.summary?.length || 0} characters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Experience Tab */}
        <TabsContent value="experience" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/50 dark:to-red-950/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                  <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  Work Experience
                </CardTitle>
                <Button 
                  onClick={addExperience} 
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border-2 border-orange-200/50 dark:border-orange-800/30 rounded-xl p-6 space-y-4 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-orange-800 dark:text-orange-200">
                      {exp.title || `Experience #${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExperience(index)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Job Title *</Label>
                      <Input
                        placeholder="Software Engineer"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Company *</Label>
                      <Input
                        placeholder="Tech Corp"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="San Francisco, CA"
                        value={exp.location}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        placeholder="Jan 2023"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label>End Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Present"
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.current}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`current-${index}`}
                            checked={exp.current}
                            onCheckedChange={(checked) => {
                              updateExperience(index, 'current', checked);
                              if (checked) {
                                updateExperience(index, 'endDate', '');
                              }
                            }}
                          />
                          <Label htmlFor={`current-${index}`} className="text-xs">Current</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Achievements & Responsibilities</Label>
                    {exp.achievements.map((achievement, achIndex) => (
                      <div key={achIndex} className="flex gap-2">
                        <Textarea
                          placeholder="• Increased system performance by 40% through optimization and refactoring..."
                          value={achievement}
                          onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAchievement(index, achIndex)}
                          disabled={exp.achievements.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(index)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </div>
                </div>
              ))}
              
              {resumeData.experience.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No work experience added yet</h3>
                  <p className="text-sm mb-4">Add your professional experience to showcase your career journey.</p>
                  <div className="space-y-2">
                    <p className="text-xs">Click "Add Experience" to get started</p>
                    {improvements?.improvedResumeText && (
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Or use "AI-Powered Fill from Improved Resume" to intelligently populate all sections
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/50 dark:to-indigo-950/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                  <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Education
                </CardTitle>
                <Button 
                  onClick={addEducation} 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="border-2 border-purple-200/50 dark:border-purple-800/30 rounded-xl p-6 space-y-4 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-purple-800 dark:text-purple-200">
                      {edu.degree || `Education #${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEducation(index)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Degree *</Label>
                      <Input
                        placeholder="Bachelor of Science in Computer Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Institution *</Label>
                      <Input
                        placeholder="University of Technology"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="San Francisco, CA"
                        value={edu.location}
                        onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Graduation Date</Label>
                      <Input
                        placeholder="May 2023"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>GPA (Optional)</Label>
                      <Input
                        placeholder="3.8/4.0"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Major (Optional)</Label>
                      <Input
                        placeholder="Computer Science"
                        value={edu.major || ''}
                        onChange={(e) => updateEducation(index, 'major', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Minor (Optional)</Label>
                      <Input
                        placeholder="Mathematics"
                        value={edu.minor || ''}
                        onChange={(e) => updateEducation(index, 'minor', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Honors (Optional)</Label>
                      <Input
                        placeholder="Magna Cum Laude, Dean's List"
                        value={Array.isArray(edu.honors) ? edu.honors.join(', ') : edu.honors || ''}
                        onChange={(e) => updateEducation(index, 'honors', e.target.value.split(',').map(h => h.trim()).filter(h => h.length > 0))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {resumeData.education.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No education added yet</h3>
                  <p className="text-sm mb-4">Add your educational background to highlight your academic achievements.</p>
                  <p className="text-xs">Click "Add Education" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/50 dark:to-green-950/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                  <Code className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  Projects
                </CardTitle>
                <Button 
                  onClick={addProject} 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(resumeData.projects || []).map((project, index) => (
                <div key={index} className="border-2 border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-6 space-y-4 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-emerald-800 dark:text-emerald-200">
                      {project.name || `Project #${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(index)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Project Name *</Label>
                      <Input
                        placeholder="E-commerce Platform"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Project Link (Optional)</Label>
                      <Input
                        placeholder="https://github.com/username/project"
                        value={project.link || ''}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Project Description *</Label>
                    <Textarea
                      placeholder="Brief description of the project, its purpose, and key features..."
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Technologies Used</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addProjectTechnology(index)}
                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Technology
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {project.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex gap-2">
                          <Input
                            placeholder="React, Node.js, MongoDB..."
                            value={tech}
                            onChange={(e) => updateProjectTechnology(index, techIndex, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProjectTechnology(index, techIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      ))}
                      {project.technologies.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No technologies added. Click "Add Technology" to start.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Key Achievements & Features</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addProjectAchievement(index)}
                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Achievement
                      </Button>
                    </div>
                    {project.achievements.map((achievement, achIndex) => (
                      <div key={achIndex} className="flex gap-2 mb-2">
                        <Textarea
                          placeholder="• Implemented user authentication system with JWT tokens and role-based access control..."
                          value={achievement}
                          onChange={(e) => updateProjectAchievement(index, achIndex, e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProjectAchievement(index, achIndex)}
                          disabled={project.achievements.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {(!resumeData.projects || resumeData.projects.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Code className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects added yet</h3>
                  <p className="text-sm mb-4">Showcase your personal projects, side projects, or significant work contributions.</p>
                  <p className="text-xs">Click "Add Project" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-8">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/50 dark:to-cyan-950/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                  <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  Skills
                </CardTitle>
                <Button 
                  onClick={addSkillCategory} 
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.skills.map((skillCategory, index) => (
                <div key={index} className="border-2 border-teal-200/50 dark:border-teal-800/30 rounded-xl p-6 space-y-4 bg-white/70 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-base font-medium text-teal-800 dark:text-teal-200">Category Name *</Label>
                      <Input
                        placeholder="Programming Languages, Frameworks, Tools..."
                        value={skillCategory.category}
                        onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                        required
                        className="mt-2 border-2 focus:border-teal-300 dark:focus:border-teal-600 transition-colors"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSkillCategory(index)}
                      className="ml-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    {skillCategory.items.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex gap-2">
                        <Input
                          placeholder="JavaScript, Python, React..."
                          value={skill}
                          onChange={(e) => updateSkillItem(index, skillIndex, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSkillItem(index, skillIndex)}
                          disabled={skillCategory.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSkillItem(index)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </div>
              ))}
              
              {resumeData.skills.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="bg-teal-100 dark:bg-teal-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No skills added yet</h3>
                  <p className="text-sm mb-4">Organize your skills by categories to showcase your expertise.</p>
                  <p className="text-xs">Click "Add Skill Category" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
