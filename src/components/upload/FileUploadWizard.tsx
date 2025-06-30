import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processFileClientSide } from '@/utils/clientFileProcessor';
import { useToast } from '@/hooks/use-toast';

type WizardStep = 'upload' | 'preview';

interface FileUploadWizardProps {
  onComplete?: (file: File) => void;
}

export const FileUploadWizard = ({ onComplete }: FileUploadWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', file.name);
      setSelectedFile(file);
      setCurrentStep('preview');
      await analyzeFile(file);
    }
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Analyzing file for preview...');
      const result = await processFileClientSide(file);
      setFilePreview(result);
    } catch (error) {
      console.error('❌ Preview analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the selected file.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setFilePreview(null);
    setIsAnalyzing(false);
  };

  const handleContinue = () => {
    if (selectedFile && onComplete) {
      console.log('🚀 Proceeding with file processing:', selectedFile.name);
      onComplete(selectedFile);
    }
  };

  // Check if file can be processed (even with warnings)
  const canProcess = selectedFile && filePreview && !isAnalyzing;
  const hasData = filePreview?.fileInfo?.totalRows > 0;

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Compact Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        {(['upload', 'preview'] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === step ? 'bg-primary text-white' :
              currentStep === 'preview' && step === 'upload' ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step === 'upload' && <Upload className="h-3 w-3" />}
              {step === 'preview' && <FileText className="h-3 w-3" />}
            </div>
            {index < 1 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="font-medium mb-2">Upload Customer Data</p>
              <p className="text-sm text-gray-500 mb-4">CSV, XLS, XLSX files up to 10MB</p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Preview Step */}
      {currentStep === 'preview' && selectedFile && (
        <div className="space-y-3">
          {/* Compact File Info */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded text-sm">
            <div>
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {filePreview && (
              <>
                <div className="text-center">
                  <p className="font-bold text-blue-600">{filePreview.fileInfo.totalRows.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Rows</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-blue-600">{filePreview.fileInfo.columns.length}</p>
                  <p className="text-xs text-gray-500">Columns</p>
                </div>
              </>
            )}
          </div>

          {/* Compact Column Preview */}
          {filePreview && !isAnalyzing && (
            <div>
              <p className="text-sm font-medium mb-2">Detected Columns</p>
              <div className="flex flex-wrap gap-1">
                {filePreview.fileInfo.columns.slice(0, 8).map((col: string) => (
                  <Badge key={col} variant="outline" className="text-xs px-2 py-0">
                    {col}
                  </Badge>
                ))}
                {filePreview.fileInfo.columns.length > 8 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{filePreview.fileInfo.columns.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Compact Status Messages */}
          {filePreview && !isAnalyzing && (
            <div className="space-y-2">
              {/* Always show as ready if we have data */}
              {hasData && (
                <Alert className="border-green-200 bg-green-50 py-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">
                    <strong>Ready for Processing:</strong> This file can be processed for customer churn analysis.
                  </AlertDescription>
                </Alert>
              )}

              {/* Compact warnings */}
              {filePreview.warnings.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50 py-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Processing Notes:</strong> Customer IDs will be generated automatically. 
                    {filePreview.warnings.length > 1 && ` +${filePreview.warnings.length - 1} more notes.`}
                  </AlertDescription>
                </Alert>
              )}

              {/* No data warning */}
              {!hasData && (
                <Alert className="border-red-200 bg-red-50 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    <strong>No Data Found:</strong> Please check your file format and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Fixed Action Buttons */}
          <div className="flex gap-2 pt-2 border-t bg-white sticky bottom-0">
            <Button variant="outline" onClick={resetWizard} size="sm">
              Choose Different File
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={!canProcess || !hasData}
              className="flex-1"
              size="sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Continue to Upload & Process'}
            </Button>
          </div>

          {/* Help text for disabled button */}
          {!hasData && filePreview && (
            <p className="text-xs text-gray-500 text-center">
              The "Continue" button will be enabled once valid data is detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadWizard;