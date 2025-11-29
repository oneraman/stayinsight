import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertTriangle, TrendingDown, Target } from 'lucide-react';
import { generateCustomerInsights, generateChurnPrediction } from '@/lib/lovableAI';
import { parseAIResponse, formatForDisplay, extractMetrics, FormattedPrediction } from '@/utils/aiResponseFormatter';
import { toast } from 'sonner';

interface AIChurnAnalysisProps {
  customerData: any;
}

const AIChurnAnalysis = ({ customerData }: AIChurnAnalysisProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<FormattedPrediction | null>(null);
  const [showFullInsights, setShowFullInsights] = useState(false);
  const [showFullPrediction, setShowFullPrediction] = useState(false);
  const [loading, setLoading] = useState({
    insights: false,
    prediction: false
  });

  const handleGenerateInsights = async () => {
    setLoading(prev => ({ ...prev, insights: true }));
    try {
      const aiInsights = await generateCustomerInsights(customerData);
      setInsights(aiInsights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  };

  const handleGeneratePrediction = async () => {
    setLoading(prev => ({ ...prev, prediction: true }));
    try {
      const aiPrediction = await generateChurnPrediction(customerData);
      const parsed = parseAIResponse(aiPrediction, 'prediction');
      setPrediction(parsed);
      toast.success('Churn prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate churn prediction');
    } finally {
      setLoading(prev => ({ ...prev, prediction: false }));
    }
  };

  const getRiskLevel = () => {
    const riskScore = customerData.riskScore || 0;
    if (riskScore >= 70) return { level: 'High', color: 'destructive', icon: AlertTriangle };
    if (riskScore >= 30) return { level: 'Medium', color: 'secondary', icon: TrendingDown };
    return { level: 'Low', color: 'default', icon: Target };
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiskIcon className="h-5 w-5" />
            Churn Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Risk Level</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={risk.color as any} className="gap-1">
                  <RiskIcon className="h-3 w-3" />
                  {risk.level} Risk
                </Badge>
                <span className="text-lg font-semibold">{customerData.riskScore || 0}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Customer Value</p>
              <p className="text-lg font-semibold">${(customerData.totalSpent || 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Last Purchase</p>
              <p className="font-medium">
                {customerData.lastPurchaseDate 
                  ? new Date(customerData.lastPurchaseDate).toLocaleDateString()
                  : 'Unknown'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Orders</p>
              <p className="font-medium">{customerData.purchaseCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#5E5AFF]" />
            AI Customer Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Get concise AI insights in under 75 words.
              </p>
              <Button 
                onClick={handleGenerateInsights}
                disabled={loading.insights}
                className="gap-2"
              >
                {loading.insights ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {extractMetrics(insights).length > 0 && (
                <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                  {extractMetrics(insights).slice(0, 4).map((metric, idx) => (
                    <div key={idx} className="text-center p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-lg font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-sm leading-relaxed">
                {showFullInsights ? insights : formatForDisplay(insights, 150)}
              </div>
              {insights.length > 150 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFullInsights(!showFullInsights)}
                >
                  {showFullInsights ? 'Show Less' : 'Show More'}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateInsights}
                disabled={loading.insights}
                className="gap-2"
              >
                {loading.insights ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Churn Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Churn Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!prediction ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Get concise churn prediction in 50 words.
              </p>
              <Button 
                onClick={handleGeneratePrediction}
                disabled={loading.prediction}
                className="gap-2"
                variant="outline"
              >
                {loading.prediction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Generate Prediction
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Churn Risk</p>
                  <p className="text-3xl font-bold">
                    {prediction.churnRisk}%
                  </p>
                  <Badge 
                    variant={prediction.riskLevel === 'high' ? 'destructive' : 
                             prediction.riskLevel === 'medium' ? 'secondary' : 'default'}
                    className="mt-2"
                  >
                    {prediction.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Timeframe</p>
                  <p className="text-xl font-semibold mt-2">
                    {prediction.timeframe}
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                  Warning Sign
                </p>
                <p className="text-sm">{prediction.warningSign}</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border-l-4 border-green-500">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                  Recommended Action
                </p>
                <p className="text-sm">{prediction.action}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGeneratePrediction}
                disabled={loading.prediction}
                className="gap-2 w-full"
              >
                {loading.prediction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Update Prediction
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChurnAnalysis;