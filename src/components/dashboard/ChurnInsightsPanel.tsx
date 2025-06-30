
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingDown, AlertTriangle, Target, FileText } from 'lucide-react';
import { 
  generateEnhancedCustomerInsights, 
  generateEnhancedPortfolioAnalysis 
} from '@/lib/enhancedGemini';
import { 
  generateRetentionStrategy, 
  generateChurnReport,
  generateChurnPrediction 
} from '@/lib/gemini';
import { toast } from 'sonner';

interface ChurnInsightsPanelProps {
  customers: any[];
  timeframe: string;
}

const ChurnInsightsPanel = ({ customers, timeframe }: ChurnInsightsPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<{
    overview?: string;
    strategy?: string;
    report?: string;
    prediction?: string;
  }>({});
  const [loading, setLoading] = useState<{
    overview: boolean;
    strategy: boolean;
    report: boolean;
    prediction: boolean;
  }>({
    overview: false,
    strategy: false,
    report: false,
    prediction: false
  });

  const generateOverviewInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setLoading(prev => ({ ...prev, overview: true }));
    try {
      // Use enhanced portfolio analysis for more accurate insights
      const aiInsights = await generateEnhancedPortfolioAnalysis(customers);
      setInsights(prev => ({ ...prev, overview: aiInsights }));
      toast.success('Enhanced portfolio insights generated successfully!');
    } catch (error) {
      console.error('Error generating enhanced overview insights:', error);
      toast.error('Failed to generate enhanced portfolio insights');
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  const generateStrategyInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setLoading(prev => ({ ...prev, strategy: true }));
    try {
      const highRiskCustomers = customers.filter(c => 
        (c.riskScore || c.risk_score) >= 70 || c.segment === 'high-risk'
      );
      const segment = highRiskCustomers.length > 0 ? 'high-risk' : 'medium-risk';
      const aiStrategy = await generateRetentionStrategy(segment, customers);
      setInsights(prev => ({ ...prev, strategy: aiStrategy }));
      toast.success('Enhanced retention strategy generated successfully!');
    } catch (error) {
      console.error('Error generating strategy insights:', error);
      toast.error('Failed to generate retention strategy');
    } finally {
      setLoading(prev => ({ ...prev, strategy: false }));
    }
  };

  const generateReportInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setLoading(prev => ({ ...prev, report: true }));
    try {
      const aiReport = await generateChurnReport(timeframe, customers);
      setInsights(prev => ({ ...prev, report: aiReport }));
      toast.success('Enhanced churn report generated successfully!');
    } catch (error) {
      console.error('Error generating report insights:', error);
      toast.error('Failed to generate churn report');
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  const generatePredictionInsights = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      // Find the highest risk customer for detailed prediction
      const highestRiskCustomer = customers
        .filter(c => c.riskScore || c.risk_score)
        .sort((a, b) => (b.riskScore || b.risk_score || 0) - (a.riskScore || a.risk_score || 0))[0];
      
      if (highestRiskCustomer) {
        // Use enhanced customer insights for more accurate prediction
        const aiPrediction = await generateEnhancedCustomerInsights(highestRiskCustomer);
        setInsights(prev => ({ ...prev, prediction: aiPrediction }));
        toast.success('Enhanced churn prediction generated successfully!');
      } else {
        toast.error('No customers with risk scores found for prediction');
      }
    } catch (error) {
      console.error('Error generating prediction insights:', error);
      toast.error('Failed to generate churn prediction');
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const getInsightStats = () => {
    const highRisk = customers.filter(c => (c.riskScore || c.risk_score) >= 70 || c.segment === 'high-risk').length;
    const mediumRisk = customers.filter(c => {
      const score = c.riskScore || c.risk_score || 0;
      return (score >= 30 && score < 70) || c.segment === 'medium-risk';
    }).length;
    const atRiskRevenue = customers
      .filter(c => (c.riskScore || c.risk_score) >= 70 || c.segment === 'high-risk')
      .reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);

    return { highRisk, mediumRisk, atRiskRevenue };
  };

  const stats = getInsightStats();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#5E5AFF]" />
          Enhanced AI Churn Insights
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">Strategy</TabsTrigger>
            <TabsTrigger value="prediction" className="text-xs">Prediction</TabsTrigger>
            <TabsTrigger value="report" className="text-xs">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {!insights.overview ? (
              <div className="text-center py-6">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Get enhanced AI-powered insights about your customer portfolio with advanced risk analysis and strategic recommendations.
                </p>
                <Button 
                  onClick={generateOverviewInsights}
                  disabled={loading.overview || customers.length === 0}
                  className="gap-2"
                  size="sm"
                >
                  {loading.overview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing with Enhanced AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Enhanced Portfolio Insights
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {insights.overview}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateOverviewInsights}
                  disabled={loading.overview}
                  className="gap-2 w-full"
                >
                  {loading.overview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing Enhanced Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Refresh Enhanced Analysis
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="strategy" className="mt-4">
            {!insights.strategy ? (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI-generated retention strategies tailored to your high-risk customers with enhanced accuracy.
                </p>
                <Button 
                  onClick={generateStrategyInsights}
                  disabled={loading.strategy || customers.length === 0}
                  className="gap-2"
                  size="sm"
                >
                  {loading.strategy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Enhanced Strategy...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Generate Enhanced Retention Strategy
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {insights.strategy}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateStrategyInsights}
                  disabled={loading.strategy}
                  className="gap-2 w-full"
                >
                  {loading.strategy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Strategy...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Update Strategy
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prediction" className="mt-4">
            {!insights.prediction ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed churn predictions with enhanced accuracy for your highest-risk customer.
                </p>
                <Button 
                  onClick={generatePredictionInsights}
                  disabled={loading.prediction || customers.length === 0}
                  className="gap-2"
                  size="sm"
                >
                  {loading.prediction ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Enhanced Prediction...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Generate Enhanced Churn Prediction
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {insights.prediction}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generatePredictionInsights}
                  disabled={loading.prediction}
                  className="gap-2 w-full"
                >
                  {loading.prediction ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Enhanced Prediction...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Update Enhanced Prediction
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-4">
            {!insights.report ? (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a comprehensive churn analysis report with enhanced accuracy for the selected time period.
                </p>
                <Button 
                  onClick={generateReportInsights}
                  disabled={loading.report || customers.length === 0}
                  className="gap-2"
                  size="sm"
                >
                  {loading.report ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Enhanced Report...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Enhanced Churn Report
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {insights.report}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateReportInsights}
                  disabled={loading.report}
                  className="gap-2 w-full"
                >
                  {loading.report ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Enhanced Report...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Update Enhanced Report
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChurnInsightsPanel;
