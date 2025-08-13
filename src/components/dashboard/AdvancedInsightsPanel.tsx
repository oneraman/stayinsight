import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerData } from "@/utils/dataProcessing";
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Target } from "lucide-react";

interface AdvancedInsightsPanelProps {
  customers: CustomerData[];
  timePeriod: string;
}

const AdvancedInsightsPanel = ({ customers, timePeriod }: AdvancedInsightsPanelProps) => {
  const generateInsights = () => {
    if (!customers.length) return [];

    const insights = [];
    const highRiskCustomers = customers.filter(c => (c.riskScore || 0) >= 70);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / customers.length;
    const recentCustomers = customers.filter(c => 
      c.lastPurchaseDate && 
      (Date.now() - c.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24) <= parseInt(timePeriod)
    );

    // High-risk customer insight
    if (highRiskCustomers.length > 0) {
      const atRiskRevenue = highRiskCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'High Churn Risk Alert',
        description: `${highRiskCustomers.length} customers (${((highRiskCustomers.length / customers.length) * 100).toFixed(1)}%) are at high risk`,
        value: `$${(atRiskRevenue / 1000).toFixed(1)}K at risk`,
        color: 'destructive'
      });
    }

    // Customer activity insight
    if (recentCustomers.length > 0) {
      const recentPercent = (recentCustomers.length / customers.length) * 100;
      insights.push({
        type: recentPercent > 50 ? 'positive' : 'warning',
        icon: <Users className="h-4 w-4" />,
        title: 'Customer Activity',
        description: `${recentCustomers.length} customers active in last ${timePeriod} days`,
        value: `${recentPercent.toFixed(1)}% activity rate`,
        color: recentPercent > 50 ? 'success' : 'warning'
      });
    }

    // Revenue concentration insight
    const topCustomers = customers
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, Math.min(10, Math.ceil(customers.length * 0.2)));
    const topCustomerRevenue = topCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const revenueConcentration = (topCustomerRevenue / totalRevenue) * 100;

    if (revenueConcentration > 80) {
      insights.push({
        type: 'warning',
        icon: <DollarSign className="h-4 w-4" />,
        title: 'Revenue Concentration Risk',
        description: `Top ${topCustomers.length} customers represent ${revenueConcentration.toFixed(1)}% of revenue`,
        value: 'High dependency risk',
        color: 'warning'
      });
    }

    // Average order value trend
    if (avgOrderValue > 1000) {
      insights.push({
        type: 'positive',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'Strong Order Value',
        description: 'Above average order values indicate healthy customer spending',
        value: `$${avgOrderValue.toFixed(0)} AOV`,
        color: 'success'
      });
    }

    // Customer segments distribution
    const segments = customers.reduce((acc, c) => {
      const segment = c.segment || 'medium-risk';
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lowRiskPercent = ((segments['low-risk'] || 0) / customers.length) * 100;
    if (lowRiskPercent < 30) {
      insights.push({
        type: 'warning',
        icon: <Target className="h-4 w-4" />,
        title: 'Retention Opportunity',
        description: `Only ${lowRiskPercent.toFixed(1)}% of customers are low-risk`,
        value: 'Focus on retention',
        color: 'warning'
      });
    }

    return insights.slice(0, 4); // Show top 4 insights
  };

  const insights = generateInsights();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning': 
        return 'bg-warning/10 text-warning border-warning/20';
      case 'destructive':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Upload customer data to see AI-powered insights and recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(insight.color)}`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getColorClasses(insight.color)}`}
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <div className="text-sm font-medium">
                      {insight.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedInsightsPanel;