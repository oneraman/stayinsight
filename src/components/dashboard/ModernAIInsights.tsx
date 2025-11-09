import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Target, Sparkles, RefreshCw, Mail, Gift } from 'lucide-react';
import { aiInsightsEngine, CustomerInsight } from '@/utils/aiInsightsEngine';
import { toast } from 'sonner';

interface AIInsightData {
  icon: string;
  title: string;
  description: string;
  highlight: "lowRisk" | "mediumRisk" | "highRisk";
  suggestedActions: string[];
}

interface ModernAIInsightsProps {
  insights?: AIInsightData[];
  customers?: any[];
  metrics?: any;
  timePeriod?: string;
}

const defaultInsights: AIInsightData[] = [
  {
    icon: "🔴",
    title: "High Churn Risk Alert",
    description: "100 customers (100%) are at high risk",
    highlight: "highRisk",
    suggestedActions: [
      "Send reactivation email",
      "Offer loyalty discounts"
    ]
  },
  {
    icon: "🟡", 
    title: "Retention Opportunity",
    description: "Only 5% of customers are low risk",
    highlight: "mediumRisk",
    suggestedActions: [
      "Run a loyalty program",
      "Prioritize customer success calls"
    ]
  }
];

const getHighlightColor = (highlight: string) => {
  switch (highlight) {
    case "highRisk":
      return "border-l-red-500 bg-red-50 dark:bg-red-950/30";
    case "mediumRisk":
      return "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30";
    case "lowRisk":
      return "border-l-green-500 bg-green-50 dark:bg-green-950/30";
    default:
      return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/30";
  }
};

const getActionIcon = (action: string) => {
  if (action.toLowerCase().includes("email")) {
    return <Mail className="h-4 w-4" />;
  }
  if (action.toLowerCase().includes("discount") || action.toLowerCase().includes("loyalty")) {
    return <Gift className="h-4 w-4" />;
  }
  return <TrendingUp className="h-4 w-4" />;
};

const ModernAIInsights = ({ 
  insights,
  customers = [],
  metrics,
  timePeriod = "30"
}: ModernAIInsightsProps) => {
  const [aiInsights, setAiInsights] = useState<CustomerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioHealth, setPortfolioHealth] = useState<any>(null);

  const generateAIInsights = async () => {
    if (!customers || customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await aiInsightsEngine.analyzePortfolio(customers);
      setAiInsights(analysis.insights);
      setPortfolioHealth(analysis);
      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customers && customers.length > 0 && aiInsights.length === 0) {
      generateAIInsights();
    }
  }, [customers]);
  
  // Generate real AI insights from data (fallback)
  const generateRealInsights = (): AIInsightData[] => {
    if (!customers.length || !metrics) return defaultInsights;
    
    const realInsights: AIInsightData[] = [];
    
    // High risk analysis
    if (metrics.highRiskCustomers > 0) {
      const highRiskPercent = ((metrics.highRiskCustomers / metrics.totalCustomers) * 100).toFixed(0);
      realInsights.push({
        icon: "🔴",
        title: "High Churn Risk Alert",
        description: `${metrics.highRiskCustomers} customers (${highRiskPercent}%) are at high risk`,
        highlight: "highRisk",
        suggestedActions: [
          "Send personalized retention email",
          "Offer loyalty discount program",
          "Schedule customer success call"
        ]
      });
    }
    
    // Revenue at risk analysis
    if (metrics.atRiskRevenue > 10000) {
      const revenuePercent = ((metrics.atRiskRevenue / (customers.reduce((sum, c) => sum + (c.total_spent || 0), 0))) * 100).toFixed(0);
      realInsights.push({
        icon: "💰",
        title: "Revenue at Risk",
        description: `$${Math.round(metrics.atRiskRevenue).toLocaleString()} (${revenuePercent}%) revenue from at-risk customers`,
        highlight: metrics.atRiskRevenue > 50000 ? "highRisk" : "mediumRisk",
        suggestedActions: [
          "Priority customer outreach",
          "Implement win-back campaign",
          "Review pricing strategy"
        ]
      });
    }
    
    // Retention opportunity
    if (metrics.lowRiskCustomers / metrics.totalCustomers < 0.3) {
      realInsights.push({
        icon: "🟡", 
        title: "Retention Opportunity",
        description: `Only ${metrics.lowRiskCustomers} customers (${((metrics.lowRiskCustomers / metrics.totalCustomers) * 100).toFixed(0)}%) are low risk`,
        highlight: "mediumRisk",
        suggestedActions: [
          "Launch customer health program",
          "Increase engagement touchpoints",
          "Improve onboarding process"
        ]
      });
    }
    
    return realInsights.length > 0 ? realInsights : defaultInsights;
  };
  
  const displayInsights = aiInsights.length > 0 
    ? aiInsights.map(insight => ({
        icon: insight.type === 'risk' ? "🔴" : 
              insight.type === 'opportunity' ? "🟢" :
              insight.type === 'recommendation' ? "🟡" : "✨",
        title: insight.title,
        description: insight.description,
        highlight: insight.priority === 'high' ? 'highRisk' as const : 
                   insight.priority === 'medium' ? 'mediumRisk' as const : 'lowRisk' as const,
        suggestedActions: insight.actionable ? ['Take Action', 'Learn More'] : []
      }))
    : (insights || generateRealInsights());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
          {portfolioHealth && (
            <Badge variant={portfolioHealth.overallHealth === 'excellent' ? 'default' : 
                           portfolioHealth.overallHealth === 'good' ? 'secondary' : 'destructive'}>
              Health: {portfolioHealth.healthScore}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateAIInsights}
            disabled={isLoading || !customers || customers.length === 0}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Refresh AI'}
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Real-time
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayInsights.map((insight, index) => (
          <Card 
            key={index} 
            className={`ai-insight-card border-l-4 ${getHighlightColor(insight.highlight)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {insight.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Suggested Actions:
                </h4>
                <div className="space-y-2">
                  {insight.suggestedActions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-auto py-2 px-3"
                    >
                      {getActionIcon(action)}
                      <span className="text-left">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernAIInsights;