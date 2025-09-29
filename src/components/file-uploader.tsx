
'use client';

import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  setPreview: (preview: string) => void;
}

export default function FileUploader({ file, setFile, setPreview }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setPreview(''); // Clear previous text preview
      }
    },
    [setFile, setPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  const handleRemoveFile = () => {
    setFile(null);
    setPreview('');
  };

  return (
    <div>
      {file ? (
        <div className="group relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate max-w-[250px]">
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Success indicator */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full opacity-60" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} id="resume-upload" />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragActive 
                ? 'bg-primary/10 text-primary scale-110' 
                : 'bg-primary/5 text-primary/70 group-hover:bg-primary/10 group-hover:scale-105'
            }`}>
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium">
                {isDragActive ? 'Drop your file here' : (
                  <>
                    <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, or TXT files supported
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <span>•</span>
                <span>Max size: 10MB</span>
                <span>•</span>
                <span>Secure upload</span>
              </div>
            </div>
          </div>
          {/* Subtle animated border effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}
    </div>
  );
}
