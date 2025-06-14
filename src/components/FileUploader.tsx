
import { useState, useCallback, useRef } from "react";
import { Upload, AlertCircle, File, X, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToStorage, UploadResult } from "@/utils/fileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const uploadTaskRef = useRef<any>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
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
        setUploadResult(null);
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
    setUploadResult(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const cancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
      setUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload cancelled",
        description: "File upload has been cancelled.",
        variant: "destructive",
      });
    }
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
      setUploadResult(null);

      const result = await uploadFileToStorage(
        file,
        currentUser.uid,
        (progress, uploadTask) => {
          uploadTaskRef.current = uploadTask;
          setUploadProgress(progress);
        }
      );

      uploadTaskRef.current = null;
      setUploadResult(result);

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message,
        });
        
        // Reset file but keep result visible
        setFile(null);
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      uploadTaskRef.current = null;
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
                  <>
                    <div className="flex items-center w-24">
                      <span className="text-xs text-gray-500 mr-2">{uploadProgress.toFixed(0)}%</span>
                      <Progress value={uploadProgress} className="h-2 w-full" />
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={cancelUpload}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uploading and processing...</span>
              <span className="text-gray-700 font-medium">{uploadProgress.toFixed(0)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center">
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <AlertDescription className="ml-2">
              <div className="space-y-1">
                <p className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                  {uploadResult.message}
                </p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <details className="text-sm text-amber-700">
                    <summary className="cursor-pointer">View warnings ({uploadResult.errors.length})</summary>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {uploadResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <li>... and {uploadResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
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
