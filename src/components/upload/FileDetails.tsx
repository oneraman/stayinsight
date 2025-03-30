
import { File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileDetailsProps {
  file: File;
  uploadError: string | null;
  resetUpload: () => void;
  handleUpload: () => void;
}

export const FileDetails = ({ file, uploadError, resetUpload, handleUpload }: FileDetailsProps) => {
  return (
    <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <File className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              resetUpload();
            }}
            className="text-gray-500"
          >
            Remove
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
          >
            Upload
          </Button>
        </div>
      </div>
      
      {uploadError && (
        <div className="mt-2 flex items-start text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
