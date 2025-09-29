'use client';

import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, Trash2, Loader2, Edit, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProfilePhoto, deleteProfilePhoto, checkSupabaseSetup } from '@/lib/supabase';
import { useDropzone } from 'react-dropzone';
import { ImageEditor } from './image-editor';

interface ProfilePhotoUploaderProps {
  userId: string;
  currentPhotoUrl?: string | null;
  userName?: string | null;
  onPhotoChange: (photoUrl: string | null) => void;
  disabled?: boolean;
}

export function ProfilePhotoUploader({
  userId,
  currentPhotoUrl,
  userName,
  onPhotoChange,
  disabled = false
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB for editing)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Store the file and open editor
    setSelectedFile(file);
    setIsEditorOpen(true);
  };

  const handleDirectUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to Supabase
      const photoUrl = await uploadProfilePhoto(userId, file);
      
      // Call the parent component's handler
      onPhotoChange(photoUrl);
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo. Please try again.';
      
      // Provide specific guidance for common errors
      if (errorMessage.includes('row-level security')) {
        toast.error('Storage permissions issue. Please check if you are signed in and try again.');
      } else if (errorMessage.includes('Bucket not found')) {
        toast.error('Storage bucket not found. Please create the "profile-photos" bucket in Supabase.');
      } else if (errorMessage.includes('JWT')) {
        toast.error('Authentication issue. Please sign out and sign back in.');
      } else {
        toast.error(errorMessage);
      }
      
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditorSave = async (editedFile: File) => {
    await handleDirectUpload(editedFile);
    setSelectedFile(null);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedFile(null);
  };

  const handleDeletePhoto = async () => {
    if (!currentPhotoUrl) return;

    setIsDeleting(true);
    
    try {
      const success = await deleteProfilePhoto(userId, currentPhotoUrl);
      
      if (success) {
        onPhotoChange(null);
        setPreviewUrl(null);
        toast.success('Profile photo removed successfully!');
      } else {
        toast.error('Failed to remove photo. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to remove photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: disabled || isUploading
  });

  const displayPhotoUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <Avatar className="h-24 w-24 ring-2 ring-border">
          {displayPhotoUrl && <AvatarImage src={displayPhotoUrl} alt={userName || 'Profile'} />}
          <AvatarFallback className="text-2xl font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Choose & Edit'}
            </Button>

            {displayPhotoUrl && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Convert current photo to file for editing
                    fetch(displayPhotoUrl)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], 'current-photo.jpg', { type: 'image/jpeg' });
                        handleFileSelect(file);
                      })
                      .catch(() => toast.error('Failed to load current photo for editing'));
                  }}
                  disabled={disabled || isUploading}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Current
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePhoto}
                  disabled={disabled || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeleting ? 'Removing...' : 'Remove'}
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF up to 10MB • Crop, adjust, and enhance your photos
          </p>
        </div>
      </div>

      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${(disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <Upload className={`w-6 h-6 ${
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <Palette className={`w-6 h-6 ${
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            
            <p className="text-sm font-medium mb-1">
              {isDragActive ? 'Drop your photo here' : 'Drag & drop to edit your photo'}
            </p>
            
            <p className="text-xs text-muted-foreground text-center">
              Crop, adjust colors, rotate, and enhance<br />
              or click anywhere to browse files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        imageFile={selectedFile}
        onSave={handleEditorSave}
      />
    </div>
  );
}