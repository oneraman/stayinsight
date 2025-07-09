import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ProcessingResult {
  success: boolean;
  customersProcessed: number;
  processingStats: {
    totalTime: number;
    accuracyScore: number;
  };
}

interface CompletionDisplayProps {
  result: ProcessingResult;
  onReset: () => void;
}

export const CompletionDisplay = ({ result, onReset }: CompletionDisplayProps) => {
  return (
    <Card className="glass-effect border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          Data Processing Complete!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="status-low rounded-xl p-6">
          <div className="text-center">
            <div className="text-sm font-medium text-success mb-2">Successfully Processed</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
              {result.customersProcessed} customers
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="font-medium text-primary mb-3">Processing Stats:</div>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Data stored successfully in database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Processing time: {(result.processingStats.totalTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Data accuracy score: {result.processingStats.accuracyScore}%</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <div className="font-medium mb-3">Next Steps:</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">1</div>
              <span>Visit the Dashboard to view your customer data</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-bold">2</div>
              <span>Review customer analytics and insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center text-warning text-xs font-bold">3</div>
              <span>Check customer risk assessments</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={onReset}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            Upload Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};