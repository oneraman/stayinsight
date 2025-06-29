
import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { processFileClientSide, ProcessedFileData, generateFilePreview } from '@/utils/clientFileProcessor';
import { useToast } from '@/hooks/use-toast';

type WizardStep = 'upload' | 'preview' | 'processing' | 'complete';

interface FileUploadWizardProps {
  onComplete?: (result: ProcessedFileData) => void;
}

export const FileUploadWizard = ({ onComplete }: FileUploadWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedFileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', file.name);
      setSelectedFile(file);
      setCurrentStep('preview');
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      console.log('🔄 Processing file...');
      const result = await processFileClientSide(file);
      setProcessedData(result);
      setCurrentStep(result.success ? 'complete' : 'preview');
    } catch (error) {
      console.error('❌ Processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the selected file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setProcessedData(null);
    setIsProcessing(false);
  };

  const handleComplete = () => {
    if (processedData && onComplete) {
      onComplete(processedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {(['upload', 'preview', 'complete'] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step ? 'bg-primary text-white' :
              ['upload', 'preview'].indexOf(currentStep) > ['upload', 'preview'].indexOf(step) ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step === 'upload' && <Upload className="h-4 w-4" />}
              {step === 'preview' && <FileText className="h-4 w-4" />}
              {step === 'complete' && <CheckCircle className="h-4 w-4" />}
            </div>
            {index < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
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
      {(currentStep === 'preview' || currentStep === 'processing') && processedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              File Analysis Results
              {isProcessing && <Badge variant="secondary">Processing...</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">File Name</p>
                <p className="text-sm text-gray-600">{processedData.fileInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Size</p>
                <p className="text-sm text-gray-600">{(processedData.fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm font-medium">Rows</p>
                <p className="text-sm text-gray-600">{processedData.fileInfo.totalRows}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Columns</p>
                <p className="text-sm text-gray-600">{processedData.fileInfo.columns.length}</p>
              </div>
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="font-medium mb-2">Data Preview (First 3 rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      {processedData.fileInfo.columns.map(col => (
                        <th key={col} className="p-2 text-left border-b">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.data.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {processedData.fileInfo.columns.map(col => (
                          <td key={col} className="p-2 border-b">{String(row[col] || '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Results */}
            {processedData.errors.length > 0 && (
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-800">Errors Found</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {processedData.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {processedData.warnings.length > 0 && (
              <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Warnings</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {processedData.warnings.slice(0, 3).map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetWizard}>
                Choose Different File
              </Button>
              {processedData.success && (
                <Button onClick={() => setCurrentStep('complete')} disabled={isProcessing}>
                  Continue to Process
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {currentStep === 'complete' && processedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              File Ready for Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              ✅ Successfully analyzed {processedData.fileInfo.totalRows} customer records
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleComplete}>
                Process Data
              </Button>
              <Button variant="outline" onClick={resetWizard}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadWizard;
