
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onUploadComplete?: (file: File) => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv' || fileType === 'xls' || fileType === 'xlsx') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload a CSV or Excel file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadSuccess(true);
      toast({
        title: "File uploaded successfully",
        description: "Your data is being processed and will be available shortly.",
      });
      
      if (onUploadComplete) {
        onUploadComplete(file);
      }
    } catch (err) {
      setError("An error occurred while uploading. Please try again.");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Customer Data</CardTitle>
        <CardDescription>
          Upload your customer data as CSV or Excel file to analyze churn risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadSuccess ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-churnify-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-churnify-blue focus-within:ring-offset-2 hover:text-churnify-dark-blue"
                >
                  <span>Upload a file</span>
                  <Input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                CSV or Excel files up to 10MB
              </p>
            </div>
            
            {file && (
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-xs font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}
            
            {error && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-12 w-12 text-churnify-green mb-2" />
            <h3 className="text-lg font-medium">Upload Complete!</h3>
            <p className="text-sm text-gray-500">
              Your data is being processed. You'll be notified when it's ready.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!uploadSuccess ? (
          <>
            <Button
              variant="outline"
              onClick={() => setFile(null)}
              disabled={!file || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-churnify-blue hover:bg-churnify-dark-blue"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={resetUpload}
            className="mx-auto"
          >
            Upload Another File
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
