import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { uploadFileToStorageEnhanced } from "@/utils/enhancedFileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Database } from "lucide-react";

export const EnhancedFileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileSelected = async (file: File) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload customer data.",
        variant: "destructive",
      });
      return;
    }

    console.log('📁 File selected for processing:', file.name);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Preparing to upload and process file...');

    try {
      const result = await uploadFileToStorageEnhanced(
        file,
        currentUser.uid,
        (progressInfo) => {
          setProcessingProgress(progressInfo.progress);
          setProcessingMessage(progressInfo.message);
        }
      );

      setProcessingResult(result);

      if (result.success) {
        setIsComplete(true);
        toast({
          title: "Success!",
          description: result.message,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        toast({
          title: "Processing Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Upload and processing failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload and process file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUploader = () => {
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingMessage('');
    setIsComplete(false);
    setProcessingResult(null);
  };

  if (isComplete && processingResult?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Upload Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-green-700">
              {processingResult.message}
            </p>
            {processingResult.customersProcessed && (
              <p className="text-sm text-gray-600">
                Successfully processed {processingResult.customersProcessed} customer records.
              </p>
            )}
            {processingResult.errors && processingResult.errors.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-amber-700">
                  View {processingResult.errors.length} warnings
                </summary>
                <ul className="mt-2 list-disc list-inside space-y-1 ml-4 text-xs text-amber-600">
                  {processingResult.errors.slice(0, 5).map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                  {processingResult.errors.length > 5 && (
                    <li>... and {processingResult.errors.length - 5} more</li>
                  )}
                </ul>
              </details>
            )}
            <button 
              onClick={resetUploader}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Upload another file
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Processing Customer Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage} ({processingProgress}%)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileSelected} />
      
      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Please log in to upload and process your customer data.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUploader;