
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  target?: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  status?: 'on-track' | 'at-risk' | 'off-track';
  description?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  target, 
  change, 
  changeType, 
  format = 'number',
  status,
  description 
}: MetricCardProps) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    if (changeType === 'positive') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (changeType === 'negative') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'off-track':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return 'bg-green-50 border-green-200';
      case 'at-risk':
        return 'bg-yellow-50 border-yellow-200';
      case 'off-track':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const progress = target && typeof value === 'number' ? (value / target) * 100 : undefined;

  return (
    <Card className={`${getStatusColor()} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            {getTrendIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <span className={
                changeType === 'positive' ? 'text-green-600' :
                changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}

          {target && progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Target: {formatValue(target)}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>
          )}

          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface AdvancedMetricsGridProps {
  customers: any[];
  timeframe: string;
}

const AdvancedMetricsGrid = ({ customers, timeframe }: AdvancedMetricsGridProps) => {
  const totalCustomers = customers.length;
  const highRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 70);
  const churnRate = totalCustomers > 0 ? (highRiskCustomers.length / totalCustomers) * 100 : 0;
  const retentionRate = 100 - churnRate;
  
  const avgCustomerValue = totalCustomers > 0 
    ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers 
    : 0;

  const avgOrderValue = customers
    .filter(c => c.avg_order_value && c.avg_order_value > 0)
    .reduce((sum, c, _, arr) => sum + c.avg_order_value / arr.length, 0);

  const activeCustomers = customers.filter(c => {
    if (!c.last_purchase_date) return false;
    const daysSince = (Date.now() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 90;
  }).length;

  const avgSupportCalls = totalCustomers > 0
    ? customers.reduce((sum, c) => sum + (c.support_calls || 0), 0) / totalCustomers
    : 0;

  const metrics = [
    {
      title: 'Total Customers',
      value: totalCustomers,
      change: 8.2,
      changeType: 'positive' as const,
      description: 'Active customer base'
    },
    {
      title: 'Churn Rate',
      value: churnRate,
      target: 15,
      change: -3.1,
      changeType: 'positive' as const,
      format: 'percentage' as const,
      status: churnRate <= 15 ? 'on-track' as const : churnRate <= 25 ? 'at-risk' as const : 'off-track' as const,
      description: 'Customers at high risk'
    },
    {
      title: 'Retention Rate',
      value: retentionRate,
      target: 85,
      change: 2.8,
      changeType: 'positive' as const,
      format: 'percentage' as const,
      status: retentionRate >= 85 ? 'on-track' as const : retentionRate >= 70 ? 'at-risk' as const : 'off-track' as const,
      description: 'Customer retention success'
    },
    {
      title: 'Avg Customer LTV',
      value: Math.round(avgCustomerValue),
      target: 1000,
      change: 12.5,
      changeType: 'positive' as const,
      format: 'currency' as const,
      status: avgCustomerValue >= 1000 ? 'on-track' as const : avgCustomerValue >= 700 ? 'at-risk' as const : 'off-track' as const,
      description: 'Customer lifetime value'
    },
    {
      title: 'Avg Order Value',
      value: Math.round(avgOrderValue),
      target: 150,
      change: 5.7,
      changeType: 'positive' as const,
      format: 'currency' as const,
      status: avgOrderValue >= 150 ? 'on-track' as const : avgOrderValue >= 100 ? 'at-risk' as const : 'off-track' as const,
      description: 'Average transaction size'
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      change: 4.3,
      changeType: 'positive' as const,
      description: 'Purchased in last 90 days'
    },
    {
      title: 'High Risk Customers',
      value: highRiskCustomers.length,
      change: -15.2,
      changeType: 'positive' as const,
      status: highRiskCustomers.length <= totalCustomers * 0.15 ? 'on-track' as const : 
             highRiskCustomers.length <= totalCustomers * 0.25 ? 'at-risk' as const : 'off-track' as const,
      description: 'Require immediate attention'
    },
    {
      title: 'Avg Support Interactions',
      value: Math.round(avgSupportCalls * 10) / 10,
      target: 3,
      change: -8.9,
      changeType: 'positive' as const,
      status: avgSupportCalls <= 3 ? 'on-track' as const : avgSupportCalls <= 5 ? 'at-risk' as const : 'off-track' as const,
      description: 'Support calls per customer'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default AdvancedMetricsGrid;
