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
      icon: <TrendingDown className="h-6 w-6" />,
      bgGradient: "from-red-50 to-rose-50",
      borderColor: "border-red-100",
      iconBg: "bg-red-100",
      textColor: "text-red-700"
    },
    {
      title: "Retention Rate",
      value: `${metrics.retentionRate}%`,
      description: `Last ${timePeriod} days`,
      trend: metrics.retentionRate < 90 ? "negative" : "positive",
      icon: <TrendingUp className="h-6 w-6" />,
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-100",
      iconBg: "bg-green-100",
      textColor: "text-green-700"
    },
    {
      title: "Customer Value",
      value: formatCurrency(metrics.customerLifetimeValue),
      description: "Avg. lifetime value",
      trend: "neutral",
      icon: <DollarSign className="h-6 w-6" />,
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-100",
      iconBg: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      title: "At-Risk Revenue",
      value: formatCurrency(metrics.atRiskRevenue),
      description: "From high-risk customers",
      trend: metrics.atRiskRevenue > 10000 ? "negative" : "neutral",
      icon: <AlertTriangle className="h-6 w-6" />,
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-100",
      iconBg: "bg-amber-100",
      textColor: "text-amber-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {heroMetrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`bg-gradient-to-br ${metric.bgGradient} ${metric.borderColor} shadow-sm hover:shadow-md transition-shadow`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-medium ${metric.textColor}`}>{metric.title}</h3>
              <div className={`${metric.iconBg} p-2 rounded-full ${metric.textColor}`}>{metric.icon}</div>
            </div>
            
            <div className="flex flex-col">
              <span className={`text-3xl font-bold ${metric.textColor}`}>{metric.value}</span>
              <span className="text-xs text-gray-500 mt-1">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardHero;