
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { createUserProfile, loadData } from '@/lib/firestore';
import { getUserData, saveUserData } from '@/lib/local-storage';
import { PasswordInput } from '@/components/ui/password-input';
import { validatePassword, validatePasswordMatch, type PasswordValidationResult } from '@/lib/password-validation';
import { withSecurePasswordHandling, clearSensitiveData, secureLog } from '@/lib/auth-security';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  // Auto-clear passwords from memory after timeout for additional security
  useEffect(() => {
    if (password || confirmPassword) {
      const timeout = setTimeout(() => {
        setPassword('');
        setConfirmPassword('');
        setConfirmPasswordError('');
      }, 300000); // Clear after 5 minutes of inactivity

      return () => clearTimeout(timeout);
    }
  }, [password, confirmPassword]);

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Full name is required';
    } else if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Handle confirm password validation
  const handleConfirmPasswordChange = (value: string) => {
    if (value && password) {
      const passwordMatch = validatePasswordMatch(password, value);
      setConfirmPasswordError(passwordMatch.isValid ? '' : (passwordMatch.error || "Passwords don't match"));
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSignup = withSecurePasswordHandling(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all inputs
    const nameValidationError = validateName(name);
    const emailValidationError = validateEmail(email);
    
    setNameError(nameValidationError);
    setEmailError(emailValidationError);
    
    if (nameValidationError || emailValidationError) {
      return;
    }

    // Validate password strength
    if (!passwordValidation?.isValid) {
      toast.error('Please choose a stronger password that meets all requirements.');
      return;
    }

    // Validate password confirmation
    const passwordMatch = validatePasswordMatch(password, confirmPassword);
    if (!passwordMatch.isValid) {
      setConfirmPasswordError(passwordMatch.error || "Passwords don't match");
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      secureLog('Starting secure account creation', { email, name });
      
      // Firebase Auth handles secure account creation:
      // - HTTPS/TLS encryption for data transmission
      // - Secure password hashing with bcrypt + salt
      // - No plain text password storage
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      // Load user data immediately after successful account creation
      try {
        await createUserProfile(userCredential.user);
        // Fire event to notify components that user data is ready (new users won't have existing data)
        window.dispatchEvent(new CustomEvent('user-data-loaded', { detail: { userId: userCredential.user.uid } }));
      } catch (dataError) {
        console.error('Error setting up user profile after signup:', dataError);
        // Continue with redirect even if profile setup fails
      }
      
      secureLog('Account creation successful');
      
      // Clear passwords from memory for additional security
      setPassword('');
      setConfirmPassword('');
      
      toast.success('Account created successfully! Welcome to ResumeBuddy!');
      router.push('/dashboard');
    } catch (error: any) {
      secureLog('Account creation failed', { error: error.message });
      
      // Clear passwords from memory on error
      setPassword('');
      setConfirmPassword('');
      
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  });

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error handling is done in the signInWithGoogle function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-blue-900/20 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-background/95 border-0 shadow-2xl">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Join ResumeBuddy
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Create your account and start building amazing resumes
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign Up Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-medium border-2 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            type="button"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </div>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground font-medium">or create with email</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={cn(
                    "pl-10 h-12 border-2 transition-colors",
                    nameError 
                      ? "border-red-500 focus:border-red-500" 
                      : "focus:border-emerald-500"
                  )}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                />
              </div>
              {nameError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={cn(
                    "pl-10 h-12 border-2 transition-colors",
                    emailError 
                      ? "border-red-500 focus:border-red-500" 
                      : "focus:border-emerald-500"
                  )}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Password Input */}
            <div className="space-y-3">
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                showStrengthMeter={true}
                showCriteria={true}
                onValidationChange={setPasswordValidation}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                showStrengthMeter={false}
                showCriteria={false}
                error={confirmPasswordError}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  handleConfirmPasswordChange(e.target.value);
                }}
              />
            </div>

            {/* Enhanced Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-emerald-800 dark:text-emerald-200">
                <p className="font-medium mb-2">🔐 Enterprise-Grade Security</p>
                <div className="text-xs space-y-1">
                  <p>✅ <strong>HTTPS/TLS:</strong> All data encrypted during transmission</p>
                  <p>✅ <strong>bcrypt Hashing:</strong> Passwords secured with salt</p>
                  <p>✅ <strong>Firebase Auth:</strong> Google's secure infrastructure</p>
                  <p>✅ <strong>No Plain Text:</strong> Passwords never stored as plain text</p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 group",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || !passwordValidation?.isValid || !!confirmPasswordError}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
