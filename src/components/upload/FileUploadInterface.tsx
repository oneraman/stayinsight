import { FileUploadWizard } from "./FileUploadWizard";
import { Upload } from "lucide-react";

interface FileUploadInterfaceProps {
  onFileSelected: (file: File) => void;
}

export const FileUploadInterface = ({ onFileSelected }: FileUploadInterfaceProps) => {
  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={onFileSelected} />
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Simplified Data Processing</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed with reliable error handling and guaranteed database storage. 
          Focus on core functionality with comprehensive logging for troubleshooting.
        </p>
      </div>
    </div>
  );
};