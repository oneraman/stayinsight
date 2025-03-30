
import { HelpCircle, Users, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsOverviewProps {
  metrics?: {
    churnRate: number;
    retentionRate: number;
    customerLifetimeValue: number;
    atRiskRevenue: number;
  };
}

const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  const { 
    churnRate = 4.2, 
    retentionRate = 95.8, 
    customerLifetimeValue = 842, 
    atRiskRevenue = 24500 
  } = metrics || {};

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

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
            <div className="text-2xl font-bold">{churnRate}%</div>
            <div className="flex items-center mt-1">
              <span className="text-red-500">+0.8%</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
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
            <div className="text-2xl font-bold">{retentionRate}%</div>
            <div className="flex items-center mt-1">
              <span className="text-green-500">+1.2%</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-500">Customer Lifetime Value</CardTitle>
            <div className="text-gray-400"><Wallet className="h-4 w-4" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">${customerLifetimeValue}</div>
            <div className="flex items-center mt-1">
              <span className="text-green-500">+$56</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
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
            <div className="text-2xl font-bold">{formatCurrency(atRiskRevenue)}</div>
            <div className="flex items-center mt-1">
              <span className="text-red-500">-$3.2k</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;
