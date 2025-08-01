
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
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "tip":
        return <Lightbulb className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "border-l-amber-500 bg-amber-50";
      case "tip":
        return "border-l-emerald-500 bg-emerald-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <Card className={`clay-card border-l-4 ${getStyles()}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 p-2 rounded-clay bg-gradient-to-br from-background to-muted/50">{getIcon()}</div>
          <div>
            <h3 className="font-medium mb-2 text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/50 bg-gradient-to-r from-background/50 to-background/30 py-4">
        <Button 
          variant="clay" 
          size="sm"
          className="ml-auto"
          onClick={onAction}
        >
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionInsightCard;
