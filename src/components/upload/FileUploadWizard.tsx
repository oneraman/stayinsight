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
      onComplete(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {(['upload', 'preview'] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step ? 'bg-primary text-white' :
              currentStep === 'preview' && step === 'upload' ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step === 'upload' && <Upload className="h-4 w-4" />}
              {step === 'preview' && <FileText className="h-4 w-4" />}
            </div>
            {index < 1 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Customer Data File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload your customer data</p>
              <p className="text-sm text-gray-500 mb-4">Supports CSV, XLS, and XLSX files up to 10MB</p>
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
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tip:</strong> Your file should contain customer information like email, name, purchase history, or customer behavior data. 
                Customer IDs will be generated automatically if not present.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              File Preview
              {isAnalyzing && <Badge variant="secondary">Analyzing...</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">File Name</p>
                <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Size</p>
                <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-gray-600">{selectedFile.type || 'CSV/Excel'}</p>
              </div>
            </div>

            {/* Preview Results */}
            {filePreview && !isAnalyzing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Rows Detected</p>
                    <p className="text-lg font-bold text-blue-600">{filePreview.fileInfo.totalRows.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Columns Detected</p>
                    <p className="text-lg font-bold text-blue-600">{filePreview.fileInfo.columns.length}</p>
                  </div>
                </div>

                {/* Column Preview */}
                <div>
                  <h4 className="font-medium mb-2">Detected Columns</h4>
                  <div className="flex flex-wrap gap-2">
                    {filePreview.fileInfo.columns.slice(0, 10).map((col: string) => (
                      <Badge key={col} variant="outline" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {filePreview.fileInfo.columns.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{filePreview.fileInfo.columns.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Processing Info */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Ready for Processing:</strong> This file can be processed for customer churn analysis. 
                    {filePreview.fileInfo.totalRows > 10000 && (
                      <span> Large file detected - processing may take a few minutes.</span>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Validation Results */}
                {filePreview.warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <div className="space-y-2">
                        <strong>Processing Notes:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {filePreview.warnings.slice(0, 3).map((warning: string, i: number) => (
                            <li key={i}>{warning}</li>
                          ))}
                          {filePreview.warnings.length > 3 && (
                            <li>... and {filePreview.warnings.length - 3} more notes</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {filePreview.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-2">
                        <strong>Issues Found:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {filePreview.errors.slice(0, 3).map((error: string, i: number) => (
                            <li key={i}>{error}</li>
                          ))}
                          {filePreview.errors.length > 3 && (
                            <li>... and {filePreview.errors.length - 3} more issues</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetWizard}>
                Choose Different File
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? 'Analyzing...' : 'Continue to Upload & Process'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadWizard;