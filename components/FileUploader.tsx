
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons/IconComponents';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  processing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, processing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please drop a PDF file.');
      }
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center items-center w-full px-6 py-12 border rounded-sm transition-colors duration-300 ${isDragging ? 'border-primary-700 bg-primary-100/50 dark:bg-primary-900/20' : 'border-slate-400 dark:border-slate-600 hover:border-primary-600'} bg-white/50 dark:bg-slate-800/20 dark:hover:bg-slate-800/30`}
      >
        <div className="text-center">
          <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 text-2xl font-semibold font-display text-slate-800 dark:text-slate-100">
            Drag & Drop Your PDF
          </p>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">or</p>
          <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
            <span className="px-6 py-3 bg-primary-700 text-white rounded-sm font-semibold hover:bg-primary-800 transition-colors uppercase tracking-wider text-sm">
              Select a PDF file
            </span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={processing}
            />
          </label>
           <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Your file will be processed locally in your browser for privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;