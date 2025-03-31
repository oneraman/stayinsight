
import { useState, useCallback } from "react";
import { Upload, AlertCircle, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { useAuth } from "@/contexts/AuthContext";

export const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      // Check file type
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
        setFile(droppedFile);
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
    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
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
      setUploading(true);
      setUploadProgress(0);

      await uploadFileToStorage(
        file,
        currentUser.uid,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded and is being processed.",
      });

      // Reset state
      setFile(null);
      setUploading(false);
      setUploadProgress(0);
      
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
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
                id="file-upload"
                name="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={uploading}
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
                {!uploading ? (
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
                  <div className="flex items-center w-24">
                    <span className="text-xs text-gray-500 mr-2">{uploadProgress.toFixed(0)}%</span>
                    <Progress value={uploadProgress} className="h-2 w-full" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {uploading && file && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uploading...</span>
              <span className="text-gray-700 font-medium">{uploadProgress.toFixed(0)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
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

export default FileUploader;
