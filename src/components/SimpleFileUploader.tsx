
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
      <Card className="glass-effect border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Data Processing Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="status-low rounded-xl p-6">
            <div className="text-center">
              <div className="text-sm font-medium text-success mb-2">Successfully Processed</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
                {processingResult.customersProcessed} customers
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="font-medium text-primary mb-3">Processing Stats:</div>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Data stored successfully in database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Processing time: {(processingResult.processingStats.totalTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Data accuracy score: {processingResult.processingStats.accuracyScore}%</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <div className="font-medium mb-3">Next Steps:</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">1</div>
                <span>Visit the Dashboard to view your customer data</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-bold">2</div>
                <span>Review customer analytics and insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center text-warning text-xs font-bold">3</div>
                <span>Check customer risk assessments</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="flex-1 sm:flex-none">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={resetUploader}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Upload Another File
            </Button>
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
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Upload className="h-5 w-5 animate-pulse" />
            Processing Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">{getPhaseIcon()}</span>
              <span className="font-semibold text-primary">AI Processing</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {Math.round(processingProgress)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <Progress value={processingProgress} className="h-3 bg-muted" />
            <p className="text-sm text-muted-foreground font-medium">
              {processingMessage}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span>📖</span>
              <span>Parsing file data</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span>⚡</span>
              <span>Processing records</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span>💾</span>
              <span>Storing securely</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span>✅</span>
              <span>Validating results</span>
            </div>
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
