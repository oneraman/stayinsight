
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadProgressState } from "@/hooks/useUploadProgress";

interface UploadProgressDisplayProps {
  progressState: UploadProgressState;
  onCancel: () => void;
  fileName: string;
}

const UploadProgressDisplay = ({ 
  progressState, 
  onCancel, 
  fileName 
}: UploadProgressDisplayProps) => {
  const getPhaseEmoji = () => {
    switch (progressState.phase) {
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      default:
        return '📁';
    }
  };

  const getPhaseTitle = () => {
    switch (progressState.phase) {
      case 'uploading':
        return 'Uploading File...';
      case 'processing':
        return 'Processing Data...';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getPhaseEmoji()}</span>
          <div>
            <p className="text-sm font-medium text-blue-700">
              {getPhaseTitle()}
            </p>
            <p className="text-xs text-blue-600">{fileName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-blue-900 font-mono">
            {Math.round(progressState.progress)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={progressState.progress} className="h-3 bg-blue-100" />
        <p className="text-sm text-blue-600 font-medium min-h-[20px]">
          {progressState.message || 'Working...'}
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onCancel}
          disabled={progressState.phase === 'processing'}
        >
          {progressState.phase === 'processing' ? 'Processing...' : 'Cancel Upload'}
        </Button>
      </div>
    </div>
  );
};

export default UploadProgressDisplay;
