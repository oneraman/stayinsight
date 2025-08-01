
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard = ({ icon, title, value, change, isPositive, description, trend }: MetricCardProps) => {
  // Use either the direct props or the trend object
  const displayTrend = trend || (change && isPositive !== undefined ? {
    value: parseFloat(change.replace("%", "")),
    isPositive: isPositive
  } : undefined);

  return (
    <Card className="clay-metric-card group animate-clay-float">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardTitle>
          <div className="p-3 rounded-clay bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="metric-value text-4xl">{value}</div>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
          {displayTrend && (
            <div className="flex items-center mt-2">
              <div className={`px-3 py-1 rounded-clay-sm text-xs font-medium ${displayTrend.isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {displayTrend.isPositive ? "+" : "-"}{Math.abs(displayTrend.value)}%
              </div>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
