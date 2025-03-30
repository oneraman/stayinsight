
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard = ({ icon, title, value, trend }: MetricCardProps) => {
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
          {trend && (
            <div className="flex items-center mt-1">
              <span className={trend.isPositive ? "text-churnify-green" : "text-churnify-red"}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
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
