
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
import { Save, Mail, Lock, RefreshCw, CheckCircle, Shield, Edit, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { updateUserProfile } from '@/app/actions';
import { updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ProfilePhotoUploader } from '@/components/profile-photo-uploader';
import { ChangeEmailDialog } from '@/components/change-email-dialog';
import { ChangePasswordDialog } from '@/components/change-password-dialog';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }).max(50, {
    message: 'Display name must not be longer than 50 characters.',
  }),
});



export default function ProfilePage() {
  const { user, loading: authLoading, forceReloadUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
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

  const handlePhotoChange = async (photoUrl: string | null) => {
    setCurrentPhotoUrl(photoUrl);
    // Force a reload of the user object from Firebase to get the new data
    await forceReloadUser?.();
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

  const handleSaveAllChanges = async () => {
    if (!user) return;
    
    // Get current form values
    const displayNameValue = form.getValues('displayName');
    
    // Validate display name form
    const isDisplayNameValid = await form.trigger();
    
    if (isDisplayNameValid) {
      await onSubmit({ displayName: displayNameValue });
      setIsEditMode(false);
    }
  };

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Cancel edit mode - reset form to original values
      form.reset({
        displayName: user?.displayName || '',
      });
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  // Show skeleton while loading instead of blocking
  const showSkeleton = authLoading || !user;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {showSkeleton ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Profile Settings</CardTitle>
              <CardDescription>Loading your profile...</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Skeleton for horizontal layout */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="h-32 w-32 bg-muted animate-pulse rounded-full mx-auto" />
                  <div className="h-6 bg-muted animate-pulse rounded w-24 mx-auto" />
                  <div className="h-4 bg-muted animate-pulse rounded w-32 mx-auto" />
                </div>
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl">Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and security settings
                  </CardDescription>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSaveAllChanges}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting && (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEditModeToggle}
                        disabled={isSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleEditModeToggle}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Profile Photo & Basic Info */}
                <div className="md:col-span-1">
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">
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
                      
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg">
                          {user.displayName || 'Anonymous User'}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" title="Email Verified" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-yellow-200 border-2 border-yellow-400" title="Email Not Verified" />
                          )}
                        </div>
                        
                        {/* Email Verification Status */}
                        <div className="mt-3">
                          {user.emailVerified ? (
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                              <CheckCircle className="h-3 w-3" />
                              Email Verified
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
                                <div className="h-2 w-2 bg-yellow-400 rounded-full" />
                                Verification Pending
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={sendCurrentEmailVerification}
                                disabled={isSendingVerification}
                                className="w-full"
                              >
                                {isSendingVerification && (
                                  <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                                )}
                                <Mail className="mr-2 h-3 w-3" />
                                Verify Email
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Forms */}
                <div className="md:col-span-2 space-y-6">
                  {/* Display Name Form */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <h3 className="text-lg font-semibold">Display Name</h3>
                    </div>
                    <Form {...form}>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your Name" 
                                  readOnly={!isEditMode}
                                  className={!isEditMode ? "bg-muted cursor-default" : ""}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Form>
                  </div>

                  {/* Security Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <h3 className="text-lg font-semibold">Security Settings</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={() => setIsChangeEmailDialogOpen(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">Change Email</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          Update your email address with verification
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={() => setIsChangePasswordDialogOpen(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span className="font-medium">Change Password</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-left">
                          Update your account password
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Email Dialog */}
        {user && (
          <ChangeEmailDialog
            isOpen={isChangeEmailDialogOpen}
            onClose={() => setIsChangeEmailDialogOpen(false)}
            user={user}
          />
        )}

        {/* Change Password Dialog */}
        {user && (
          <ChangePasswordDialog
            isOpen={isChangePasswordDialogOpen}
            onClose={() => setIsChangePasswordDialogOpen(false)}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
