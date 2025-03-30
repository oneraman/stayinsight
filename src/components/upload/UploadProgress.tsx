
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  uploadProgress: number;
}

export const UploadProgress = ({ uploadProgress }: UploadProgressProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-md font-medium text-gray-700 mb-4">Uploading...</h3>
      <Progress value={uploadProgress} className="w-full max-w-md h-2 mb-2" />
      <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
    </div>
  );
};
