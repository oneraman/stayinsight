import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickActionsBarProps {
  onUploadClick: () => void;
  onTimeRangeChange: (days: string) => void;
  timeRange: string;
}

const QuickActionsBar = ({ 
  onUploadClick, 
  onTimeRangeChange, 
  timeRange 
}: QuickActionsBarProps) => {

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={timeRange === "7" ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeRangeChange("7")}
          className="gap-1"
        >
          <span>7 Days</span>
          {timeRange === "7" && <Badge variant="outline" className="ml-1 bg-white text-primary text-[10px] px-1.5">Active</Badge>}
        </Button>
        <Button 
          variant={timeRange === "30" ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeRangeChange("30")}
          className="gap-1"
        >
          <span>30 Days</span>
          {timeRange === "30" && <Badge variant="outline" className="ml-1 bg-white text-primary text-[10px] px-1.5">Active</Badge>}
        </Button>
        <Button 
          variant={timeRange === "90" ? "default" : "outline"}
          size="sm"
          onClick={() => onTimeRangeChange("90")}
          className="gap-1"
        >
          <span>90 Days</span>
          {timeRange === "90" && <Badge variant="outline" className="ml-1 bg-white text-primary text-[10px] px-1.5">Active</Badge>}
        </Button>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Button size="sm" onClick={onUploadClick} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <Upload className="h-3 w-3 mr-2" />
          Upload Data
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsBar;