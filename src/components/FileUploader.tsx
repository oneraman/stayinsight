
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUp, Check, AlertCircle, File } from "lucide-react";

interface FileUploaderProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

const FileUploader = ({ onUploadSuccess, onUploadError }: FileUploaderProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setUploadError(null);
      setUploadSuccess(false);
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
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const downloadURL = await uploadFileToStorage(
        file, 
        currentUser.uid,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadSuccess(true);
      setIsUploading(false);
      
      toast({
        title: "Upload successful",
        description: "Your customer data file has been uploaded successfully.",
      });

      if (onUploadSuccess) {
        onUploadSuccess(downloadURL);
      }
    } catch (error: any) {
      setIsUploading(false);
      setUploadError(error.message || "Failed to upload file. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
      });

      if (onUploadError) {
        onUploadError(error.message || "Failed to upload file");
      }
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 ${
          isUploading ? "border-blue-300 bg-blue-50" : 
          uploadSuccess ? "border-green-300 bg-green-50" : 
          uploadError ? "border-red-300 bg-red-50" : 
          "border-gray-300 bg-gray-50"
        } transition-colors duration-300`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!isUploading && !uploadSuccess ? (
          <div className="flex flex-col items-center justify-center">
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Customer Data</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Drag and drop your CSV, XLS, or XLSX file here, or click to browse
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-3"
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Supported formats: CSV, XLS, XLSX (Max 10MB)
            </p>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploading...</h3>
            <Progress value={uploadProgress} className="w-full max-w-md h-2 mb-2" />
            <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% complete</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center justify-center">
            <Check className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Your customer data file has been uploaded and is being processed.
            </p>
            <Button onClick={resetUpload} variant="outline">
              Upload Another File
            </Button>
          </div>
        ) : null}
      </div>

      {file && !isUploading && !uploadSuccess && (
        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                className="text-gray-500"
              >
                Remove
              </Button>
              <Button
                onClick={handleUpload}
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
      )}
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Required Fields</h4>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Your customer data file must include the following columns:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500">
            <li>Customer ID (unique identifier)</li>
            <li>Email address</li>
            <li>Sign-up date</li>
            <li>Last activity date</li>
            <li>Subscription value</li>
            <li>Subscription status (active/inactive)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-2">
            Optional but recommended fields include: product usage metrics, support interactions, and feature engagement data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
