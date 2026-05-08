'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceiptUploaderProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function ReceiptUploader({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
}: ReceiptUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<
    { file: File; preview: string; id: string }[]
  >([]);
  const [error, setError] = useState('');

  const validateFiles = (filesToValidate: File[]) => {
    setError('');

    if (files.length + filesToValidate.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return [];
    }

    const validated = filesToValidate.filter((file) => {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError(
          `Invalid file type: ${file.name}. Only JPG, PNG, and PDF allowed.`
        );
        return false;
      }

      if (file.size > maxSize * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum ${maxSize}MB.`);
        return false;
      }

      return true;
    });

    return validated;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validated = validateFiles(droppedFiles);

    if (validated.length > 0) {
      addFiles(validated);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validated = validateFiles(selectedFiles);

      if (validated.length > 0) {
        addFiles(validated);
      }
    }
  };

  const addFiles = (filesToAdd: File[]) => {
    const newFiles = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setFiles([...files, ...newFiles]);
    onUpload?.([...files.map((f) => f.file), ...filesToAdd]);
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200',
          isDragActive
            ? 'border-[var(--color-secondary)] bg-[var(--color-primary-lighter)] bg-opacity-5'
            : 'border-[var(--color-border)] hover:border-[var(--color-secondary)]'
        )}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="pointer-events-none">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-primary-lighter)] flex items-center justify-center mb-4">
            <Upload size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-[var(--color-text)] mb-2">
            Drag receipts here or click to upload
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            JPG, PNG, or PDF • Up to {maxSize}MB each
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            {files.length} / {maxFiles} files
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--color-text)]">
            Uploaded Files
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="relative group rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
              >
                {/* Preview */}
                {fileItem.file.type.startsWith('image/') && (
                  <img
                    src={fileItem.preview}
                    alt="preview"
                    className="w-full h-40 object-cover"
                  />
                )}
                {fileItem.file.type === 'application/pdf' && (
                  <div className="w-full h-40 bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-2xl">PDF</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {(fileItem.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(fileItem.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>

                {/* Status Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                  <Check size={12} />
                  Ready
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
