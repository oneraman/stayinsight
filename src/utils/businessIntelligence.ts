
export interface IndustryBenchmark {
  metric: string;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  yourValue: number;
  percentile: number;
  recommendation: string;
}

export interface CompetitiveAnalysis {
  strengths: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  overallScore: number;
}

export interface BusinessInsight {
  category: 'revenue' | 'retention' | 'acquisition' | 'engagement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionability: 'immediate' | 'short-term' | 'long-term';
  confidence: number;
  metrics: Array<{
    name: string;
    value: number;
    benchmark?: number;
  }>;
}

export interface ExecutiveSummary {
  keyMetrics: Array<{
    name: string;
    value: number;
    change: number;
    status: 'improving' | 'declining' | 'stable';
  }>;
  criticalInsights: BusinessInsight[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigationStrategies: string[];
  };
  opportunities: Array<{
    title: string;
    potential: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

export class BusinessIntelligenceEngine {
  private industryBenchmarks = {
    churn_rate: { average: 15, topQuartile: 8, bottomQuartile: 25 },
    customer_lifetime_value: { average: 1200, topQuartile: 2000, bottomQuartile: 600 },
    avg_order_value: { average: 85, topQuartile: 150, bottomQuartile: 45 },
    purchase_frequency: { average: 3.2, topQuartile: 5.5, bottomQuartile: 1.8 },
    retention_rate: { average: 85, topQuartile: 92, bottomQuartile: 75 },
    support_ticket_rate: { average: 12, topQuartile: 6, bottomQuartile: 20 }
  };

  generateIndustryBenchmarks(customerData: any[]): IndustryBenchmark[] {
    const benchmarks: IndustryBenchmark[] = [];
    
    // Calculate current metrics
    const totalCustomers = customerData.length;
    const churnRate = this.calculateChurnRate(customerData);
    const avgCustomerValue = this.calculateAvgCustomerValue(customerData);
    const avgOrderValue = this.calculateAvgOrderValue(customerData);
    const retentionRate = 100 - churnRate;
    const supportTicketRate = this.calculateSupportTicketRate(customerData);

    const metrics = [
      {
        name: 'churn_rate',
        displayName: 'Churn Rate (%)',
        value: churnRate,
        lowerIsBetter: true
      },
      {
        name: 'customer_lifetime_value',
        displayName: 'Customer Lifetime Value ($)',
        value: avgCustomerValue,
        lowerIsBetter: false
      },
      {
        name: 'avg_order_value',
        displayName: 'Average Order Value ($)',
        value: avgOrderValue,
        lowerIsBetter: false
      },
      {
        name: 'retention_rate',
        displayName: 'Retention Rate (%)',
        value: retentionRate,
        lowerIsBetter: false
      },
      {
        name: 'support_ticket_rate',
        displayName: 'Support Ticket Rate (%)',
        value: supportTicketRate,
        lowerIsBetter: true
      }
    ];

    metrics.forEach(metric => {
      const benchmark = this.industryBenchmarks[metric.name as keyof typeof this.industryBenchmarks];
      if (benchmark) {
        const percentile = this.calculatePercentile(metric.value, benchmark, metric.lowerIsBetter);
        
        benchmarks.push({
          metric: metric.displayName,
          industryAverage: benchmark.average,
          topQuartile: benchmark.topQuartile,
          bottomQuartile: benchmark.bottomQuartile,
          yourValue: Math.round(metric.value * 100) / 100,
          percentile: Math.round(percentile),
          recommendation: this.generateBenchmarkRecommendation(metric.value, benchmark, metric.lowerIsBetter, percentile)
        });
      }
    });

    return benchmarks;
  }

  private calculateChurnRate(customers: any[]): number {
    const highRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 70).length;
    return customers.length > 0 ? (highRiskCustomers / customers.length) * 100 : 0;
  }

  private calculateAvgCustomerValue(customers: any[]): number {
    const totalValue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    return customers.length > 0 ? totalValue / customers.length : 0;
  }

  private calculateAvgOrderValue(customers: any[]): number {
    const validCustomers = customers.filter(c => c.avg_order_value && c.avg_order_value > 0);
    const totalAOV = validCustomers.reduce((sum, c) => sum + c.avg_order_value, 0);
    return validCustomers.length > 0 ? totalAOV / validCustomers.length : 0;
  }

  private calculateSupportTicketRate(customers: any[]): number {
    const customersWithSupport = customers.filter(c => (c.support_calls || 0) > 0).length;
    return customers.length > 0 ? (customersWithSupport / customers.length) * 100 : 0;
  }

  private calculatePercentile(value: number, benchmark: any, lowerIsBetter: boolean): number {
    const { average, topQuartile, bottomQuartile } = benchmark;
    
    if (lowerIsBetter) {
      if (value <= topQuartile) return 90;
      if (value <= average) return 70;
      if (value <= bottomQuartile) return 30;
      return 10;
    } else {
      if (value >= topQuartile) return 90;
      if (value >= average) return 70;
      if (value >= bottomQuartile) return 30;
      return 10;
    }
  }

  private generateBenchmarkRecommendation(value: number, benchmark: any, lowerIsBetter: boolean, percentile: number): string {
    if (percentile >= 75) {
      return 'Excellent performance - maintain current strategies and consider sharing best practices';
    } else if (percentile >= 50) {
      return 'Above average performance - identify opportunities for further improvement';
    } else if (percentile >= 25) {
      return 'Below average performance - implement targeted improvement initiatives';
    } else {
      return 'Critical improvement needed - urgent action required to meet industry standards';
    }
  }

  generateCompetitiveAnalysis(customerData: any[], benchmarks: IndustryBenchmark[]): CompetitiveAnalysis {
    const strengths: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];
    const recommendations: string[] = [];

    let totalScore = 0;
    let scoredMetrics = 0;

    benchmarks.forEach(benchmark => {
      totalScore += benchmark.percentile;
      scoredMetrics++;

      if (benchmark.percentile >= 75) {
        strengths.push(`Strong ${benchmark.metric.toLowerCase()} (${benchmark.percentile}th percentile)`);
      } else if (benchmark.percentile <= 25) {
        threats.push(`Weak ${benchmark.metric.toLowerCase()} (${benchmark.percentile}th percentile)`);
        recommendations.push(`Priority: Improve ${benchmark.metric.toLowerCase()}`);
      } else if (benchmark.percentile >= 50) {
        opportunities.push(`Potential to improve ${benchmark.metric.toLowerCase()}`);
      }
    });

    // Add general opportunities based on data analysis
    const avgCustomerValue = this.calculateAvgCustomerValue(customerData);
    const churnRate = this.calculateChurnRate(customerData);

    if (avgCustomerValue < 500) {
      opportunities.push('Significant opportunity to increase customer lifetime value');
      recommendations.push('Implement upselling and cross-selling strategies');
    }

    if (churnRate > 20) {
      threats.push('High customer churn rate indicates retention challenges');
      recommendations.push('Urgent: Implement comprehensive retention program');
    }

    const overallScore = scoredMetrics > 0 ? Math.round(totalScore / scoredMetrics) : 50;

    return {
      strengths,
      opportunities,
      threats,
      recommendations: [...new Set(recommendations)],
      overallScore
    };
  }

  generateBusinessInsights(customerData: any[]): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Revenue insights
    const revenueInsight = this.analyzeRevenuePatterns(customerData);
    if (revenueInsight) insights.push(revenueInsight);

    // Retention insights
    const retentionInsight = this.analyzeRetentionPatterns(customerData);
    if (retentionInsight) insights.push(retentionInsight);

    // Customer segmentation insights
    const segmentationInsight = this.analyzeCustomerSegmentation(customerData);
    if (segmentationInsight) insights.push(segmentationInsight);

    // Engagement insights
    const engagementInsight = this.analyzeEngagementPatterns(customerData);
    if (engagementInsight) insights.push(engagementInsight);

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  private analyzeRevenuePatterns(customers: any[]): BusinessInsight | null {
    const highValueCustomers = customers.filter(c => (c.total_spent || 0) > 1000);
    const highValuePercentage = (highValueCustomers.length / customers.length) * 100;
    const highValueRevenue = highValueCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const revenueConcentration = totalRevenue > 0 ? (highValueRevenue / totalRevenue) * 100 : 0;

    return {
      category: 'revenue',
      title: 'Revenue Concentration Analysis',
      description: `${highValuePercentage.toFixed(1)}% of customers (${highValueCustomers.length}) generate ${revenueConcentration.toFixed(1)}% of total revenue`,
      impact: revenueConcentration > 60 ? 'high' : revenueConcentration > 40 ? 'medium' : 'low',
      actionability: 'immediate',
      confidence: 0.85,
      metrics: [
        { name: 'High-Value Customers', value: highValueCustomers.length },
        { name: 'Revenue Concentration', value: revenueConcentration, benchmark: 50 },
        { name: 'Avg High-Value Spending', value: highValueCustomers.length > 0 ? highValueRevenue / highValueCustomers.length : 0 }
      ]
    };
  }

  private analyzeRetentionPatterns(customers: any[]): BusinessInsight | null {
    const now = new Date();
    const recentlyActive = customers.filter(c => {
      if (!c.last_purchase_date) return false;
      const daysSince = (now.getTime() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 90;
    });

    const retentionRate = (recentlyActive.length / customers.length) * 100;
    const atRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 70);

    return {
      category: 'retention',
      title: 'Customer Retention Risk Assessment',
      description: `${retentionRate.toFixed(1)}% retention rate with ${atRiskCustomers.length} customers at high churn risk`,
      impact: retentionRate < 70 ? 'high' : retentionRate < 85 ? 'medium' : 'low',
      actionability: 'immediate',
      confidence: 0.9,
      metrics: [
        { name: 'Active Customers (90 days)', value: recentlyActive.length },
        { name: 'Retention Rate', value: retentionRate, benchmark: 85 },
        { name: 'High-Risk Customers', value: atRiskCustomers.length }
      ]
    };
  }

  private analyzeCustomerSegmentation(customers: any[]): BusinessInsight | null {
    const segments = {
      champions: customers.filter(c => (c.total_spent || 0) > 1000 && (c.purchase_count || 0) > 10),
      loyalists: customers.filter(c => (c.purchase_count || 0) > 5 && (c.risk_score || 0) < 30),
      newCustomers: customers.filter(c => (c.tenure || 0) < 6),
      atRisk: customers.filter(c => (c.risk_score || 0) >= 70)
    };

    const championPercentage = (segments.champions.length / customers.length) * 100;
    
    return {
      category: 'acquisition',
      title: 'Customer Segmentation Distribution',
      description: `Customer base: ${championPercentage.toFixed(1)}% champions, ${((segments.loyalists.length / customers.length) * 100).toFixed(1)}% loyalists, ${((segments.atRisk.length / customers.length) * 100).toFixed(1)}% at-risk`,
      impact: championPercentage < 10 ? 'high' : championPercentage < 20 ? 'medium' : 'low',
      actionability: 'short-term',
      confidence: 0.8,
      metrics: [
        { name: 'Champions', value: segments.champions.length },
        { name: 'Loyalists', value: segments.loyalists.length },
        { name: 'New Customers', value: segments.newCustomers.length },
        { name: 'At-Risk', value: segments.atRisk.length }
      ]
    };
  }

  private analyzeEngagementPatterns(customers: any[]): BusinessInsight | null {
    const engagedCustomers = customers.filter(c => {
      const hasRecentPurchase = c.last_purchase_date && 
        (new Date().getTime() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24) <= 60;
      const hasMultiplePurchases = (c.purchase_count || 0) > 1;
      const lowSupport = (c.support_calls || 0) <= 3;
      
      return hasRecentPurchase && hasMultiplePurchases && lowSupport;
    });

    const engagementRate = (engagedCustomers.length / customers.length) * 100;
    const avgEngagementValue = engagedCustomers.length > 0 
      ? engagedCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / engagedCustomers.length 
      : 0;

    return {
      category: 'engagement',
      title: 'Customer Engagement Health',
      description: `${engagementRate.toFixed(1)}% of customers show strong engagement patterns with average value of $${avgEngagementValue.toFixed(0)}`,
      impact: engagementRate < 40 ? 'high' : engagementRate < 60 ? 'medium' : 'low',
      actionability: 'short-term',
      confidence: 0.75,
      metrics: [
        { name: 'Engaged Customers', value: engagedCustomers.length },
        { name: 'Engagement Rate', value: engagementRate, benchmark: 60 },
        { name: 'Avg Engaged Customer Value', value: avgEngagementValue }
      ]
    };
  }

  generateExecutiveSummary(customerData: any[], insights: BusinessInsight[], benchmarks: IndustryBenchmark[]): ExecutiveSummary {
    // Key metrics
    const keyMetrics = [
      {
        name: 'Total Customers',
        value: customerData.length,
        change: 0, // Would need historical data
        status: 'stable' as const
      },
      {
        name: 'Customer Lifetime Value',
        value: this.calculateAvgCustomerValue(customerData),
        change: 0,
        status: 'stable' as const
      },
      {
        name: 'Churn Rate',
        value: this.calculateChurnRate(customerData),
        change: 0,
        status: 'stable' as const
      },
      {
        name: 'Retention Rate',
        value: 100 - this.calculateChurnRate(customerData),
        change: 0,
        status: 'stable' as const
      }
    ];

    // Critical insights (top 3)
    const criticalInsights = insights
      .filter(insight => insight.impact === 'high')
      .slice(0, 3);

    // Risk assessment
    const highRiskCustomers = customerData.filter(c => (c.risk_score || 0) >= 70);
    const riskLevel: 'low' | 'medium' | 'high' = 
      highRiskCustomers.length / customerData.length > 0.3 ? 'high' :
      highRiskCustomers.length / customerData.length > 0.15 ? 'medium' : 'low';

    const riskFactors = [];
    if (this.calculateChurnRate(customerData) > 20) riskFactors.push('High churn rate');
    if (this.calculateAvgCustomerValue(customerData) < 500) riskFactors.push('Low customer lifetime value');
    if (this.calculateSupportTicketRate(customerData) > 15) riskFactors.push('High support ticket rate');

    // Opportunities
    const opportunities = [
      {
        title: 'Customer Lifetime Value Optimization',
        potential: this.calculateAvgCustomerValue(customerData) * 0.3, // 30% potential increase
        effort: 'medium' as const,
        timeline: '3-6 months'
      },
      {
        title: 'Churn Reduction Program',
        potential: highRiskCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0) * 0.5,
        effort: 'high' as const,
        timeline: '6-12 months'
      }
    ];

    return {
      keyMetrics,
      criticalInsights,
      riskAssessment: {
        level: riskLevel,
        factors: riskFactors,
        mitigationStrategies: [
          'Implement proactive customer success program',
          'Develop targeted retention campaigns',
          'Enhance customer onboarding process'
        ]
      },
      opportunities
    };
  }
}

export const businessIntelligence = new BusinessIntelligenceEngine();
