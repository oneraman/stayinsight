import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeroProps {
  metrics: {
    churnRate: number;
    retentionRate: number;
    customerLifetimeValue: number;
    atRiskRevenue: number;
  };
  timePeriod: string;
  loading: boolean;
}

const DashboardHero = ({ metrics, timePeriod, loading }: DashboardHeroProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const heroMetrics = [
    {
      title: "Churn Rate",
      value: `${metrics.churnRate}%`,
      description: `Last ${timePeriod} days`,
      trend: metrics.churnRate > 5 ? "negative" : "positive",
      icon: <TrendingDown className="h-5 w-5" />,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
      borderClass: "border-destructive/20"
    },
    {
      title: "Retention Rate", 
      value: `${metrics.retentionRate}%`,
      description: `Last ${timePeriod} days`,
      trend: metrics.retentionRate < 90 ? "negative" : "positive",
      icon: <TrendingUp className="h-5 w-5" />,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/20"
    },
    {
      title: "Customer Value",
      value: formatCurrency(metrics.customerLifetimeValue),
      description: "Avg. lifetime value",
      trend: "neutral",
      icon: <DollarSign className="h-5 w-5" />,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      borderClass: "border-primary/20"
    },
    {
      title: "At-Risk Revenue",
      value: formatCurrency(metrics.atRiskRevenue),
      description: "From high-risk customers",
      trend: metrics.atRiskRevenue > 10000 ? "negative" : "neutral",
      icon: <AlertTriangle className="h-5 w-5" />,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {heroMetrics.map((metric, index) => (
        <Card 
          key={index} 
          className="metric-card group hover:scale-105"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {metric.title}
              </h3>
              <div className={`p-3 rounded-xl ${metric.bgClass} ${metric.colorClass} border ${metric.borderClass} group-hover:scale-110 transition-transform`}>
                {metric.icon}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="metric-value">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardHero;