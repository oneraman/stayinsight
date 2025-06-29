
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { ProcessedFileData } from "@/utils/clientFileProcessor";
import { storeCustomerData } from "@/utils/simpleDataStorage"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Database } from "lucide-react";

export const EnhancedFileUploader = () => {
  const [isStoring, setIsStoring] = useState(false);
  const [storageProgress, setStorageProgress] = useState(0);
  const [storageMessage, setStorageMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileProcessed = async (result: ProcessedFileData) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save customer data.",
        variant: "destructive",
      });
      return;
    }

    console.log('📊 File processed, starting storage:', result);
    
    setIsStoring(true);
    setStorageProgress(0);
    setStorageMessage('Preparing to store customer data...');

    try {
      const storageResult = await storeCustomerData(
        result.data,
        (processed, total, message) => {
          const progress = Math.round((processed / total) * 100);
          setStorageProgress(progress);
          setStorageMessage(message);
        }
      );

      if (storageResult.success) {
        setIsComplete(true);
        toast({
          title: "Success!",
          description: `Successfully stored ${storageResult.processed} customer records.`,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        throw new Error(storageResult.message);
      }
      
    } catch (error) {
      console.error('❌ Storage failed:', error);
      toast({
        title: "Storage Failed",
        description: error instanceof Error ? error.message : "Failed to store customer data.",
        variant: "destructive",
      });
    } finally {
      setIsStoring(false);
    }
  };

  const resetUploader = () => {
    setIsStoring(false);
    setStorageProgress(0);
    setStorageMessage('');
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Upload Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Your customer data has been successfully processed and stored.
          </p>
          <button 
            onClick={resetUploader}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Upload another file
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isStoring) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Storing Customer Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={storageProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {storageMessage} ({storageProgress}%)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileProcessed} />
      
      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Please log in to save your customer data to the database.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUploader;
