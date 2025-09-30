'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { User } from 'firebase/auth';
import { PasswordInput } from '@/components/ui/password-input';
import { validatePassword, validatePasswordMatch, type PasswordValidationResult } from '@/lib/password-validation';
import { withSecurePasswordHandling, clearSensitiveData, secureLog } from '@/lib/auth-security';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ChangePasswordDialog({ isOpen, onClose, user }: ChangePasswordDialogProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordValidation, setNewPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const reauthenticateUser = withSecurePasswordHandling(async (currentPassword: string) => {
    if (!user?.email) throw new Error('No user email found');
    
    secureLog('Starting reauthentication process', { email: user.email });
    
    // Firebase Auth handles secure credential creation and transmission
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    secureLog('Reauthentication successful');
  });

  const onSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    // Validate new password strength
    if (!newPasswordValidation?.isValid) {
      toast.error('Please choose a stronger password that meets all requirements.');
      return;
    }

    // Validate password confirmation
    const passwordMatch = validatePasswordMatch(values.newPassword, values.confirmPassword);
    if (!passwordMatch.isValid) {
      setConfirmPasswordError(passwordMatch.error || "Passwords don't match");
      return;
    }

    setIsChangingPassword(true);

    const promise = withSecurePasswordHandling(async () => {
      secureLog('Starting password change process');
      
      // Step 1: Reauthenticate user before changing password (security requirement)
      await reauthenticateUser(values.currentPassword);
      
      // Step 2: Update password - Firebase Auth handles:
      // - HTTPS/TLS encryption during transmission
      // - Secure server-side bcrypt hashing with salt
      // - No plain text storage
      await updatePassword(user, values.newPassword);
      
      secureLog('Password update completed successfully');
      
      // Clear form data from memory for additional security
      clearSensitiveData(values);
      
      return "Password updated successfully!";
    });

    toast.promise(promise(), {
      loading: 'Updating password...',
      success: (message) => {
        form.reset();
        setNewPasswordValidation(null);
        setConfirmPasswordError('');
        onClose();
        return message;
      },
      error: (error) => {
        if (error.code === 'auth/wrong-password') {
          return 'Incorrect current password';
        } else if (error.code === 'auth/weak-password') {
          return 'Password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/requires-recent-login') {
          return 'Please log in again before changing your password for security.';
        }
        return 'Failed to update password. Please try again.';
      },
      finally: () => setIsChangingPassword(false),
    });
  };

  const handleClose = () => {
    // Clear form data and reset validation states
    const formValues = form.getValues();
    clearSensitiveData(formValues);
    form.reset();
    setNewPasswordValidation(null);
    setConfirmPasswordError('');
    onClose();
  };

  // Auto-clear sensitive data from memory after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      const formValues = form.getValues();
      if (formValues.currentPassword || formValues.newPassword || formValues.confirmPassword) {
        clearSensitiveData(formValues);
        form.reset();
      }
    }, 30000); // Clear after 30 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [form]);

  // Handle confirm password validation
  const handleConfirmPasswordChange = (value: string) => {
    const newPassword = form.getValues('newPassword');
    if (value && newPassword) {
      const passwordMatch = validatePasswordMatch(newPassword, value);
      setConfirmPasswordError(passwordMatch.isValid ? '' : (passwordMatch.error || "Passwords don't match"));
    } else {
      setConfirmPasswordError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password" 
                        className="pl-10 pr-12 h-12 border-2 focus:border-blue-500 transition-colors"
                        {...field}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* New Password with Strength Validation */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      label="New Password"
                      placeholder="Enter new password"
                      showStrengthMeter={true}
                      showCriteria={true}
                      onValidationChange={setNewPasswordValidation}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      showStrengthMeter={false}
                      showCriteria={false}
                      error={confirmPasswordError}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleConfirmPasswordChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhanced Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-2">🔐 Enterprise-Grade Security</p>
                <div className="text-xs space-y-1">
                  <p>✅ <strong>HTTPS/TLS Encryption:</strong> All data encrypted in transit</p>
                  <p>✅ <strong>Firebase Auth Security:</strong> bcrypt hashing with salt</p>
                  <p>✅ <strong>No Plain Text Storage:</strong> Passwords never stored as plain text</p>
                  <p>✅ <strong>Google Infrastructure:</strong> SOC 2 & ISO 27001 compliant</p>
                </div>
                <p className="text-xs mt-2 opacity-75">
                  Re-authentication required for additional security protection.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isChangingPassword || !newPasswordValidation?.isValid || !!confirmPasswordError}
              >
                {isChangingPassword && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}