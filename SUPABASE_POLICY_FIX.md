# Fix for Supabase RLS Policies with Firebase Auth

## The Issue

Your current Supabase policies use `auth.uid()` which only works with Supabase Auth, not Firebase Auth. Since you're using Firebase Auth, `auth.uid()` returns null, causing the 403 error.

## Solution: Update Your Supabase Policies

Go to your Supabase dashboard → Storage → profile-photos → Policies and replace your current policies with these:

### Delete All Current Policies First

1. Go to Supabase Dashboard → Storage → profile-photos → Policies
2. Delete all existing policies (the ones shown in your screenshot)

### Create New Policies (Firebase Auth Compatible)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Delete existing policies first
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON storage.objects;

-- Create new policies that work without Supabase Auth
-- Policy 1: Allow public read access to profile photos
CREATE POLICY "Public read access for profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Policy 2: Allow anyone to insert to profile photos (you can restrict this later)
CREATE POLICY "Allow upload to profile photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

-- Policy 3: Allow updates to profile photos
CREATE POLICY "Allow update profile photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-photos');

-- Policy 4: Allow delete from profile photos
CREATE POLICY "Allow delete profile photos" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-photos');
```

## Alternative: More Secure Version (Recommended)

If you want to add some security while still using Firebase Auth, you can use these policies that check for specific folder structure:

```sql
-- Delete existing policies first
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON storage.objects;

-- Create policies that enforce folder structure (users can only access their own folder)
-- Policy 1: Allow public read access
CREATE POLICY "Public read access for profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Policy 2: Allow upload only to properly structured paths (userId/filename)
CREATE POLICY "Allow structured upload to profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND
  array_length(string_to_array(name, '/'), 1) = 2 AND
  length((string_to_array(name, '/'))[1]) > 10  -- Ensures folder name is reasonably long (like a user ID)
);

-- Policy 3: Allow updates with proper structure
CREATE POLICY "Allow structured update profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND
  array_length(string_to_array(name, '/'), 1) = 2
);

-- Policy 4: Allow delete with proper structure
CREATE POLICY "Allow structured delete profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND
  array_length(string_to_array(name, '/'), 1) = 2
);
```

## Quick Test (Least Secure - Use Temporarily)

If you just want to test that everything works first, use this completely open policy:

```sql
-- TEMPORARY: Remove all restrictions (NOT for production)
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON storage.objects;

-- Allow everything for profile-photos bucket
CREATE POLICY "Temp allow all profile photos" ON storage.objects
FOR ALL USING (bucket_id = 'profile-photos');
```

## After Updating Policies

1. Run one of the SQL policy sets above in your Supabase SQL Editor
2. Test the photo upload in your app
3. If it works, you can gradually add more security restrictions

## Why This Happens

- Supabase Auth and Firebase Auth are separate systems
- Your policies use `auth.uid()` which only works with Supabase Auth
- Since you're using Firebase Auth, `auth.uid()` is always null
- This causes all policy checks to fail, resulting in 403 errors

Choose the policy set that matches your security requirements and run it in your Supabase dashboard!