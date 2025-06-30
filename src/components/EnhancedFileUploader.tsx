import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { processFileWithSupabase, ProcessingProgress } from "@/utils/supabaseDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Database, AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EnhancedFileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingPhase, setProcessingPhase] = useState<'uploading' | 'processing' | 'storing'>('uploading');
  const [isComplete, setIsComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFileSelected = async (file: File) => {
    // Check authentication first
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload customer data.",
        variant: "destructive",
      });
      return;
    }

    console.log('📁 File selected for Supabase processing:', file.name);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Preparing to process file with Supabase...');
    setProcessingPhase('uploading');

    try {
      const result = await processFileWithSupabase(
        file,
        currentUser.uid,
        (progress: ProcessingProgress) => {
          setProcessingProgress(progress.progress);
          setProcessingMessage(progress.message);
          setProcessingPhase(progress.phase);
        }
      );

      setProcessingResult(result);

      if (result.success) {
        setIsComplete(true);
        toast({
          title: "Success!",
          description: `Successfully processed ${result.customersProcessed} customers with Supabase!`,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        toast({
          title: "Processing Failed",
          description: "Failed to process the uploaded file.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Supabase upload and processing failed:', error);
      
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes('not authenticated')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload customer data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload and process file with Supabase.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUploader = () => {
    setIsProcessing(false);
    setProcessingProgress(0);
    setProcessingMessage('');
    setProcessingPhase('uploading');
    setIsComplete(false);
    setProcessingResult(null);
  };

  const getPhaseIcon = () => {
    switch (processingPhase) {
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'storing':
        return '💾';
      default:
        return '📁';
    }
  };

  const getPhaseTitle = () => {
    switch (processingPhase) {
      case 'uploading':
        return 'Reading File...';
      case 'processing':
        return 'Processing Customer Data...';
      case 'storing':
        return 'Storing in Supabase Database...';
      default:
        return 'Processing...';
    }
  };

  // Show authentication required message if user is not logged in
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
              Please log in to upload and process customer data with Supabase.
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
            Supabase Upload Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-green-700 font-medium">
              ✅ Successfully processed {processingResult.customersProcessed} customer records with Supabase!
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Data stored in Supabase PostgreSQL database</p>
              <p>• Real-time analytics ready</p>
              <p>• Enhanced churn analysis enabled</p>
            </div>
            {processingResult.errors && processingResult.errors.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  View {processingResult.errors.length} processing notes
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
            {getPhaseTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-xl">{getPhaseIcon()}</span>
              <span className="font-medium text-blue-700">Supabase Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage} ({processingProgress}%)
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Using Supabase PostgreSQL for optimal performance</p>
            <p>• Real-time row-level security enabled</p>
            <p>• Enhanced churn analysis features active</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileSelected} />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Powered by Supabase:</strong> Your data will be processed and stored in a secure PostgreSQL database with real-time capabilities.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;