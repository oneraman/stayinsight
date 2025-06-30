import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Size</p>
                <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-gray-600">{selectedFile.type || 'Unknown'}</p>
              </div>
            </div>

            {/* Preview Results */}
            {filePreview && !isAnalyzing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Rows Detected</p>
                    <p className="text-lg font-bold text-blue-600">{filePreview.fileInfo.totalRows}</p>
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
                    {filePreview.fileInfo.columns.slice(0, 8).map((col: string) => (
                      <Badge key={col} variant="outline" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                    {filePreview.fileInfo.columns.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{filePreview.fileInfo.columns.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Validation Results */}
                {filePreview.errors.length > 0 && (
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-800">Issues Found</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {filePreview.errors.slice(0, 3).map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                      {filePreview.errors.length > 3 && (
                        <li>... and {filePreview.errors.length - 3} more issues</li>
                      )}
                    </ul>
                  </div>
                )}

                {filePreview.warnings.length > 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Warnings</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {filePreview.warnings.slice(0, 2).map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                      {filePreview.warnings.length > 2 && (
                        <li>... and {filePreview.warnings.length - 2} more warnings</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetWizard}>
                Choose Different File
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={isAnalyzing || (filePreview && !filePreview.success)}
              >
                {isAnalyzing ? 'Analyzing...' : 'Continue to Upload'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadWizard;