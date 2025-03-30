
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadSuccessProps {
  resetUpload: () => void;
  processingStatus?: 'processing' | 'complete' | 'error';
  processingError?: string;
}

export const UploadSuccess = ({ 
  resetUpload, 
  processingStatus = 'complete',
  processingError 
}: UploadSuccessProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {processingStatus === 'processing' ? (
        <>
          <Loader2 className="h-10 w-10 text-blue-500 mb-4 animate-spin" />
          <h3 className="text-md font-medium text-gray-700 mb-2">Processing Data...</h3>
          <p className="text-sm text-gray-500 mb-4">
            We're analyzing your customer data and calculating risk scores.
          </p>
        </>
      ) : processingStatus === 'error' ? (
        <>
          <div className="h-10 w-10 text-red-500 mb-4 flex items-center justify-center rounded-full border-2 border-red-500">
            !
          </div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Processing Error</h3>
          <p className="text-sm text-red-500 mb-4">
            {processingError || "An error occurred while processing your file."}
          </p>
          <Button onClick={resetUpload} variant="outline">
            Try Again
          </Button>
        </>
      ) : (
        <>
          <Check className="h-10 w-10 text-green-500 mb-4" />
          <h3 className="text-md font-medium text-gray-700 mb-2">Upload and Processing Complete!</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your customer data has been processed and risk scores calculated.
          </p>
          <Button onClick={resetUpload} variant="outline">
            Upload Another File
          </Button>
        </>
      )}
    </div>
  );
};
