
export interface CustomerProfile {
  customerId: string;
  riskScore: number;
  segment: string;
  dataQuality: number;
  businessMetrics: {
    totalSpent: number;
    purchaseCount: number;
    avgOrderValue: number;
    daysSinceLastPurchase: number | null;
    customerLifetimeValue: number;
    purchaseFrequency: number;
  };
  behavioralIndicators: {
    engagementLevel: 'low' | 'medium' | 'high';
    loyaltyScore: number;
    riskFactors: string[];
    opportunityAreas: string[];
  };
}

export interface AIInsightResult {
  customerId: string;
  riskLevel: 'low' | 'medium' | 'high';
  churnProbability: number;
  recommendations: string[];
  keyFactors: string[];
  actionPriority: 'low' | 'medium' | 'high';
}

export class AdvancedAIAnalyzer {
  async generatePortfolioInsights(customerProfiles: CustomerProfile[], qualityReport: any): Promise<any> {
    console.log('🧠 Generating portfolio-level AI insights...');
    
    const totalCustomers = customerProfiles.length;
    const highRiskCount = customerProfiles.filter(c => c.riskScore >= 70).length;
    const totalRevenue = customerProfiles.reduce((sum, c) => sum + c.businessMetrics.totalSpent, 0);
    const avgCustomerValue = totalRevenue / totalCustomers;
    
    const insights = {
      portfolioHealth: {
        totalCustomers,
        highRiskPercentage: (highRiskCount / totalCustomers) * 100,
        avgCustomerValue,
        totalRevenue,
        dataQualityScore: qualityReport.overallScore
      },
      keyFindings: [
        `${highRiskCount} customers (${((highRiskCount / totalCustomers) * 100).toFixed(1)}%) are at high risk of churning`,
        `Average customer value is $${avgCustomerValue.toFixed(2)}`,
        `Total portfolio value: $${totalRevenue.toLocaleString()}`,
        `Data quality score: ${qualityReport.overallScore.toFixed(1)}%`
      ],
      recommendations: [
        highRiskCount > totalCustomers * 0.2 ? 'Immediate attention needed for high-risk customer segment' : 'Customer risk levels are manageable',
        avgCustomerValue > 500 ? 'Focus on customer retention strategies' : 'Consider customer value enhancement programs',
        qualityReport.overallScore < 80 ? 'Improve data collection processes' : 'Data quality is sufficient for analysis'
      ]
    };
    
    console.log('📊 Portfolio insights generated:', insights);
    return insights;
  }

  async generateContextualInsights(
    customer: CustomerProfile,
    industryBenchmarks: any,
    qualityReport: any
  ): Promise<AIInsightResult> {
    console.log(`🔍 Generating contextual insights for customer ${customer.customerId}...`);
    
    const riskLevel = customer.riskScore < 30 ? 'low' : customer.riskScore < 70 ? 'medium' : 'high';
    const churnProbability = Math.min(customer.riskScore / 100, 0.95);
    
    const recommendations: string[] = [];
    const keyFactors: string[] = [];
    
    // Analyze business metrics
    if (customer.businessMetrics.daysSinceLastPurchase && customer.businessMetrics.daysSinceLastPurchase > 90) {
      keyFactors.push('Long time since last purchase');
      recommendations.push('Re-engagement campaign needed');
    }
    
    if (customer.businessMetrics.purchaseCount < 2) {
      keyFactors.push('Low purchase frequency');
      recommendations.push('Onboarding and early engagement focus');
    }
    
    if (customer.businessMetrics.totalSpent > 1000) {
      keyFactors.push('High-value customer');
      recommendations.push('VIP retention program');
    }
    
    // Analyze behavioral indicators
    if (customer.behavioralIndicators.engagementLevel === 'low') {
      keyFactors.push('Low engagement level');
      recommendations.push('Personalized engagement strategy');
    }
    
    if (customer.behavioralIndicators.loyaltyScore < 30) {
      keyFactors.push('Low loyalty score');
      recommendations.push('Loyalty building initiatives');
    }
    
    // Add risk-specific recommendations
    customer.behavioralIndicators.riskFactors.forEach(factor => {
      keyFactors.push(factor);
    });
    
    // Determine action priority
    const actionPriority = customer.riskScore >= 80 ? 'high' : 
                          customer.riskScore >= 50 ? 'medium' : 'low';
    
    const insight: AIInsightResult = {
      customerId: customer.customerId,
      riskLevel,
      churnProbability,
      recommendations,
      keyFactors,
      actionPriority
    };
    
    console.log(`✅ Generated insights for ${customer.customerId}:`, insight);
    return insight;
  }
}
