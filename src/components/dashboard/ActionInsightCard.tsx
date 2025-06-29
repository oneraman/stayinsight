import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionInsightProps {
  type: "info" | "warning" | "tip";
  title: string;
  description: string;
  action: string;
  onAction?: () => void;
}

const ActionInsightCard = ({ type, title, description, action, onAction }: ActionInsightProps) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-coral-500" />;
      case "tip":
        return <Lightbulb className="h-6 w-6 text-emerald-500" />;
      default:
        return <Info className="h-6 w-6 text-indigo-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "border-l-coral-500 bg-red-50 hover:bg-red-100";
      case "tip":
        return "border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100";
      default:
        return "border-l-indigo-500 bg-indigo-50 hover:bg-indigo-100";
    }
  };

  return (
    <Card className={`border-0 border-l-4 ${getStyles()} shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <CardContent className="pt-8 pb-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 p-2 rounded-xl bg-white shadow-sm">{getIcon()}</div>
          <div>
            <h3 className="font-bold text-slate-800 mb-2 text-lg">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-white/50 bg-white/50 py-4 rounded-b-2xl">
        <Button 
          variant="ghost" 
          className="ml-auto text-sm font-medium hover:bg-white/80 rounded-xl px-6 py-2 transition-all duration-300 hover:scale-105"
          onClick={onAction}
        >
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionInsightCard;