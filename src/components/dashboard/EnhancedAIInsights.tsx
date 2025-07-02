
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { multiModelAnalyzer, MultiModelAnalysisResult } from '@/utils/multiModelAnalyzer';
import { toast } from 'sonner';

interface EnhancedAIInsightsProps {
  customer: any;
  portfolioContext?: any;
}

const EnhancedAIInsights = ({ customer, portfolioContext }: EnhancedAIInsightsProps) => {
  const [analysis, setAnalysis] = useState<MultiModelAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleGenerateInsights = async () => {
    if (!customer) {
      toast.error('No customer data available for analysis');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Generating enhanced AI insights with multi-model analysis...');
      const result = await multiModelAnalyzer.analyzeWithMultipleModels(customer, portfolioContext);
      setAnalysis(result);
      
      toast.success(`Multi-model analysis complete! Confidence score: ${result.confidenceScore}%`);
    } catch (error) {
      console.error('Error generating enhanced insights:', error);
      toast.error('Failed to generate enhanced insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Enhanced AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Get multi-model AI analysis with validation and confidence scoring for maximum accuracy.
            </p>
            <Button 
              onClick={handleGenerateInsights}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with Multiple AI Models...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Enhanced Analysis
                </>
              )}
            </Button>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• Multi-model analysis for cross-validation</p>
              <p>• Real-time accuracy and confidence scoring</p>
              <p>• Statistical validation of all insights</p>
              <p>• Context-aware business intelligence</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Enhanced AI Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${getConfidenceColor(analysis.confidenceScore)} font-semibold`}>
              {analysis.confidenceScore}% Confidence
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateInsights}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="alternatives">Perspectives</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Consensus Analysis
              </h4>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-blue-700 leading-relaxed">
                  {analysis.consensusAnalysis}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-700">Analysis Confidence</div>
                <div className="mt-2">
                  <Progress value={analysis.confidenceScore} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{analysis.confidenceScore}% overall confidence</div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium text-gray-700">Validation Status</div>
                <div className="mt-2 flex items-center gap-2">
                  {analysis.validationResults.accuracyScore >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">{analysis.validationResults.accuracyScore}% accuracy</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.validationResults.accuracyScore}%</div>
                <div className="text-sm text-gray-500">Accuracy Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.validationResults.confidenceLevel.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Confidence Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.validationResults.validationIssues.length}</div>
                <div className="text-sm text-gray-500">Issues Found</div>
              </div>
            </div>

            {analysis.validationResults.validationIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Validation Issues</h4>
                {analysis.validationResults.validationIssues.map((issue, index) => (
                  <Alert key={index} className="text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{issue.description}</span>
                        <Badge variant="outline" className={
                          issue.severity === 'high' ? 'text-red-600' :
                          issue.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }>
                          {issue.severity}
                        </Badge>
                      </div>
                      {issue.suggestion && (
                        <div className="text-xs text-gray-600 mt-1">
                          Suggestion: {issue.suggestion}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {analysis.validationResults.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Improvement Recommendations</h4>
                <ul className="text-sm space-y-1">
                  {analysis.validationResults.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              {analysis.recommendedActions.map((action, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{action.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline">
                        {action.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Expected Impact: {action.expectedImpact}
                  </div>
                  <div className="mt-2">
                    <Progress value={action.confidence} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-4">
            {analysis.alternativeViewpoints.length > 0 ? (
              <div className="space-y-4">
                {analysis.alternativeViewpoints.map((viewpoint, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4 py-2">
                    <div className="text-sm leading-relaxed text-gray-700">
                      {viewpoint}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No alternative perspectives generated</p>
                <p className="text-xs">This indicates strong consensus across all AI models</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIInsights;
