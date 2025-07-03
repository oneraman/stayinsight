
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileUploadWizard } from "./upload/FileUploadWizard";
import { robustProcessor } from "@/utils/robustDataProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, LogIn, Target, TrendingUp, Brain, Database, Award, AlertTriangle, RefreshCw } from "lucide-react";
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

    console.log('🎯 File selected for robust processing:', file.name);
    console.log('👤 Current user:', currentUser.id);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Initializing robust data processing...');
    setProcessingPhase('parsing');
    setIsComplete(false);
    setProcessingResult(null);

    try {
      const result = await robustProcessor.processFileWithRobustHandling(
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
          description: `Successfully processed ${result.customersProcessed.toLocaleString()} customers. Data has been stored in the database.`,
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
      console.error('❌ Robust processing failed:', error);
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process file.",
        variant: "destructive",
      });

      setProcessingResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        customersProcessed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        warnings: []
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
      case 'processing': return 'Processing Data...';
      case 'storing': return 'Storing in Database...';
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
            Data Processing Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Customers Stored</div>
                <div className="text-xl font-bold text-blue-900">{processingResult.customersProcessed.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Database Status</div>
                <div className="text-lg font-bold text-green-900">
                  {processingResult.processingStats.dataStoredSuccessfully ? 'Success' : 'Failed'}
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-medium text-purple-800">Accuracy Score</div>
                <div className="text-lg font-bold text-purple-900">{processingResult.processingStats.accuracyScore.toFixed(1)}%</div>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">AI Insights</div>
                <div className="text-lg font-bold text-orange-900">
                  {processingResult.processingStats.aiInsightsGenerated ? 'Generated' : 'Skipped'}
                </div>
              </div>
            </div>
          </div>

          {processingResult.columnMapping && (
            <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
              <div className="font-medium text-indigo-800 mb-2">Column Mapping Results:</div>
              <div className="text-sm text-indigo-700">
                <p>✅ {processingResult.columnMapping.mappings?.length || 0} columns mapped successfully</p>
                <p>📊 {processingResult.columnMapping.confidence?.toFixed(1) || 0}% mapping confidence</p>
              </div>
            </div>
          )}

          {processingResult.warnings && processingResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="font-medium text-yellow-800 mb-2">Processing Notes:</div>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {processingResult.warnings.slice(0, 3).map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
                {processingResult.warnings.length > 3 && (
                  <li>...and {processingResult.warnings.length - 3} more notes</li>
                )}
              </ul>
            </div>
          )}

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
              {processingResult.errors.map((error: string, index: number) => (
                <p key={index}>• {error}</p>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</div>
            <ul className="text-sm text-blue-700 list-disc list-inside">
              <li>Ensure your file contains customer data with headers</li>
              <li>Check that you're logged in to your account</li>
              <li>Verify your internet connection is stable</li>
              <li>Try uploading a smaller file first</li>
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
            <Target className="h-5 w-5 text-blue-600" />
            {getPhaseTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="text-xl">{getPhaseIcon()}</span>
              <span className="font-medium text-blue-700">Robust Data Processing</span>
            </span>
            <span className="font-bold text-blue-900">{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {processingMessage}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 📖 Intelligent file parsing and validation</p>
            <p>• 🗺️ Smart column mapping with fallbacks</p>
            <p>• 💾 Robust database storage with error handling</p>
            <p>• 🧠 Optional AI insights (non-blocking)</p>
            <p>• ✅ Guaranteed completion even if insights fail</p>
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
          <Target className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Robust Data Processing Engine</p>
        </div>
        <p className="text-sm text-blue-700">
          Your data will be processed with robust error handling, comprehensive logging, 
          and guaranteed database storage. AI insights are generated when possible but won't block your data processing.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFileUploader;
