
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RetentionActionProps {
  title: string;
  description: string;
  actionType?: "email" | "call" | "offer" | "survey";
  impact?: string;
  impactScore?: number;
  actionText?: string;
  onActionClick?: () => void;
}

const RetentionActionCard = ({
  title,
  description,
  actionType = "email",
  impact,
  impactScore = 0,
  actionText,
  onActionClick = () => {}
}: RetentionActionProps) => {
  // Get action type color
  const getActionTypeColor = () => {
    switch (actionType) {
      case "email":
        return "bg-blue-100 text-blue-800";
      case "call":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "survey":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format action type for display
  const formatActionType = () => {
    return actionType.charAt(0).toUpperCase() + actionType.slice(1);
  };

  // Calculate impact score from string if needed
  const getImpactScore = () => {
    if (impactScore > 0) return impactScore;
    if (impact === "High") return 85;
    if (impact === "Medium") return 60;
    if (impact === "Low") return 30;
    return 50;
  };

  // Get button text
  const getButtonText = () => {
    if (actionText) return actionText;
    
    return actionType === "email" ? "Send Email" : 
           actionType === "call" ? "Schedule Call" :
           actionType === "offer" ? "Create Offer" : "Send Survey";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={getActionTypeColor()}>{formatActionType()}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Predicted impact:</span>
          <div className="flex items-center">
            <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-churnify-blue" 
                style={{ width: `${getImpactScore()}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium">{getImpactScore()}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onActionClick}
          className="w-full bg-churnify-blue hover:bg-churnify-dark-blue"
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RetentionActionCard;
