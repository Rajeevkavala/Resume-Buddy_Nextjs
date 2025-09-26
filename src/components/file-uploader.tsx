
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
        <div className="flex items-center justify-between rounded-lg border border-muted p-3">
          <div className="flex items-center gap-2">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors ${
            isDragActive ? 'border-primary' : 'border-input'
          }`}
        >
          <input {...getInputProps()} id="resume-upload" />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, or TXT
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
