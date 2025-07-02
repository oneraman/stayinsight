
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  DollarSign,
  Target,
  Brain,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { statisticalEngine, CorrelationAnalysis, CohortAnalysis, PredictiveModel, TrendAnalysis } from '@/utils/statisticalAnalysisEngine';
import { businessIntelligence, IndustryBenchmark, BusinessInsight, ExecutiveSummary } from '@/utils/businessIntelligence';
import { customAnalysisFramework, CustomAnalysisResult, AnalysisConfiguration } from '@/utils/customAnalysisFramework';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AdvancedAnalyticsDashboardProps {
  customers: any[];
}

const AdvancedAnalyticsDashboard = ({ customers }: AdvancedAnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [correlations, setCorrelations] = useState<CorrelationAnalysis[]>([]);
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([]);
  const [predictions, setPredictions] = useState<PredictiveModel[]>([]);
  const [trends, setTrends] = useState<{ [key: string]: TrendAnalysis }>({});
  const [benchmarks, setBenchmarks] = useState<IndustryBenchmark[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [customResults, setCustomResults] = useState<CustomAnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfiguration>({
    selectedModel: 'saas_standard',
    customFactors: [],
    analysisDepth: 'intermediate',
    includeForecasting: true,
    forecastPeriods: 6,
    confidenceThreshold: 0.7,
    segmentationCriteria: []
  });

  useEffect(() => {
    if (customers.length > 0) {
      runAdvancedAnalytics();
    }
  }, [customers]);

  const runAdvancedAnalytics = async () => {
    if (customers.length === 0) {
      toast.error('No customer data available for analysis');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔬 Running advanced analytics on', customers.length, 'customers...');

      // Statistical Analysis
      const correlationResults = statisticalEngine.calculateCorrelations(customers);
      const cohortResults = statisticalEngine.performCohortAnalysis(customers);
      const predictionResults = statisticalEngine.generatePredictiveModels(customers);
      
      // Trend Analysis for key metrics
      const trendResults: { [key: string]: TrendAnalysis } = {};
      const keyMetrics = ['total_spent', 'purchase_count', 'risk_score'];
      
      for (const metric of keyMetrics) {
        trendResults[metric] = statisticalEngine.analyzeTrends(customers, metric);
      }

      // Business Intelligence
      const benchmarkResults = businessIntelligence.generateIndustryBenchmarks(customers);
      const insightResults = businessIntelligence.generateBusinessInsights(customers);
      const summaryResults = businessIntelligence.generateExecutiveSummary(customers, insightResults, benchmarkResults);

      // Custom Analysis
      const customAnalysisResults = customAnalysisFramework.runCustomAnalysis(customers, analysisConfig);

      // Update state
      setCorrelations(correlationResults);
      setCohorts(cohortResults);
      setPredictions(predictionResults);
      setTrends(trendResults);
      setBenchmarks(benchmarkResults);
      setInsights(insightResults);
      setExecutiveSummary(summaryResults);
      setCustomResults(customAnalysisResults);

      toast.success('Advanced analytics completed successfully!');
    } catch (error) {
      console.error('Advanced analytics failed:', error);
      toast.error('Failed to run advanced analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    const analyticsData = {
      summary: executiveSummary,
      correlations,
      cohorts,
      predictions,
      trends,
      benchmarks,
      insights,
      customResults,
      exportDate: new Date().toISOString(),
      customerCount: customers.length
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advanced-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'retention': return <Users className="h-4 w-4" />;
      case 'acquisition': return <Target className="h-4 w-4" />;
      case 'engagement': return <Brain className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No customer data available for advanced analytics</p>
            <p className="text-sm text-gray-400 mt-2">Upload customer data to see detailed statistical analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Advanced Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportAnalytics}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runAdvancedAnalytics}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistical">Statistical</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="predictive">Predictive</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {executiveSummary && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Executive Summary</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {executiveSummary.keyMetrics.map((metric, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{metric.name}</div>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {metric.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Risk Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Risk Level</span>
                            <Badge className={getImpactColor(executiveSummary.riskAssessment.level)}>
                              {executiveSummary.riskAssessment.level.toUpperCase()}
                            </Badge>
                          </div>
                          {executiveSummary.riskAssessment.factors.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Key Risk Factors:</div>
                              <ul className="text-sm space-y-1">
                                {executiveSummary.riskAssessment.factors.map((factor, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Top Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {executiveSummary.opportunities.slice(0, 2).map((opportunity, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-3">
                              <div className="font-medium text-sm">{opportunity.title}</div>
                              <div className="text-xs text-gray-600">
                                Potential: ${opportunity.potential.toLocaleString()} | 
                                Effort: {opportunity.effort} | 
                                Timeline: {opportunity.timeline}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="statistical" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Correlation Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {correlations.slice(0, 5).map((corr, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {corr.metric1} ↔ {corr.metric2}
                            </span>
                            <Badge variant="outline">
                              {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">{corr.interpretation}</div>
                          <Progress value={Math.abs(corr.correlation) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cohort Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cohorts.slice(0, 5).map((cohort, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{cohort.cohortPeriod}</span>
                            <Badge variant="outline">{cohort.customerCount} customers</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Retention: {cohort.retentionRate.toFixed(1)}%</div>
                            <div>Avg Value: ${cohort.averageValue}</div>
                          </div>
                          {cohort.insights.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {cohort.insights[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(trends).map(([metric, trend]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm capitalize">
                            {metric.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1">
                            {trend.trend === 'increasing' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : trend.trend === 'decreasing' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <div className="h-4 w-4 bg-gray-400 rounded-full" />
                            )}
                            <span className="text-xs capitalize">{trend.trend}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Change Rate: {trend.changeRate.toFixed(1)}%
                        </div>
                        {trend.forecast.length > 0 && (
                          <div className="text-xs text-blue-600">
                            6-month forecast available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <div className="space-y-4">
                {benchmarks.map((benchmark, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{benchmark.metric}</h4>
                        <Badge className={
                          benchmark.percentile >= 75 ? 'bg-green-100 text-green-800' :
                          benchmark.percentile >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {benchmark.percentile}th percentile
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-500">Your Value</div>
                          <div className="font-semibold">{benchmark.yourValue}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Industry Avg</div>
                          <div>{benchmark.industryAverage}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Top 25%</div>
                          <div>{benchmark.topQuartile}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Bottom 25%</div>
                          <div>{benchmark.bottomQuartile}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        {benchmark.recommendation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="predictive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Predictive Models - Top At-Risk Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.slice(0, 10).map((prediction, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{prediction.customerId}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRiskLevelColor('high')} bg-red-50`}>
                              {(prediction.churnProbability * 100).toFixed(1)}% churn risk
                            </Badge>
                            <Badge variant="outline">
                              {(prediction.confidenceLevel * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Key Risk Factors:</div>
                            <div className="space-y-1">
                              {prediction.keyFactors.slice(0, 3).map((factor, idx) => (
                                <div key={idx} className="text-sm flex items-center justify-between">
                                  <span>{factor.factor}</span>
                                  <span className={`${factor.direction === 'positive' ? 'text-red-600' : 'text-green-600'}`}>
                                    {(factor.impact * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Recommendations:</div>
                            <div className="space-y-1">
                              {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                                <div key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getInsightIcon(insight.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact} impact
                              </Badge>
                              <Badge variant="outline">
                                {(insight.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                          
                          {insight.metrics.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {insight.metrics.map((metric, idx) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded">
                                  <div className="text-gray-600 text-xs">{metric.name}</div>
                                  <div className="font-semibold">{metric.value.toLocaleString()}</div>
                                  {metric.benchmark && (
                                    <div className="text-xs text-gray-500">
                                      Benchmark: {metric.benchmark.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custom Analysis Results</CardTitle>
                  <div className="text-sm text-gray-600">
                    Using {analysisConfig.selectedModel} model with {analysisConfig.confidenceThreshold * 100}% confidence threshold
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customResults.slice(0, 15).map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{result.customerId}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskLevelColor(result.riskLevel)}>
                              {result.riskLevel} risk ({result.overallRiskScore.toFixed(1)})
                            </Badge>
                            <Badge variant="outline">
                              {(result.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Factor Contributions:</div>
                            <div className="space-y-1">
                              {result.factorScores.slice(0, 3).map((factor, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span>{factor.factorName}</span>
                                    <span>{factor.contribution.toFixed(1)}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">{factor.explanation}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Recommendations:</div>
                            <div className="space-y-1">
                              {result.recommendations.slice(0, 2).map((rec, idx) => (
                                <div key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                  <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
