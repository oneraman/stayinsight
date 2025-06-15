
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadResult as UploadResultType } from "@/utils/fileUpload";

interface UploadResultProps {
  result: UploadResultType;
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

  return (
    <Alert className={getAlertClass()}>
      <div className="flex items-center">
        {getIcon()}
      </div>
      <AlertDescription className="ml-2">
        <div className="space-y-2">
          <p className={getMessageClass()}>
            {result.message}
          </p>
          
          {result.customersProcessed && (
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3 text-blue-600" />
              <p className="text-sm text-blue-700">
                Successfully processed <span className="font-semibold">{result.customersProcessed}</span> customer records
              </p>
            </div>
          )}
          
          {result.errors && result.errors.length > 0 && (
            <details className="text-sm text-amber-700">
              <summary className="cursor-pointer font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                View warnings ({result.errors.length})
              </summary>
              <ul className="mt-2 list-disc list-inside space-y-1 ml-4">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-xs">{error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-xs font-medium">
                    ... and {result.errors.length - 5} more warnings
                  </li>
                )}
              </ul>
            </details>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadResult;
