import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ProcessingResult {
  success: boolean;
  errors?: string[];
}

interface ErrorDisplayProps {
  result: ProcessingResult;
  onReset: () => void;
}

export const ErrorDisplay = ({ result, onReset }: ErrorDisplayProps) => {
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
            {result.errors?.map((error: string, index: number) => (
              <p key={index}>• {error}</p>
            )) || <p>Unknown error occurred</p>}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</div>
          <ul className="text-sm text-blue-700 list-disc list-inside">
            <li>Ensure your file contains customer data with headers</li>
            <li>Check that you're logged in to your account</li>
            <li>Try uploading a smaller file first</li>
            <li>Verify your internet connection is stable</li>
          </ul>
        </div>
        
        <div className="mt-4 text-center">
          <Button onClick={onReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};