
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { optimizedProcessor } from "@/utils/optimizedDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, LogIn, Zap, Target, Clock, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EnhancedFileUploader = () => {
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

    console.log('📁 File selected for optimized processing:', file.name);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Initializing optimized processing...');
    setProcessingPhase('parsing');

    try {
      const result = await optimizedProcessor.processFileOptimized(
        file,
        currentUser.id,
        (progress) => {
          setProcessingProgress(progress.progress);
          setProcessingMessage(progress.message);
          setProcessingPhase(progress.phase as any);
        }
      );

      setProcessingResult(result);

      if (result.success) {
        setIsComplete(true);
        toast({
          title: "Optimized Processing Complete!",
          description: `Successfully processed ${result.customersProcessed.toLocaleString()} customers in ${(result.processingTime / 1000).toFixed(2)}s with ${result.dataQualityScore}% quality.`,
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
      console.error('❌ Optimized processing failed:', error);
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process file.",
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

  const getPhaseTitle = () => {
    switch (processingPhase) {
      case 'parsing': return 'Parsing Data...';
      case 'processing': return 'Optimized Analysis...';
      case 'storing': return 'Storing Results...';
      case 'complete': return 'Complete!';
      default: return 'Processing...';
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
            Optimized Processing Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-800">Customers Processed</div>
              <div className="text-xl font-bold text-blue-900">{processingResult.customersProcessed.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">Data Quality</div>
              <div className="text-xl font-bold text-green-900">{processingResult.dataQualityScore}%</div>
            </div>
            <div className="bg-purple-50 p-3 rounded flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">Processing Time</div>
                <div className="text-lg font-bold text-purple-900">{(processingResult.processingTime / 1000).toFixed(2)}s</div>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">Memory Usage</div>
                <div className="text-lg font-bold text-orange-900">{processingResult.memoryUsage.toFixed(1)}MB</div>
              </div>
            </div>
          </div>
          
          {processingResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="font-medium text-yellow-800 mb-2">Processing Notes:</div>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {processingResult.warnings.slice(0, 3).map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
                {processingResult.warnings.length > 3 && (
                  <li>...and {processingResult.warnings.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          
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
              <span className="font-medium text-blue-700">Optimized Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• ⚡ Web Workers for parallel processing</p>
            <p>• 📊 Streaming data parsing</p>
            <p>• 🧠 Optimized risk scoring algorithms</p>
            <p>• 💾 Efficient database batching</p>
            <p>• 🚀 Memory-optimized operations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FileUploadWizard onComplete={handleFileSelected} />
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Optimized Processing Engine</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed using advanced optimization techniques including web workers, streaming, and intelligent batching for maximum speed and efficiency.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;
