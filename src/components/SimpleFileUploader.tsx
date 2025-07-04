
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { simplifiedProcessor } from "@/utils/simplifiedDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, LogIn, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const SimpleFileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingPhase, setProcessingPhase] = useState<'parsing' | 'processing' | 'storing' | 'complete'>('parsing');
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

    console.log('🎯 File selected for processing:', file.name);
    console.log('👤 Current user:', currentUser.id);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Starting data processing...');
    setProcessingPhase('parsing');
    setIsComplete(false);
    setProcessingResult(null);

    try {
      const result = await simplifiedProcessor.processFileSimply(
        file,
        currentUser.id,
        (progress) => {
          console.log('📊 Processing progress:', progress);
          setProcessingProgress(progress.progress);
          setProcessingMessage(progress.message);
          setProcessingPhase(progress.phase as any);
        }
      );

      console.log('🎉 Processing completed:', result);
      setProcessingResult(result);

      if (result.success) {
        setIsComplete(true);
        toast({
          title: "Data Processing Complete!",
          description: `Successfully processed ${result.customersProcessed} customers.`,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        toast({
          title: "Processing Failed",
          description: result.errors[0] || "Failed to process the uploaded file.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Processing failed:', error);
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process file.",
        variant: "destructive",
      });

      setProcessingResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        customersProcessed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUploader = () => {
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingMessage('');
    setProcessingPhase('parsing');
    setIsComplete(false);
    setProcessingResult(null);
  };

  const getPhaseIcon = () => {
    switch (processingPhase) {
      case 'parsing': return '📖';
      case 'processing': return '⚡';
      case 'storing': return '💾';
      case 'complete': return '✅';
      default: return '📁';
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-blue-600" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Please log in to upload and process customer data.
            </p>
            <div className="space-x-2">
              <Button asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete && processingResult?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Data Processing Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <div className="text-green-800">
              <div className="font-medium mb-2">Successfully Processed:</div>
              <div className="text-2xl font-bold">{processingResult.customersProcessed} customers</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="font-medium text-blue-800 mb-2">Processing Stats:</div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>✅ Data stored successfully in database</p>
              <p>📊 Processing time: {(processingResult.processingStats.totalTime / 1000).toFixed(2)}s</p>
              <p>🎯 Data accuracy score: {processingResult.processingStats.accuracyScore}%</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="font-medium text-gray-800 mb-2">Next Steps:</div>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              <li>Visit the Dashboard to view your customer data</li>
              <li>Review customer analytics and insights</li>
              <li>Check customer risk assessments</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center space-x-2">
            <Button asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
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

  // Show error state if processing failed
  if (processingResult && !processingResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Processing Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="font-medium text-red-800 mb-2">Error Details:</div>
            <div className="text-sm text-red-700">
              {processingResult.errors?.map((error: string, index: number) => (
                <p key={index}>• {error}</p>
              )) || <p>Unknown error occurred</p>}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</div>
            <ul className="text-sm text-blue-700 list-disc list-inside">
              <li>Ensure your file contains customer data with headers</li>
              <li>Check that you're logged in to your account</li>
              <li>Try uploading a smaller file first</li>
              <li>Verify your internet connection is stable</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <Button onClick={resetUploader} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
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
            <Upload className="h-5 w-5 text-blue-600" />
            Processing Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-xl">{getPhaseIcon()}</span>
              <span className="font-medium text-blue-700">Data Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>📖 Parsing file data and headers</p>
            <p>⚡ Processing customer records</p>
            <p>💾 Storing data in secure database</p>
            <p>✅ Finalizing and validating results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileSelected} />
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Simplified Data Processing</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed with reliable error handling and guaranteed database storage. 
          Focus on core functionality with comprehensive logging for troubleshooting.
        </p>
      </div>
    </div>
  );
};

export default SimpleFileUploader;
