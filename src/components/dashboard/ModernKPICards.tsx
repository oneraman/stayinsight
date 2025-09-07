import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, Shield } from "lucide-react";

interface KPICardData {
  title: string;
  value: string;
  description: string;
  badge: "lowRisk" | "mediumRisk" | "highRisk" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ModernKPICardsProps {
  data?: KPICardData[];
}

const defaultData: KPICardData[] = [
  {
    title: "Churn Rate",
    value: "12.5%",
    description: "Last 30 days",
    badge: "highRisk",
    trend: { value: 2.3, isPositive: false }
  },
  {
    title: "Retention Rate", 
    value: "87.5%",
    description: "Last 30 days",
    badge: "lowRisk",
    trend: { value: 1.8, isPositive: true }
  },
  {
    title: "Customer Value",
    value: "$1,240",
    description: "Avg. lifetime value",
    badge: "info",
    trend: { value: 5.2, isPositive: true }
  },
  {
    title: "At-Risk Revenue",
    value: "$48,000", 
    description: "From high-risk customers",
    badge: "mediumRisk",
    trend: { value: 12.1, isPositive: false }
  }
];

const getBadgeStyles = (badge: string) => {
  switch (badge) {
    case "lowRisk":
      return "kpi-badge low-risk";
    case "mediumRisk":  
      return "kpi-badge medium-risk";
    case "highRisk":
      return "kpi-badge high-risk";
    case "info":
      return "kpi-badge info";
    default:
      return "kpi-badge";
  }
};

const getIcon = (title: string) => {
  switch (title.toLowerCase()) {
    case "churn rate":
      return <TrendingDown className="h-5 w-5" />;
    case "retention rate":
      return <Shield className="h-5 w-5" />;
    case "customer value":
      return <DollarSign className="h-5 w-5" />;
    case "at-risk revenue":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Users className="h-5 w-5" />;
  }
};

const ModernKPICards = ({ data = defaultData }: ModernKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((kpi, index) => (
        <Card key={index} className="dashboard-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="text-muted-foreground">
                {getIcon(kpi.title)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="metric-value">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={getBadgeStyles(kpi.badge)}>
                  {kpi.badge === "lowRisk" && "Low Risk"}
                  {kpi.badge === "mediumRisk" && "Medium Risk"}
                  {kpi.badge === "highRisk" && "High Risk"}
                  {kpi.badge === "info" && "Info"}
                </Badge>
                
                {kpi.trend && (
                  <div className={`flex items-center text-xs gap-1 ${
                    kpi.trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}>
                    {kpi.trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {kpi.trend.value}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModernKPICards;