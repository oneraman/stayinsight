
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white shadow-sm border-l-4 border-l-gray-200">
            <CardContent className="pt-6">
              <div className="h-6 w-28 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
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
      icon: <TrendingDown className="h-6 w-6" />
    },
    {
      title: "Retention Rate",
      value: `${metrics.retentionRate}%`,
      description: `Last ${timePeriod} days`,
      trend: metrics.retentionRate < 90 ? "negative" : "positive",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Customer Value",
      value: formatCurrency(metrics.customerLifetimeValue),
      description: "Avg. lifetime value",
      trend: "neutral",
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: "At-Risk Revenue",
      value: formatCurrency(metrics.atRiskRevenue),
      description: "From high-risk customers",
      trend: metrics.atRiskRevenue > 10000 ? "negative" : "neutral",
      icon: <AlertTriangle className="h-6 w-6" />
    }
  ];

  const getTrendColors = (trend: string) => {
    switch (trend) {
      case "positive":
        return "text-green-600 bg-green-50 border-l-green-500";
      case "negative":
        return "text-red-600 bg-red-50 border-l-red-500";
      default:
        return "text-blue-600 bg-blue-50 border-l-blue-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {heroMetrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`bg-white shadow-sm border-l-4 hover:shadow-md transition-shadow ${getTrendColors(metric.trend)}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              <div className="text-gray-400">{metric.icon}</div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{metric.value}</span>
              <span className="text-xs text-gray-500 mt-1">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardHero;
