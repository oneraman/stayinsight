import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Mail, Gift } from "lucide-react";

interface AIInsightData {
  icon: string;
  title: string;
  description: string;
  highlight: "lowRisk" | "mediumRisk" | "highRisk";
  suggestedActions: string[];
}

interface ModernAIInsightsProps {
  insights?: AIInsightData[];
}

const defaultInsights: AIInsightData[] = [
  {
    icon: "🔴",
    title: "High Churn Risk Alert",
    description: "100 customers (100%) are at high risk",
    highlight: "highRisk",
    suggestedActions: [
      "Send reactivation email",
      "Offer loyalty discounts"
    ]
  },
  {
    icon: "🟡", 
    title: "Retention Opportunity",
    description: "Only 5% of customers are low risk",
    highlight: "mediumRisk",
    suggestedActions: [
      "Run a loyalty program",
      "Prioritize customer success calls"
    ]
  }
];

const getHighlightColor = (highlight: string) => {
  switch (highlight) {
    case "highRisk":
      return "border-l-red-500 bg-red-50 dark:bg-red-950/30";
    case "mediumRisk":
      return "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30";
    case "lowRisk":
      return "border-l-green-500 bg-green-50 dark:bg-green-950/30";
    default:
      return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/30";
  }
};

const getActionIcon = (action: string) => {
  if (action.toLowerCase().includes("email")) {
    return <Mail className="h-4 w-4" />;
  }
  if (action.toLowerCase().includes("discount") || action.toLowerCase().includes("loyalty")) {
    return <Gift className="h-4 w-4" />;
  }
  return <TrendingUp className="h-4 w-4" />;
};

const ModernAIInsights = ({ insights = defaultInsights }: ModernAIInsightsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
        <Badge variant="secondary" className="ml-2">
          Real-time
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card 
            key={index} 
            className={`ai-insight-card border-l-4 ${getHighlightColor(insight.highlight)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {insight.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Suggested Actions:
                </h4>
                <div className="space-y-2">
                  {insight.suggestedActions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-auto py-2 px-3"
                    >
                      {getActionIcon(action)}
                      <span className="text-left">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernAIInsights;