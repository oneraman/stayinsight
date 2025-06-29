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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white shadow-lg border-0 rounded-2xl">
            <CardContent className="pt-8">
              <div className="h-6 w-28 bg-gray-200 rounded-xl mb-6"></div>
              <div className="h-12 w-20 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded-xl"></div>
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
      icon: <TrendingDown className="h-7 w-7" />
    },
    {
      title: "Retention Rate",
      value: `${metrics.retentionRate}%`,
      description: `Last ${timePeriod} days`,
      trend: metrics.retentionRate < 90 ? "negative" : "positive",
      icon: <TrendingUp className="h-7 w-7" />
    },
    {
      title: "Customer Value",
      value: formatCurrency(metrics.customerLifetimeValue),
      description: "Avg. lifetime value",
      trend: "neutral",
      icon: <DollarSign className="h-7 w-7" />
    },
    {
      title: "At-Risk Revenue",
      value: formatCurrency(metrics.atRiskRevenue),
      description: "From high-risk customers",
      trend: metrics.atRiskRevenue > 10000 ? "negative" : "neutral",
      icon: <AlertTriangle className="h-7 w-7" />
    }
  ];

  const getTrendColors = (trend: string) => {
    switch (trend) {
      case "positive":
        return "text-emerald-600 bg-emerald-50 border-l-emerald-500 shadow-emerald-100";
      case "negative":
        return "text-coral-500 bg-red-50 border-l-coral-500 shadow-red-100";
      default:
        return "text-indigo-600 bg-indigo-50 border-l-indigo-500 shadow-indigo-100";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {heroMetrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`bg-white shadow-lg border-0 border-l-4 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${getTrendColors(metric.trend)}`}
        >
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{metric.title}</h3>
              <div className="text-slate-400">{metric.icon}</div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-slate-800 mb-2">{metric.value}</span>
              <span className="text-sm text-slate-500 font-medium">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardHero;