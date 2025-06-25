
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, FileSearch, AlertCircle, CheckCircle } from 'lucide-react';
import { analyzeFileWithGemini, FileDiagnosticResult } from '@/utils/fileDiagnostics';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileDiagnosticsProps {
  file: File;
  onAnalysisComplete?: (result: FileDiagnosticResult) => void;
}

const FileDiagnostics = ({ file, onAnalysisComplete }: FileDiagnosticsProps) => {
  const [analysis, setAnalysis] = useState<FileDiagnosticResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeFile = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting file analysis with Gemini AI...');
      const result = await analyzeFileWithGemini(file);
      setAnalysis(result);
      onAnalysisComplete?.(result);
      console.log('✅ Analysis completed:', result);
    } catch (error) {
      console.error('❌ Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileSearch className="h-5 w-5" />
          AI File Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-4">
            <p className="text-blue-700 mb-4">
              Having trouble processing your file? Let Gemini AI analyze it and provide recommendations.
            </p>
            <Button 
              onClick={handleAnalyzeFile}
              disabled={isAnalyzing}
              className="gap-2"
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze File with AI
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className={analysis.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center">
                {analysis.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <div className="font-medium text-sm">
                    {analysis.success ? 'Analysis Complete' : 'Analysis Failed'}
                  </div>
                  
                  {analysis.fileStructure && (
                    <div className="text-xs space-y-1">
                      <p><strong>Sheets:</strong> {analysis.fileStructure.sheetNames.join(', ')}</p>
                      <p><strong>Columns ({analysis.fileStructure.columnCount}):</strong> {analysis.fileStructure.columns.join(', ')}</p>
                      <p><strong>Rows:</strong> {analysis.fileStructure.rowCount}</p>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <strong>AI Analysis:</strong>
                    <div className="mt-2 p-3 bg-white/70 rounded border text-xs whitespace-pre-wrap">
                      {analysis.analysis}
                    </div>
                  </div>
                  
                  {analysis.recommendations.length > 0 && (
                    <div className="text-sm">
                      <strong>Recommendations:</strong>
                      <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAnalyzeFile}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Re-analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Re-analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileDiagnostics;
