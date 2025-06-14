
import { HelpCircle, Users, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsOverviewProps {
  metrics?: {
    churnRate: number;
    retentionRate: number;
    customerLifetimeValue: number;
    atRiskRevenue: number;
  };
  loading?: boolean;
}

const MetricsOverview = ({ metrics, loading = false }: MetricsOverviewProps) => {
  const { 
    churnRate = 0, 
    retentionRate = 0, 
    customerLifetimeValue = 0, 
    atRiskRevenue = 0 
  } = metrics || {};

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">Churn Rate</CardTitle>
            <div className="text-gray-400"><TrendingDown className="h-4 w-4" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-red-600">{churnRate}%</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">Based on risk analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">Retention Rate</CardTitle>
            <div className="text-gray-400"><Users className="h-4 w-4" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-green-600">{retentionRate}%</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">Low + medium risk customers</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Customer Value</CardTitle>
            <div className="text-gray-400"><Wallet className="h-4 w-4" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{formatCurrency(customerLifetimeValue)}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">Average lifetime value</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">At-Risk Revenue</CardTitle>
            <div className="text-gray-400"><AlertTriangle className="h-4 w-4" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(atRiskRevenue)}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">Revenue from high-risk customers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;
