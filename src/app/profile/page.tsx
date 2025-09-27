
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
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { updateUserProfile } from '@/app/actions';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }).max(50, {
    message: 'Display name must not be longer than 50 characters.',
  }),
  photoURL: z.any().optional(),
});

export default function ProfilePage() {
  const { user, loading: authLoading, forceReloadUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPhotoPreview(user.photoURL || null);
    }
  }, [user, authLoading, router, form]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('displayName', values.displayName);
    if (values.photoURL instanceof File) {
        formData.append('photoURL', values.photoURL);
    }

    const promise = updateUserProfile(user.uid, formData).then(async (newProfileData) => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const updateData: { displayName?: string; photoURL?: string } = {};
        if (newProfileData.displayName) {
          updateData.displayName = newProfileData.displayName;
        }
        // Use the photoURL from the server action if a new one was uploaded
        if (newProfileData.photoURL) {
          updateData.photoURL = newProfileData.photoURL;
        } else {
          // Otherwise, retain the existing photoURL
          updateData.photoURL = currentUser.photoURL || undefined;
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

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
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
                 <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                           <Avatar className="h-20 w-20">
                                <AvatarImage src={photoPreview || user.photoURL || ''} />
                                <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                           </Avatar>
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             className="hidden"
                             accept="image/png, image/jpeg, image/gif"
                             onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    field.onChange(file);
                                    setPhotoPreview(URL.createObjectURL(file));
                                 }
                             }}
                           />
                           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4"/>
                                Upload Photo
                           </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
}
