
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
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <div className="text-gray-400">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="metric-value">{value}</div>
          {description && <span className="text-xs text-gray-500">{description}</span>}
          {displayTrend && (
            <div className="flex items-center mt-1">
              <span className={displayTrend.isPositive ? "text-churnify-green" : "text-churnify-red"}>
                {displayTrend.isPositive ? "+" : "-"}{Math.abs(displayTrend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
