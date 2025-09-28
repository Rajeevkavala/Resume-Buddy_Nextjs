# Profile Photo Upload with Supabase Integration

## Overview

This implementation adds profile photo upload functionality to the ResumeBuddy application using Supabase for storage, with automatic syncing of Firebase Google Auth profile photos.

## Features Implemented

### 1. Supabase Storage Setup
- **Location**: `src/lib/supabase.ts`
- **Bucket**: `profile-photos`
- **Functions**:
  - `uploadProfilePhoto()` - Upload image files directly
  - `uploadProfilePhotoFromURL()` - Sync from external URLs (Google Auth)
  - `deleteProfilePhoto()` - Remove photos from storage
  - `listUserProfilePhotos()` - List user's uploaded photos

### 2. Enhanced Profile Photo Uploader Component
- **Location**: `src/components/profile-photo-uploader.tsx`
- **Features**:
  - Drag & drop upload
  - File type validation (JPG, PNG, GIF, WebP)
  - Size limit validation (5MB max)
  - Real-time preview
  - Delete functionality
  - Loading states
  - Responsive design

### 3. Automatic Google Auth Photo Sync
- **Location**: `src/context/auth-context.tsx`
- **Functionality**:
  - Detects Google Auth sign-ins
  - Automatically uploads Google profile photos to Supabase
  - Non-blocking background operation
  - Error handling for failed syncs

### 4. Updated Profile Page
- **Location**: `src/app/profile/page.tsx`
- **Changes**:
  - Replaced basic file input with advanced ProfilePhotoUploader
  - Integrated real-time photo URL updates
  - Maintains Firebase Auth profile sync

### 5. Server Actions Update
- **Location**: `src/app/actions.ts`
- **Changes**:
  - Modified `updateUserProfile()` to handle Supabase URLs
  - Removed Firebase Storage dependency for photos
  - Simplified photo URL handling

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://hlduevifufaasxmrtjks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZHVldmlmdWZhYXN4bXJ0amtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDg4MzEsImV4cCI6MjA3NDQ4NDgzMX0.6IrkqdNW-J2Aam7oVJSa65fe6tLJWO-bf_nhFVYEzZs
```

### Required Supabase Setup
1. Create a storage bucket named `profile-photos`
2. Set appropriate access policies:
   ```sql
   -- Allow authenticated users to upload their own photos
   CREATE POLICY "Users can upload their own profile photos" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow public read access to profile photos
   CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
   FOR SELECT USING (bucket_id = 'profile-photos');
   
   -- Allow users to delete their own photos
   CREATE POLICY "Users can delete their own profile photos" ON storage.objects
   FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Usage Flow

### For New Users (Direct Upload)
1. User navigates to `/profile`
2. Uses ProfilePhotoUploader component
3. Drag & drops or selects image file
4. File uploads to Supabase storage
5. URL updates in component state
6. Form submission saves URL to Firebase Auth & Firestore

### For Google Auth Users
1. User signs in with Google
2. AuthContext detects Google provider
3. Automatically uploads Google photo to Supabase
4. User can later manage/replace photo via profile page

## File Structure
```
src/
├── lib/
│   └── supabase.ts              # Supabase client & photo functions
├── components/
│   └── profile-photo-uploader.tsx # Advanced upload component
├── context/
│   └── auth-context.tsx         # Enhanced with Google photo sync
├── app/
│   ├── actions.ts               # Updated server actions
│   └── profile/
│       └── page.tsx            # Updated profile page
└── .env.local                   # Supabase credentials
```

## Dependencies Added
- `@supabase/supabase-js` - Supabase client library

## Security Considerations
- File type validation prevents malicious uploads
- Size limits prevent storage abuse
- User isolation through folder structure (`userId/filename`)
- Public read access with authenticated write/delete

## Error Handling
- Graceful degradation for failed uploads
- User-friendly error messages via toast notifications
- Non-blocking Google photo sync
- Proper cleanup of preview URLs

## Benefits
1. **Scalable Storage**: Supabase provides dedicated image storage
2. **Better Performance**: CDN-backed image delivery
3. **User Experience**: Drag & drop, previews, progress indication
4. **Automatic Sync**: Google Auth photos seamlessly integrated
5. **Cost Effective**: Supabase free tier generous for profile photos

## Testing
- Upload various image formats (JPG, PNG, GIF, WebP)
- Test file size limits (try >5MB file)
- Verify drag & drop functionality
- Test Google Auth photo sync
- Verify delete functionality
- Check responsive design on mobile

The implementation is now complete and ready for use!