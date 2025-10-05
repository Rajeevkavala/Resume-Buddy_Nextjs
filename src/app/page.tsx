
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Brain, 
  MessageSquare, 
  Target, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { usePageTitle } from '@/hooks/use-page-title';
import LandingNavbar from '@/components/landing-navbar';
import Navbar from '@/components/navbar';

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();

  // Set page title
  usePageTitle('Home');

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get detailed insights on how well your resume matches job requirements using advanced AI technology."
    },
    {
      icon: MessageSquare,
      title: "Interview Preparation",
      description: "Generate customized interview questions based on your resume and target job description."
    },
    {
      icon: Target,
      title: "Resume Optimization",
      description: "Receive actionable suggestions to improve your resume and increase your chances of getting hired."
    },
    {
      icon: FileText,
      title: "Q&A Generation",
      description: "Create comprehensive question-answer pairs to help you prepare for technical and behavioral interviews."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get AI-powered insights in seconds, not hours. Upload, analyze, and optimize quickly."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your resume data is encrypted and stored securely. Your privacy is our top priority."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Resumes Analyzed" },
    { value: "95%", label: "Success Rate" },
    { value: "2.5x", label: "More Interviews" },
    { value: "24/7", label: "AI Availability" }
  ];

  return (
    <>
      {/* Conditional Navbar */}
      {user ? <Navbar /> : <LandingNavbar />}
      
      <div className="flex-1">
        {/* Hero Section - Simplified Clean Design */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background/90 pt-16">
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/15 hover:scale-105 hover:border-primary/30 transition-all duration-300 cursor-default">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Resume Analysis</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Transform Your Resume Into <br />
                <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                  Career Success
                </span>
              </h1>
              <div className="h-1.5 w-24 mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-full" />
            </div>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Get AI-powered insights, interview questions, and optimization suggestions to land your dream job. 
              Upload your resume and job description to get started in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
              {!authLoading && (
                <>
                  {user ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                          Get Started Free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" size="lg" className="px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center flex-wrap gap-6 pt-8 text-sm">
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">100% Secure</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-default">
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-muted-foreground">Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Trusted by Thousands of Job Seekers
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the community that&apos;s transforming careers with AI
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center space-y-2 p-4 rounded-lg hover:bg-background/50 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-default group"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-default">
              <Brain className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">
              Our AI-powered platform provides comprehensive tools to optimize your job search process and land your dream job.
            </p>
          </div>
          
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="h-full hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group border-border/50 cursor-pointer">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4 px-4 py-2 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-default">
              <TrendingUp className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              How <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">ResumeBuddy</span> Works
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">
              Get started in just three simple steps and transform your job search today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:gap-8 lg:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload Resume",
                description: "Upload your resume in PDF or DOCX format. Our AI will extract and analyze the content instantly.",
                icon: FileText
              },
              {
                step: "2",
                title: "Add Job Description",
                description: "Paste the job description you're targeting. Our AI will compare it with your resume for perfect matching.",
                icon: Target
              },
              {
                step: "3",
                title: "Get AI Insights",
                description: "Receive detailed analysis, interview questions, and optimization suggestions to land your dream job.",
                icon: Brain
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center space-y-6 p-6 rounded-xl hover:bg-background/50 hover:scale-105 transition-all duration-300 cursor-default group">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                  </div>

                  <div className="mx-auto w-14 h-14 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {!authLoading && !user && (
            <div className="text-center mt-16">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 sm:py-32 bg-primary text-primary-foreground relative overflow-hidden z-0">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none z-0" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="mb-6 px-4 py-2 hover:scale-105 transition-all duration-300 cursor-default">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Ready to Transform Your Career?
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Land Your Dream Job
            </h2>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl opacity-90 leading-relaxed">
              Join thousands of job seekers who have improved their resumes and landed interviews with ResumeBuddy.
            </p>

            {/* Feature highlights */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Zap, text: "Instant AI Analysis" },
                { icon: Shield, text: "100% Secure & Private" },
                { icon: CheckCircle, text: "No Credit Card Required" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-center gap-2 opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 flex items-center justify-center gap-4 flex-wrap">
              {!authLoading && (
                <>
                  {user ? (
                    <Link href="/dashboard">
                      <Button size="lg" variant="secondary" className="px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button size="lg" variant="secondary" className="px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                          Start Free Analysis
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" size="lg" className="px-8 py-6 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="pt-12 flex items-center justify-center gap-8 flex-wrap opacity-80 text-sm">
              <div className="flex items-center gap-2 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default">
                <Users className="w-4 h-4" />
                <span>10,000+ users trust us</span>
              </div>
              <div className="flex items-center gap-2 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
