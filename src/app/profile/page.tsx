
'use client';

import { useAuth } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { updateUserProfile } from '@/app/actions';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ProfilePhotoUploader } from '@/components/profile-photo-uploader';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }).max(50, {
    message: 'Display name must not be longer than 50 characters.',
  }),
});

const emailFormSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, loading: authLoading, forceReloadUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      form.reset({
        displayName: user.displayName || '',
      });
      setCurrentPhotoUrl(user.photoURL || null);
    }
  }, [user, authLoading, router, form]);

  const handlePhotoChange = (photoUrl: string | null) => {
    setCurrentPhotoUrl(photoUrl);
  };

  const reauthenticateUser = async (currentPassword: string) => {
    if (!user?.email) throw new Error('No user email found');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  };

  const sendCurrentEmailVerification = async () => {
    if (!user) return;
    setIsSendingVerification(true);

    const promise = async () => {
      await sendEmailVerification(user);
      return "Verification email sent to your current email address!";
    };

    toast.promise(promise(), {
      loading: 'Sending verification email...',
      success: (message) => message,
      error: (error) => {
        console.error('Verification email error:', error);
        if (error.code === 'auth/too-many-requests') {
          return 'Too many requests. Please wait before requesting another verification email.';
        }
        return 'Failed to send verification email. Please try again.';
      },
      finally: () => setIsSendingVerification(false),
    });
  };

  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    if (!user) return;
    setIsChangingEmail(true);

    const promise = async () => {
      // Step 1: Reauthenticate user before changing email
      await reauthenticateUser(values.currentPassword);
      
      // Step 2: Send verification email to new address before updating
      // This method sends a verification email to the new address and only updates the email after verification
      await verifyBeforeUpdateEmail(user, values.newEmail);
      
      return "Verification email sent! Please check your new email address and click the verification link to complete the email change.";
    };

    toast.promise(promise(), {
      loading: 'Sending verification email...',
      success: (message) => {
        emailForm.reset();
        return message;
      },
      error: (error) => {
        console.error('Email update error:', error);
        if (error.code === 'auth/wrong-password') {
          return 'Incorrect current password';
        } else if (error.code === 'auth/email-already-in-use') {
          return 'This email is already in use by another account';
        } else if (error.code === 'auth/invalid-email') {
          return 'Invalid email address';
        } else if (error.code === 'auth/requires-recent-login') {
          return 'Please log out and log back in before changing your email';
        } else if (error.code === 'auth/operation-not-allowed') {
          return 'Email verification is required. Please check your email and verify before updating.';
        }
        return 'Failed to send verification email. Please try again.';
      },
      finally: () => setIsChangingEmail(false),
    });
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user) return;
    setIsChangingPassword(true);

    const promise = async () => {
      // Reauthenticate user before changing password
      await reauthenticateUser(values.currentPassword);
      
      // Update password
      await updatePassword(user, values.newPassword);
      
      return "Password updated successfully!";
    };

    toast.promise(promise(), {
      loading: 'Updating password...',
      success: (message) => {
        passwordForm.reset();
        return message;
      },
      error: (error) => {
        if (error.code === 'auth/wrong-password') {
          return 'Incorrect current password';
        } else if (error.code === 'auth/weak-password') {
          return 'Password is too weak. Please choose a stronger password.';
        }
        return 'Failed to update password. Please try again.';
      },
      finally: () => setIsChangingPassword(false),
    });
  };
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('displayName', values.displayName);
    if (currentPhotoUrl) {
      formData.append('photoURL', currentPhotoUrl);
    }

    const promise = updateUserProfile(user.uid, formData).then(async (newProfileData) => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const updateData: { displayName?: string; photoURL?: string } = {};
        if (newProfileData.displayName) {
          updateData.displayName = newProfileData.displayName;
        }
        // Use the current photo URL that was set by the photo uploader
        if (currentPhotoUrl) {
          updateData.photoURL = currentPhotoUrl;
        }
        
        await updateProfile(currentUser, updateData);
      }
      
      // Force a reload of the user object from Firebase to get the new data
      await forceReloadUser?.();
      return "Profile updated successfully!";
    });

    toast.promise(promise, {
        loading: 'Updating profile...',
        success: (message) => message,
        error: 'Failed to update profile.',
        finally: () => setIsSubmitting(false),
    });
  };

  // Show skeleton while loading instead of blocking
  const showSkeleton = authLoading || !user;

  return (
    <div className="flex-1 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          {showSkeleton ? (
            <>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>Loading your profile...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-20" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-muted animate-pulse rounded-full" />
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                  </div>
                </div>
                <div className="h-px bg-muted animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  <div className="h-12 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded w-32" />
                </div>
                <div className="h-px bg-muted animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded w-36" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted animate-pulse rounded w-32" />
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Profile Information Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Profile Photo
                      </label>
                      <ProfilePhotoUploader
                        userId={user.uid}
                        currentPhotoUrl={currentPhotoUrl}
                        userName={user.displayName}
                        onPhotoChange={handlePhotoChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                </Form>

                <Separator />

                {/* Email Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <h3 className="text-lg font-medium">Email Address</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Email</label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {user.email || 'No email address'}
                    </div>
                    {!user.emailVerified && (
                      <div className="space-y-2">
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                          ⚠️ Your current email is not verified. Some features may be limited.
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={sendCurrentEmailVerification}
                          disabled={isSendingVerification}
                        >
                          {isSendingVerification && (
                            <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                          )}
                          <Mail className="mr-2 h-3 w-3" />
                          Verify Current Email
                        </Button>
                      </div>
                    )}
                  </div>

                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter new email address" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Enter current password" 
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-3">
                        <div className="text-sm text-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                          📧 <strong className="text-blue-800">Email Change Process:</strong><br/>
                          <div className="mt-2 space-y-1 text-slate-600">
                            <div>1. Enter your new email and current password</div>
                            <div>2. Click "Send Verification Email"</div>
                            <div>3. Check your new email for a verification link</div>
                            <div>4. Click the verification link to complete the change</div>
                          </div>
                        </div>
                        
                        <Button type="submit" disabled={isChangingEmail} size="sm">
                          {isChangingEmail && (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          )}
                          <Mail className="mr-2 h-4 w-4" />
                          Send Verification Email
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>

                <Separator />

                {/* Password Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <h3 className="text-lg font-medium">Change Password</h3>
                  </div>

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Enter current password" 
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter new password (min. 6 characters)" 
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm new password" 
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isChangingPassword} size="sm">
                        {isChangingPassword && (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        )}
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </Button>
                    </form>
                  </Form>
                </div>

              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
