
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportingEngine, ExecutiveReport, OperationalReport } from "@/utils/reportingEngine";
import { Download, FileText, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportingDashboardProps {
  customers: any[];
  timeframe: string;
}

const ReportingDashboard = ({ customers, timeframe }: ReportingDashboardProps) => {
  const [selectedReport, setSelectedReport] = useState<string>("executive");
  const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
  const [operationalReport, setOperationalReport] = useState<OperationalReport | null>(null);

  const generateReport = (reportType: string) => {
    if (reportType === "executive") {
      const report = reportingEngine.generateExecutiveReport(customers, timeframe);
      setExecutiveReport(report);
    } else if (reportType === "operational") {
      const report = reportingEngine.generateOperationalReport(customers, timeframe);
      setOperationalReport(report);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'at-risk': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'off-track': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced Reporting Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="operational">Operational Report</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => generateReport(selectedReport)}
              disabled={customers.length === 0}
            >
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedReport} onValueChange={setSelectedReport}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="operational">Operational Report</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            {executiveReport ? (
              <div className="space-y-6">
                {/* Executive Summary Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{executiveReport.title}</h2>
                  <p className="text-gray-600">{executiveReport.period}</p>
                </div>

                {/* Key Metrics Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Key Performance Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold">{executiveReport.summary.totalCustomers.toLocaleString()}</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Churn Rate</p>
                        <p className="text-2xl font-bold">{executiveReport.summary.churnRate}%</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Retention Rate</p>
                        <p className="text-2xl font-bold">{executiveReport.summary.retentionRate}%</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Avg Customer Value</p>
                        <p className="text-2xl font-bold">${executiveReport.summary.avgCustomerValue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Badge className={getRiskLevelColor(executiveReport.summary.riskLevel)}>
                        Overall Risk Level: {executiveReport.summary.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {executiveReport.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Actions */}
                {executiveReport.criticalActions.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium text-red-800">Critical Actions Required:</p>
                        {executiveReport.criticalActions.map((action, index) => (
                          <p key={index} className="text-red-700 text-sm">• {action}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {executiveReport.trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.trend)}
                            <span className="font-medium">{trend.metric}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              trend.impact === 'positive' ? 'text-green-600' :
                              trend.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </span>
                            <Badge variant={trend.impact === 'positive' ? 'default' : 'secondary'}>
                              {trend.impact}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {executiveReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click "Generate Report" to create an executive summary</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="operational" className="space-y-6">
            {operationalReport ? (
              <div className="space-y-6">
                {/* Operational Report Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{operationalReport.title}</h2>
                  <p className="text-gray-600">{operationalReport.period}</p>
                </div>

                {/* Customer Segments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Segmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {operationalReport.customerSegments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{segment.segment}</p>
                            <p className="text-sm text-gray-600">{segment.count} customers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${segment.avgValue.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Avg Value</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{segment.churnRisk}%</p>
                            <p className="text-sm text-gray-600">Risk Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {operationalReport.riskDistribution.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{risk.riskLevel}</span>
                          <div className="flex items-center gap-2">
                            <span>{risk.count} customers</span>
                            <Badge variant="outline">{risk.percentage}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {operationalReport.actionItems.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                item.priority === 'high' ? 'destructive' :
                                item.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {item.priority.toUpperCase()}
                              </Badge>
                              <span className="font-medium">{item.action}</span>
                            </div>
                            <span className="text-sm text-gray-600">{item.customers} customers</span>
                          </div>
                          <p className="text-sm text-gray-600">{item.expectedImpact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Operational Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {operationalReport.metrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(metric.status)}
                            <div>
                              <p className="font-medium">{metric.name}</p>
                              {metric.target && (
                                <p className="text-sm text-gray-600">Target: {metric.target}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{metric.value}</p>
                            <Badge variant={
                              metric.status === 'on-track' ? 'default' :
                              metric.status === 'at-risk' ? 'secondary' : 'destructive'
                            }>
                              {metric.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click "Generate Report" to create an operational report</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportingDashboard;
