
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { processFileWithEnhancedAccuracy, EnhancedProcessingResult } from "@/utils/enhancedDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Database, AlertTriangle, LogIn, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UploadResult from "./upload/UploadResult";

export const EnhancedFileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingPhase, setProcessingPhase] = useState<'parsing' | 'processing' | 'storing' | 'complete'>('parsing');
  const [isComplete, setIsComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState<EnhancedProcessingResult | null>(null);
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

    console.log('📁 File selected for enhanced accuracy processing:', file.name);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Initializing enhanced accuracy processing...');
    setProcessingPhase('parsing');

    try {
      const result = await processFileWithEnhancedAccuracy(
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
          title: "Enhanced Processing Complete!",
          description: `Successfully processed ${result.customersProcessed} customers with ${result.dataQualityScore}% accuracy and advanced risk scoring.`,
        });
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dataUploaded'));
      } else {
        toast({
          title: "Processing Failed",
          description: "Failed to process the uploaded file with enhanced accuracy algorithms.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Enhanced accuracy processing failed:', error);
      
      toast({
        title: "Enhanced Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process file with enhanced accuracy algorithms.",
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
      case 'parsing':
        return '📖';
      case 'processing':
        return '🧠';
      case 'storing':
        return '💾';
      case 'complete':
        return '✅';
      default:
        return '📁';
    }
  };

  const getPhaseTitle = () => {
    switch (processingPhase) {
      case 'parsing':
        return 'Parsing Data...';
      case 'processing':
        return 'Enhanced Risk Analysis...';
      case 'storing':
        return 'Storing Results...';
      case 'complete':
        return 'Complete!';
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
              Please log in to upload and process customer data with enhanced accuracy algorithms.
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-800">Data Quality</div>
              <div className="text-xl font-bold text-blue-900">{processingResult.dataQualityScore}%</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">Customers Processed</div>
              <div className="text-xl font-bold text-green-900">{processingResult.customersProcessed.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="font-medium text-orange-800">High Risk</div>
              <div className="text-xl font-bold text-orange-900">{processingResult.riskDistribution.highRisk}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-medium text-purple-800">Avg Risk Score</div>
              <div className="text-xl font-bold text-purple-900">{processingResult.processingInsights.averageRiskScore.toFixed(1)}</div>
            </div>
          </div>
          
          {processingResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="font-medium text-yellow-800 mb-2">Processing Warnings:</div>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {processingResult.warnings.slice(0, 3).map((warning, index) => (
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
            <Target className="h-5 w-5 text-blue-600" />
            {getPhaseTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-xl">{getPhaseIcon()}</span>
              <span className="font-medium text-blue-700">Enhanced Accuracy Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Advanced RFM-based risk scoring</p>
            <p>• Enhanced data quality assessment</p>
            <p>• Improved duplicate detection algorithms</p>
            <p>• Behavioral pattern analysis</p>
            <p>• Multi-factor risk calculation</p>
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
          <Target className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Enhanced Accuracy Processing</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed with advanced algorithms including enhanced RFM analysis, behavioral pattern recognition, and multi-factor risk scoring for maximum accuracy.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;
