
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { useToast } from "@/components/ui/use-toast";
import { DropZone } from "@/components/upload/DropZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { UploadSuccess } from "@/components/upload/UploadSuccess";
import { FileDetails } from "@/components/upload/FileDetails";

export const FileUploader = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(false);
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
    } catch (error: any) {
      setIsUploading(false);
      setUploadError(error.message || "Failed to upload file. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
      });
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
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 ${
          isUploading ? "border-blue-300 bg-blue-50" : 
          uploadSuccess ? "border-green-300 bg-green-50" : 
          uploadError ? "border-red-300 bg-red-50" : 
          "border-gray-300 bg-gray-50"
        } transition-colors duration-300 cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        {!isUploading && !uploadSuccess ? (
          <DropZone 
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
            uploadSuccess={uploadSuccess}
          />
        ) : isUploading ? (
          <UploadProgress uploadProgress={uploadProgress} />
        ) : uploadSuccess ? (
          <UploadSuccess resetUpload={resetUpload} />
        ) : null}
      </div>

      {file && !isUploading && !uploadSuccess && (
        <FileDetails 
          file={file}
          uploadError={uploadError}
          resetUpload={resetUpload}
          handleUpload={handleUpload}
        />
      )}
    </div>
  );
};
