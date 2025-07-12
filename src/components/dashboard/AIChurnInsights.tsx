
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingDown, AlertTriangle, Target, FileText } from 'lucide-react';
import { 
  generateDataSummary, 
  generateRetentionStrategy, 
  generateChurnReport,
  generateChurnPrediction 
} from '@/lib/gemini';
import { toast } from 'sonner';
import { CustomerData } from '@/utils/dataProcessing';
import { calculateDataQualityScore as calculateDataQuality } from '@/utils/riskScoring';

interface AIChurnInsightsProps {
  customers: CustomerData[];
  timeframe: string;
}

const AIChurnInsights = ({ customers, timeframe }: AIChurnInsightsProps) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateComprehensiveInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setLoading(true);
    try {
      // Assess data quality before generating insights
      const dataQualityScore = calculateDataQuality(customers);
      const hasGoodData = dataQualityScore > 60;
      
      if (!hasGoodData) {
        const lowQualityInsight = `
DATA QUALITY ASSESSMENT:
Your customer dataset has a quality score of ${dataQualityScore}% which limits the accuracy of insights.

KEY DATA LIMITATIONS:
${customers.length === 0 ? '• No customer data available' : ''}
${customers.filter(c => !c.lastPurchaseDate).length > customers.length * 0.5 ? '• Missing purchase date information for most customers' : ''}
${customers.filter(c => !c.totalSpent || c.totalSpent === 0).length > customers.length * 0.5 ? '• Missing or zero spending data for most customers' : ''}
${customers.filter(c => !c.purchaseCount || c.purchaseCount === 0).length > customers.length * 0.5 ? '• Missing purchase count data for most customers' : ''}

RECOMMENDATIONS FOR BETTER INSIGHTS:
• Ensure your data includes customer purchase dates
• Include total spending amounts for each customer
• Add purchase frequency/count information
• Consider including customer demographics (age, tenure)

CURRENT ANALYSIS (Limited Confidence):
With the available data, most customers appear to have incomplete information which may result in inflated risk scores.
`;
        setInsights(lowQualityInsight);
        toast.warning('Insights generated with limited data quality - please review data completeness');
        return;
      }

      // Generate comprehensive analysis combining all insights
      const overview = await generateDataSummary(customers);
      const highRiskCustomers = customers.filter(c => 
        c.riskScore >= 65 || c.segment === 'high-risk'
      );
      const segment = highRiskCustomers.length > 0 ? 'high-risk' : 'medium-risk';
      const strategy = await generateRetentionStrategy(segment, customers);
      
      const combinedInsights = `
DATA QUALITY SCORE: ${dataQualityScore}% (Good quality data available)

PORTFOLIO OVERVIEW:
${overview}

RETENTION STRATEGY:
${strategy}
      `.trim();
      
      setInsights(combinedInsights);
      toast.success('Comprehensive insights generated successfully!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const getInsightStats = () => {
    const highRisk = customers.filter(c => c.riskScore >= 65 || c.segment === 'high-risk').length;
    const mediumRisk = customers.filter(c => 
      (c.riskScore >= 35 && c.riskScore < 65) || c.segment === 'medium-risk'
    ).length;
    const atRiskRevenue = customers
      .filter(c => c.riskScore >= 65 || c.segment === 'high-risk')
      .reduce((sum, c) => sum + (c.totalSpent || 0), 0);

    return { highRisk, mediumRisk, atRiskRevenue };
  };

  const stats = getInsightStats();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#5E5AFF]" />
          AI Churn Insights
        </CardTitle>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {stats.highRisk} High Risk
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingDown className="h-3 w-3" />
            ${stats.atRiskRevenue.toLocaleString()} at Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Get comprehensive AI-powered insights about your customer portfolio, retention strategies, and churn risks.
            </p>
            <Button 
              onClick={generateComprehensiveInsights}
              disabled={loading || customers.length === 0}
              className="gap-2"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {insights}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateComprehensiveInsights}
              disabled={loading}
              className="gap-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIChurnInsights;
