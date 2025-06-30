import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    // Here you would typically calculate the number of days from now to the selected date
    // For now we'll just use preset values
  };

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
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              <Calendar className="h-3 w-3 mr-2" />
              {date ? format(date, "MMM d, yyyy") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Filter className="h-3 w-3 mr-2" />
          Filter
        </Button>
        <Button size="sm" onClick={onUploadClick} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <Upload className="h-3 w-3 mr-2" />
          Upload Data
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsBar;