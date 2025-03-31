
import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToStorage } from "@/utils/fileUpload";
import { useAuth } from "@/contexts/AuthContext";

export const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Customer data file (CSV, XLS, XLSX)
        </label>
        
        <div className="flex items-center space-x-2">
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button 
            onClick={handleUpload}
            disabled={!file || uploading}
            size="sm"
          >
            {uploading ? (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </span>
            )}
          </Button>
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Uploading: {uploadProgress.toFixed(0)}%</div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {file && (
          <div className="text-sm text-gray-500">
            Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        
        <div className="flex items-start mt-2">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-500">
            <p>Your file should include customer ID, email, name, purchase history, and spend data.</p>
            <p>Maximum file size: 10MB.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
