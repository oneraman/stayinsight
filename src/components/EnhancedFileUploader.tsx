import { useState, useCallback, useRef } from "react";
import { Upload, AlertCircle, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadFileToStorage, UploadResult } from "@/utils/fileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import UploadResult as UploadResultComponent from "@/components/upload/UploadResult";
import UploadProgressDisplay from "@/components/upload/UploadProgressDisplay";

export const EnhancedFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const uploadTaskRef = useRef<any>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const progressState = useUploadProgress();

  const resetUploadState = () => {
    progressState.resetProgress();
    setUploadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      resetUploadState();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
        setFile(droppedFile);
        resetUploadState();
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV, XLS, or XLSX file.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const clearFile = () => {
    setFile(null);
    resetUploadState();
    const fileInput = document.getElementById("enhanced-file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const cancelUpload = () => {
    console.log("Cancelling upload, current phase:", progressState.phase);
    if (uploadTaskRef.current && progressState.phase === 'uploading') {
      console.log("Cancelling Firebase upload task");
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
    }
    progressState.resetProgress();
    toast({
      title: "Upload cancelled",
      description: "File upload has been cancelled.",
      variant: "destructive",
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting enhanced upload process for file:", file.name);
      resetUploadState();
      progressState.updateProgress(0, 'uploading', 'Preparing upload...');

      const result = await uploadFileToStorage(
        file,
        currentUser.uid,
        (progressInfo, uploadTask) => {
          console.log("Enhanced progress update received:", progressInfo);
          uploadTaskRef.current = uploadTask;
          progressState.updateProgress(progressInfo.progress, progressInfo.phase, progressInfo.message);
        }
      );

      console.log("Enhanced upload process completed with result:", result);
      uploadTaskRef.current = null;
      setUploadResult(result);

      if (result.success) {
        progressState.completeUpload('Upload completed successfully!');
        toast({
          title: "Upload successful",
          description: result.message,
        });
        
        // Reset file but keep result visible
        setFile(null);
        const fileInput = document.getElementById("enhanced-file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        progressState.resetProgress();
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Enhanced upload error:", error);
      uploadTaskRef.current = null;
      progressState.resetProgress();
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
          } ${file ? "bg-gray-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium">Drag and drop your file here</p>
                <p className="text-xs text-gray-500 mt-1">Or click to browse</p>
              </div>
              <input
                id="enhanced-file-upload"
                name="enhanced-file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={progressState.isUploading}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById("enhanced-file-upload")?.click()}
                disabled={progressState.isUploading}
                className="mt-2"
              >
                Browse files
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!progressState.isUploading ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFile}
                      className="h-8 w-8 p-0" 
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleUpload}
                      className="h-8"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Uploading...</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {progressState.isUploading && (
          <UploadProgressDisplay
            progressState={progressState}
            onCancel={cancelUpload}
            fileName={file?.name || 'Unknown file'}
          />
        )}

        {uploadResult && (
          <UploadResultComponent result={uploadResult} />
        )}
        
        <div className="flex items-start mt-2">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-500">
            <p>Your file should include customer ID, email, name, purchase history, and spend data.</p>
            <p>Maximum file size: 10MB. Supported formats: CSV, XLS, XLSX</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;
