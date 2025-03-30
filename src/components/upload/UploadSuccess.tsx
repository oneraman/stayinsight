
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadSuccessProps {
  resetUpload: () => void;
}

export const UploadSuccess = ({ resetUpload }: UploadSuccessProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Check className="h-10 w-10 text-green-500 mb-4" />
      <h3 className="text-md font-medium text-gray-700 mb-2">Upload Successful!</h3>
      <p className="text-sm text-gray-500 mb-4">
        Your customer data file has been uploaded and is being processed.
      </p>
      <Button onClick={resetUpload} variant="outline">
        Upload Another File
      </Button>
    </div>
  );
};
