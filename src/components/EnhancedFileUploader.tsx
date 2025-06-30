import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { processFileWithSupabase, ProcessingProgress } from "@/utils/supabaseDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Database, AlertTriangle, LogIn, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UploadResult from "./upload/UploadResult";

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
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload customer data.",
        variant: "destructive",
      });
      return;
    }

    console.log('📁 File selected for enhanced Supabase processing:', file.name);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Initializing enhanced processing...');
    setProcessingPhase('uploading');

    try {
      const result = await processFileWithSupabase(
        file,
        currentUser.id,
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
          description: `Enhanced processing complete! ${result.customersProcessed} customers processed with ${result.dataQualityScore}% data quality.`,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        toast({
          title: "Processing Failed",
          description: "Failed to process the uploaded file with enhanced algorithms.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Enhanced upload and processing failed:', error);
      
      if (error instanceof Error && error.message.includes('not authenticated')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload customer data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload and process file with enhanced algorithms.",
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
        return 'Enhanced Processing...';
      case 'storing':
        return 'Storing in Database...';
      default:
        return 'Processing...';
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
              Please log in to upload and process customer data with enhanced algorithms.
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
            Enhanced Processing Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UploadResult result={{
            success: true,
            message: `Successfully processed ${processingResult.customersProcessed} customer records with enhanced algorithms!`,
            customersProcessed: processingResult.customersProcessed,
            errors: processingResult.errors,
            warnings: processingResult.warnings,
            duplicatesFound: processingResult.duplicatesFound,
            dataQualityScore: processingResult.dataQualityScore
          }} />
          
          <div className="mt-4 text-center">
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
            <Zap className="h-5 w-5 text-blue-600" />
            {getPhaseTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-xl">{getPhaseIcon()}</span>
              <span className="font-medium text-blue-700">Enhanced Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage} ({processingProgress}%)
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Advanced risk scoring algorithms</p>
            <p>• Enhanced data quality assessment</p>
            <p>• Improved duplicate detection</p>
            <p>• Optimized database storage</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileSelected} />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Enhanced Processing</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed with advanced algorithms for improved accuracy, including enhanced risk scoring, data quality assessment, and duplicate detection.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;