
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

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
          variant="outline" 
          size="sm"
          className={timeRange === "7" ? "bg-primary text-white hover:bg-primary/90" : ""}
          onClick={() => onTimeRangeChange("7")}
        >
          7 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className={timeRange === "30" ? "bg-primary text-white hover:bg-primary/90" : ""}
          onClick={() => onTimeRangeChange("30")}
        >
          30 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className={timeRange === "90" ? "bg-primary text-white hover:bg-primary/90" : ""}
          onClick={() => onTimeRangeChange("90")}
        >
          90 Days
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
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-3 w-3 mr-2" />
          Export
        </Button>
        <Button size="sm" onClick={onUploadClick} className="w-full sm:w-auto">
          <Upload className="h-3 w-3 mr-2" />
          Upload Data
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsBar;
