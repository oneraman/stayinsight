
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Paintbrush, 
  MonitorSmartphone, 
  Moon, 
  Sun, 
  Calendar
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface AppearanceSettingsProps {
  onSave: () => void;
}

const AppearanceSettings = ({ onSave }: AppearanceSettingsProps) => {
  const { theme, setTheme, fontSize, setFontSize, dateFormat, setDateFormat } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Settings are already applied in real-time via the theme context
      // This is just for UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave();
      toast.success("Appearance settings saved successfully!");
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast.error("Failed to save appearance settings");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-[#5E5AFF]" />
          <h3 className="text-lg font-medium">Theme</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select the theme for the dashboard
        </p>
        
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
        >
          <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-[#5E5AFF] cursor-pointer">
            <RadioGroupItem value="light" id="theme-light" />
            <Label htmlFor="theme-light" className="flex items-center gap-2 cursor-pointer">
              <Sun className="h-4 w-4" />
              Light
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-[#5E5AFF] cursor-pointer">
            <RadioGroupItem value="dark" id="theme-dark" />
            <Label htmlFor="theme-dark" className="flex items-center gap-2 cursor-pointer">
              <Moon className="h-4 w-4" />
              Dark
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-[#5E5AFF] cursor-pointer">
            <RadioGroupItem value="system" id="theme-system" />
            <Label htmlFor="theme-system" className="flex items-center gap-2 cursor-pointer">
              <MonitorSmartphone className="h-4 w-4" />
              System
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#5E5AFF]" />
          <h3 className="text-lg font-medium">Date Format</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how dates will be displayed throughout the application
        </p>
        
        <Select value={dateFormat} onValueChange={setDateFormat}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Date Formats</SelectLabel>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              <SelectItem value="MMM D, YYYY">MMM D, YYYY</SelectItem>
              <SelectItem value="MMMM D, YYYY">MMMM D, YYYY</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Font Size</h3>
          <p className="text-sm text-muted-foreground">
            Adjust the base font size for the application
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Small</span>
            <span className="text-sm">{fontSize}px</span>
            <span className="text-sm">Large</span>
          </div>
          <Slider 
            value={[fontSize]} 
            min={12} 
            max={20} 
            step={1} 
            onValueChange={(value) => setFontSize(value[0])}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default AppearanceSettings;
