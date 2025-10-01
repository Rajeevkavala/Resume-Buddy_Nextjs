
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { createUserProfile, loadData } from '@/lib/firestore';
import { getUserData, saveUserData } from '@/lib/local-storage';
import { withSecurePasswordHandling, clearSensitiveData, secureLog } from '@/lib/auth-security';
import { usePageTitle } from '@/hooks/use-page-title';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  // Set page title
  usePageTitle('Login');

  // Auto-clear password from memory after timeout for additional security
  useEffect(() => {
    if (password) {
      const timeout = setTimeout(() => {
        setPassword('');
        setPasswordError('');
      }, 300000); // Clear after 5 minutes of inactivity

      return () => clearTimeout(timeout);
    }
  }, [password]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation for login (less strict than signup)
  const validateLoginPassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    } else if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleLogin = withSecurePasswordHandling(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validateLoginPassword(password);
    
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    if (emailValidationError || passwordValidationError) {
      return;
    }

    setIsLoading(true);
    
    try {
      secureLog('Starting secure login process', { email });
      
      // Firebase Auth handles secure authentication:
      // - HTTPS/TLS encryption for data transmission
      // - Server-side password verification with bcrypt
      // - Secure token generation and management
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Load user data immediately after successful authentication
      try {
        await createUserProfile(userCredential.user);
        // Check if data is in local storage first, then fallback to server
        const localData = getUserData(userCredential.user.uid);
        if (!localData || Object.keys(localData).length === 0) {
          // No local data, fetch from server
          const dbData = await loadData(userCredential.user.uid);
          if (dbData && Object.keys(dbData).length > 0) {
            saveUserData(userCredential.user.uid, dbData);
          }
        }
        // Fire event to notify components that user data is ready
        window.dispatchEvent(new CustomEvent('user-data-loaded', { detail: { userId: userCredential.user.uid } }));
      } catch (dataError) {
        console.error('Error loading user data after login:', dataError);
        // Continue with redirect even if data loading fails
      }
      
      secureLog('Login successful');
      
      // Clear password from memory for additional security
      setPassword('');
      
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      secureLog('Login failed', { error: error.code });
      
      // Clear password from memory on error
      setPassword('');
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
        setEmailError('Account not found');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
        setPasswordError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
        setEmailError('Invalid email format');
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

  const handleGoogleSignIn = async () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-background/95 border-0 shadow-2xl">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to continue your resume journey
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign In Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-medium border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
            onClick={handleGoogleSignIn}
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
              <span>Continue with Google</span>
            </div>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                      : "focus:border-blue-500"
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn(
                    "pl-10 pr-10 h-12 border-2 transition-colors",
                    passwordError 
                      ? "border-red-500 focus:border-red-500" 
                      : "focus:border-blue-500"
                  )}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Secure Login:</strong> Your credentials are encrypted with HTTPS/TLS and protected by Firebase Auth security.
              </p>
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 group",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
