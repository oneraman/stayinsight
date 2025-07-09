import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";

interface ProcessingDisplayProps {
  progress: number;
  message: string;
  phase: 'parsing' | 'processing' | 'storing' | 'complete';
}

export const ProcessingDisplay = ({ progress, message, phase }: ProcessingDisplayProps) => {
  const getPhaseIcon = () => {
    switch (phase) {
      case 'parsing': return '📖';
      case 'processing': return '⚡';
      case 'storing': return '💾';
      case 'complete': return '✅';
      default: return '📁';
    }
  };

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Upload className="h-5 w-5 animate-pulse" />
          Processing Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">{getPhaseIcon()}</span>
            <span className="font-semibold text-primary">AI Processing</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="space-y-3">
          <Progress value={progress} className="h-3 bg-muted" />
          <p className="text-sm text-muted-foreground font-medium">
            {message}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span>📖</span>
            <span>Parsing file data</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span>⚡</span>
            <span>Processing records</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span>💾</span>
            <span>Storing securely</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span>✅</span>
            <span>Validating results</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};