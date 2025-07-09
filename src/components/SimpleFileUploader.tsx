import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { simplifiedProcessor } from "@/utils/simplifiedDataProcessor";
import { AuthenticationPrompt } from "./upload/AuthenticationPrompt";
import { ProcessingDisplay } from "./upload/ProcessingDisplay";
import { CompletionDisplay } from "./upload/CompletionDisplay";
import { ErrorDisplay } from "./upload/ErrorDisplay";
import { FileUploadInterface } from "./upload/FileUploadInterface";

interface ProcessingResult {
  success: boolean;
  customersProcessed: number;
  processingStats: {
    totalTime: number;
    accuracyScore: number;
  };
  errors?: string[];
  error?: string;
}

export const SimpleFileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingPhase, setProcessingPhase] = useState<'parsing' | 'processing' | 'storing' | 'complete'>('parsing');
  const [isComplete, setIsComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
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
          description: result.errors?.[0] || "Failed to process the uploaded file.",
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
        processingStats: { totalTime: 0, accuracyScore: 0 },
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

  // Render different states
  if (!currentUser) {
    return <AuthenticationPrompt />;
  }

  if (isComplete && processingResult?.success) {
    return <CompletionDisplay result={processingResult} onReset={resetUploader} />;
  }

  if (processingResult && !processingResult.success) {
    return <ErrorDisplay result={processingResult} onReset={resetUploader} />;
  }

  if (isProcessing) {
    return (
      <ProcessingDisplay 
        progress={processingProgress}
        message={processingMessage}
        phase={processingPhase}
      />
    );
  }

  return <FileUploadInterface onFileSelected={handleFileSelected} />;
};

export default SimpleFileUploader;