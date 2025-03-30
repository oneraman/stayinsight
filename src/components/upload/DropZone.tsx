
import { useState, useRef } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadSuccess: boolean;
}

export const DropZone = ({ onFileSelected, isUploading, uploadSuccess }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelected(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelected(event.dataTransfer.files[0]);
    }
  };

  if (isUploading || uploadSuccess) {
    return null;
  }

  return (
    <div 
      className="flex flex-col items-center justify-center text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FileUp className="h-10 w-10 text-gray-400 mb-4" />
      <p className="text-md font-medium text-gray-700 mb-1">
        Drag and drop your Excel or XML files here
      </p>
      <p className="text-sm text-gray-500 mb-1">or</p>
      <Button 
        variant="outline"
        className="mt-2"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Browse Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx,.xml"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500 mt-3">
        Supported formats: .xlsx, .xls, .xml
      </p>
    </div>
  );
};
