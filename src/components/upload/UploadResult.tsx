import { CheckCircle, AlertTriangle, Info, BarChart3, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface UploadResult {
  success: boolean;
  message: string;
  customersProcessed?: number;
  errors?: string[];
  warnings?: string[];
  duplicatesFound?: number;
  dataQualityScore?: number;
}

interface UploadResultProps {
  result: UploadResult;
}

const UploadResult = ({ result }: UploadResultProps) => {
  const getIcon = () => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getAlertClass = () => {
    if (result.success) {
      return "border-green-200 bg-green-50";
    }
    return "border-red-200 bg-red-50";
  };

  const getMessageClass = () => {
    if (result.success) {
      return "text-green-800 font-medium";
    }
    return "text-red-800 font-medium";
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <Alert className={getAlertClass()}>
      <div className="flex items-center">
        {getIcon()}
      </div>
      <AlertDescription className="ml-2">
        <div className="space-y-4">
          <p className={getMessageClass()}>
            {result.message}
          </p>
          
          {result.success && result.customersProcessed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Customers Processed */}
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Customers Processed</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {result.customersProcessed.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Data Quality Score */}
              {result.dataQualityScore !== undefined && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Data Quality</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${getQualityColor(result.dataQualityScore)}`}>
                        {result.dataQualityScore}%
                      </span>
                      <Badge variant="outline" className={getQualityColor(result.dataQualityScore)}>
                        {getQualityLabel(result.dataQualityScore)}
                      </Badge>
                    </div>
                    <Progress 
                      value={result.dataQualityScore} 
                      className="h-2 mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Duplicates Found */}
              {result.duplicatesFound !== undefined && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duplicates Found</p>
                    <p className="text-lg font-semibold text-amber-700">
                      {result.duplicatesFound}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {result.warnings && result.warnings.length > 0 && (
            <details className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <summary className="cursor-pointer font-medium flex items-center gap-1">
                <Info className="h-4 w-4" />
                Processing Notes ({result.warnings.length})
              </summary>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-4 text-xs text-amber-600">
                {result.warnings.slice(0, 10).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
                {result.warnings.length > 10 && (
                  <li className="font-medium">
                    ... and {result.warnings.length - 10} more notes
                  </li>
                )}
              </ul>
            </details>
          )}

          {result.errors && result.errors.length > 0 && (
            <details className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              <summary className="cursor-pointer font-medium flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Processing Errors ({result.errors.length})
              </summary>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-4 text-xs text-red-600">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="font-medium">
                    ... and {result.errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </details>
          )}

          {result.success && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Processing Complete</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li>• Enhanced churn analysis algorithms applied</li>
                <li>• Risk scores calculated with improved accuracy</li>
                <li>• Data quality assessment completed</li>
                <li>• Customer segmentation optimized</li>
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadResult;