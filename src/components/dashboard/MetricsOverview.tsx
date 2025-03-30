
import { Activity, AlertTriangle, DollarSign } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const MetricsOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Churn Rate"
        value="3.8%"
        trend={{
          value: 0.5,
          isPositive: true
        }}
        description="Last 30 days"
        icon={<Activity className="h-4 w-4" />}
      />
      <MetricCard
        title="At-Risk Customers"
        value="47"
        trend={{
          value: 3,
          isPositive: false
        }}
        description="Identified this month"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <MetricCard
        title="Customer Lifetime Value"
        value="$842"
        trend={{
          value: 28,
          isPositive: true
        }}
        description="Average per customer"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
};

export default MetricsOverview;
