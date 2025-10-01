
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sparkles,
  Quote
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SparklesCore } from '@/components/ui/sparkles';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { MovingBorder } from '@/components/ui/moving-border';
import { usePageTitle } from '@/hooks/use-page-title';

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Set page title
  usePageTitle('Home');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

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
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <BackgroundBeams className="absolute inset-0" />
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={120}
          className="w-full h-full absolute inset-0"
          particleColor="#3B82F6"
        />
        
        {/* Additional floating elements for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-16 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-lg sm:blur-xl"
            animate={{
              x: [0, 15, 0],
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-24 sm:bottom-32 right-4 sm:right-16 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-lg sm:blur-xl"
            animate={{
              x: [0, -12, 0],
              y: [0, 8, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 right-8 sm:right-20 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-md sm:blur-lg"
            animate={{
              x: [0, 10, 0],
              y: [0, -15, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:pb-10 lg:pt-10">
          <div className="text-center">
            {/* Enhanced badge with better animation */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
              className="mb-6 sm:mb-8 md:mb-10"
            >
              <MovingBorder duration={3000} className="inline-block">
                <Badge variant="secondary" className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="mr-2 sm:mr-3"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </motion.div>
                  AI-Powered Resume Analysis
                  <motion.div
                    className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Badge>
              </MovingBorder>
            </motion.div>

            {/* Enhanced main heading with better typography and effects */}
            <div className="mb-8 sm:mb-10 md:mb-12 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl sm:blur-3xl rounded-full opacity-30"
              />
              <TextGenerateEffect
                words="Transform Your Resume Into Career Success"
                className="relative text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
                duration={1.2}
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 1.8 }}
                className="mt-3 sm:mt-4 h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            </div>

            {/* Enhanced subtitle with better spacing and animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mb-10 sm:mb-12 md:mb-16 relative"
            >
              <p className="mx-auto max-w-4xl text-lg sm:text-xl md:text-xl lg:text-2xl leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                Get <span className="text-blue-600 dark:text-blue-400 font-semibold">AI-powered insights</span>, 
                <span className="text-purple-600 dark:text-purple-400 font-semibold"> interview questions</span>, and 
                <span className="text-pink-600 dark:text-pink-400 font-semibold"> optimization suggestions</span> to land your dream job.
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.0 }}
                className="mt-4 text-base sm:text-lg text-gray-500 dark:text-gray-400"
              >
                Upload your resume and job description to get started in seconds.
              </motion.p>
            </motion.div>

            {/* Enhanced CTA buttons with better animations and effects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mb-12 sm:mb-16 md:mb-20 flex items-center justify-center gap-4 sm:gap-6 flex-wrap"
            >
              {!authLoading && (
                <>
                  {user ? (
                    <Link href="/dashboard">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <MovingBorder duration={2000}>
                          <Button size="lg" className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-2xl shadow-blue-500/25 transition-all duration-300">
                            Go to Dashboard
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
                            </motion.div>
                          </Button>
                        </MovingBorder>
                      </motion.div>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <MovingBorder duration={2000}>
                            <Button size="lg" className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-2xl shadow-blue-500/25 transition-all duration-300">
                              Get Started Free
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.div>
                            </Button>
                          </MovingBorder>
                        </motion.div>
                      </Link>
                      <Link href="/login">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button variant="outline" size="lg" className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 text-base sm:text-lg font-medium backdrop-blur-md bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/40 shadow-lg transition-all duration-300">
                            Sign In
                          </Button>
                        </motion.div>
                      </Link>
                    </>
                  )}
                </>
              )}
            </motion.div>

            {/* Enhanced trust indicators with better design and animations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-xs sm:text-sm"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </motion.div>
                <span className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">No Credit Card Required</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </motion.div>
                <span className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">100% Secure</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </motion.div>
                <span className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Instant Results</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-16 border-y border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by Thousands of Job Seekers
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Join the community that&apos;s transforming careers with AI
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative">
                  <AnimatedCounter
                    value={stat.value}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Brain className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Our AI-powered platform provides comprehensive tools to optimize your job search process and land your dream job.
            </p>
          </motion.div>
          
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="relative h-full overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px]">
                      <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg" />
                    </div>
                    
                    <div className="relative z-10 p-8">
                      <div className="mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </CardTitle>
                      
                      <CardDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      
                      {/* Hover arrow */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium"
                      >
                        Learn more
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <Users className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Real results from real people who transformed their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer",
                company: "Tech Corp",
                image: "/api/placeholder/64/64",
                quote: "ResumeBuddy helped me identify key gaps in my resume. I got 3x more interview calls and landed my dream job at a top tech company!"
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager",
                company: "StartupXYZ",
                image: "/api/placeholder/64/64",
                quote: "The AI-powered suggestions were spot on. My resume went from generic to compelling, and I received multiple offers within weeks."
              },
              {
                name: "Emily Johnson",
                role: "Data Scientist",
                company: "Analytics Inc",
                image: "/api/placeholder/64/64",
                quote: "The interview preparation feature was a game-changer. I felt confident and prepared for every question they asked."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  
                  <Quote className="w-8 h-8 text-blue-500 mb-4 opacity-60" />
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {testimonial.quote}
                  </p>
                  
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              How{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ResumeBuddy
              </span>{' '}
              Works
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Get started in just three simple steps and transform your job search today.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection lines */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Upload Resume",
                  description: "Upload your resume in PDF or DOCX format. Our AI will extract and analyze the content instantly.",
                  icon: FileText,
                  color: "blue"
                },
                {
                  step: "2", 
                  title: "Add Job Description",
                  description: "Paste the job description you're targeting. Our AI will compare it with your resume for perfect matching.",
                  icon: Target,
                  color: "purple"
                },
                {
                  step: "3",
                  title: "Get AI Insights",
                  description: "Receive detailed analysis, interview questions, and optimization suggestions to land your dream job.",
                  icon: Brain,
                  color: "pink"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="text-center relative group"
                  >
                    {/* Step number with gradient background */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`mx-auto w-20 h-20 rounded-full ${
                        item.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        item.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        'bg-gradient-to-br from-pink-500 to-pink-600'
                      } flex items-center justify-center mb-8 shadow-lg relative z-10`}
                    >
                      <span className="text-3xl font-bold text-white">{item.step}</span>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="mx-auto w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300"
                    >
                      <Icon className={`w-8 h-8 ${
                        item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-pink-600 dark:text-pink-400'
                      }`} />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Call to action within the section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            {!authLoading && !user && (
              <Link href="/signup">
                <MovingBorder duration={2000}>
                  <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </MovingBorder>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <BackgroundBeams className="absolute inset-0 opacity-30" />
        <SparklesCore
          id="ctasection"
          background="transparent"
          minSize={0.4}
          maxSize={1.0}
          particleDensity={50}
          className="w-full h-full absolute inset-0"
          particleColor="#ffffff"
        />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Ready to Transform Your Career?
            </Badge>
            
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Land Your{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Dream Job
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                />
              </span>
            </h2>
            
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-white/90">
              Join thousands of job seekers who have improved their resumes and landed interviews with ResumeBuddy. 
              Your career transformation starts here.
            </p>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: Zap, text: "Instant AI Analysis" },
                { icon: Shield, text: "100% Secure & Private" },
                { icon: CheckCircle, text: "No Credit Card Required" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-center space-x-3 text-white/90">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 flex items-center justify-center gap-6 flex-wrap"
            >
              {!authLoading && (
                <>
                  {user ? (
                    <Link href="/dashboard">
                      <MovingBorder duration={2000} className="rounded-full">
                        <Button size="lg" className="px-10 py-4 text-lg bg-white text-gray-900 hover:bg-gray-100 rounded-full font-semibold">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </MovingBorder>
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup">
                        <MovingBorder duration={2000} className="rounded-full">
                          <Button size="lg" className="px-10 py-4 text-lg bg-white text-gray-900 hover:bg-gray-100 rounded-full font-semibold">
                            Start Free Analysis
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </MovingBorder>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10 rounded-full backdrop-blur-sm">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
              className="mt-16 flex items-center justify-center space-x-8 text-white/70"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm">10,000+ users trust us</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm ml-2">4.9/5 rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
