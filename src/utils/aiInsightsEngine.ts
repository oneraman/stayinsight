import { generateCustomerInsights } from '@/lib/gemini';

export interface CustomerInsight {
  type: 'risk' | 'opportunity' | 'recommendation' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number;
}

export interface PortfolioAnalysis {
  overallHealth: 'excellent' | 'good' | 'moderate' | 'poor';
  healthScore: number;
  totalCustomers: number;
  atRiskCustomers: number;
  totalRevenue: number;
  atRiskRevenue: number;
  insights: CustomerInsight[];
  recommendations: string[];
}

/**
 * AI-powered insights engine for customer analysis
 */
export class AIInsightsEngine {
  /**
   * Generate comprehensive portfolio analysis using AI
   */
  async analyzePortfolio(customers: any[]): Promise<PortfolioAnalysis> {
    console.log('🧠 Starting AI portfolio analysis...');

    if (!customers || customers.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Calculate basic metrics
    const totalCustomers = customers.length;
    const atRiskCustomers = customers.filter(c => c.risk_score >= 70).length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const atRiskRevenue = customers
      .filter(c => c.risk_score >= 70)
      .reduce((sum, c) => sum + (c.total_spent || 0), 0);

    const avgRiskScore = customers.reduce((sum, c) => sum + (c.risk_score || 0), 0) / totalCustomers;
    const avgPurchaseCount = customers.reduce((sum, c) => sum + (c.purchase_count || 0), 0) / totalCustomers;
    const avgSpent = totalRevenue / totalCustomers;

    // Prepare data summary for AI
    const prompt = `Analyze this customer portfolio and provide strategic insights:

Portfolio Metrics:
- Total Customers: ${totalCustomers}
- At-Risk Customers: ${atRiskCustomers} (${((atRiskCustomers / totalCustomers) * 100).toFixed(1)}%)
- Total Revenue: $${totalRevenue.toLocaleString()}
- At-Risk Revenue: $${atRiskRevenue.toLocaleString()} (${((atRiskRevenue / totalRevenue) * 100).toFixed(1)}%)
- Average Risk Score: ${avgRiskScore.toFixed(1)}%
- Average Purchase Count: ${avgPurchaseCount.toFixed(1)}
- Average Customer Value: $${avgSpent.toFixed(2)}

Customer Segments:
${this.getSegmentBreakdown(customers)}

Top 5 Highest Risk Customers:
${this.getTopRiskCustomers(customers)}

Provide analysis in this JSON format:
{
  "overallHealth": "good|moderate|poor",
  "insights": [
    {
      "type": "risk|opportunity|recommendation|trend",
      "priority": "high|medium|low",
      "title": "Brief title",
      "description": "Detailed insight",
      "actionable": true|false,
      "confidence": 0.95
    }
  ],
  "recommendations": ["List of 3-5 actionable recommendations"]
}`;

    try {
      const response = await generateCustomerInsights(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const aiAnalysis = JSON.parse(jsonMatch[0]);
        
        const healthScore = this.calculateHealthScore(avgRiskScore, atRiskCustomers / totalCustomers);
        
        return {
          overallHealth: aiAnalysis.overallHealth || this.determineHealth(healthScore),
          healthScore,
          totalCustomers,
          atRiskCustomers,
          totalRevenue,
          atRiskRevenue,
          insights: aiAnalysis.insights || [],
          recommendations: aiAnalysis.recommendations || []
        };
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // Fallback to rule-based analysis
    return this.generateRuleBasedAnalysis(customers, {
      totalCustomers,
      atRiskCustomers,
      totalRevenue,
      atRiskRevenue,
      avgRiskScore
    });
  }

  /**
   * Generate insights for a specific customer
   */
  async analyzeCustomer(customer: any, portfolioContext: any[]): Promise<CustomerInsight[]> {
    const insights: CustomerInsight[] = [];

    // High risk alert
    if (customer.risk_score >= 80) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'Critical Churn Risk',
        description: `This customer has a ${customer.risk_score}% churn probability. Immediate intervention recommended.`,
        actionable: true,
        confidence: 0.9
      });
    }

    // High value customer
    if (customer.total_spent > 1000) {
      insights.push({
        type: 'opportunity',
        priority: 'high',
        title: 'High-Value Customer',
        description: `Total value: $${customer.total_spent.toLocaleString()}. VIP treatment recommended.`,
        actionable: true,
        confidence: 1.0
      });
    }

    // Inactive customer
    if (customer.days_since_last_purchase && customer.days_since_last_purchase > 180) {
      insights.push({
        type: 'recommendation',
        priority: 'medium',
        title: 'Re-engagement Needed',
        description: `No purchase in ${customer.days_since_last_purchase} days. Consider win-back campaign.`,
        actionable: true,
        confidence: 0.85
      });
    }

    // Low engagement
    if (customer.purchase_count < 2) {
      insights.push({
        type: 'recommendation',
        priority: 'medium',
        title: 'Low Purchase Frequency',
        description: 'Only 1 purchase. Focus on onboarding and early engagement.',
        actionable: true,
        confidence: 0.8
      });
    }

    return insights;
  }

  private getSegmentBreakdown(customers: any[]): string {
    const segments = customers.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(segments)
      .map(([segment, count]) => {
        const numCount = Number(count);
        return `- ${segment}: ${numCount} (${((numCount / customers.length) * 100).toFixed(1)}%)`;
      })
      .join('\n');
  }

  private getTopRiskCustomers(customers: any[]): string {
    return customers
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, 5)
      .map((c, i) => 
        `${i + 1}. ${c.name} - Risk: ${c.risk_score}%, Value: $${c.total_spent || 0}, Last Purchase: ${c.days_since_last_purchase || 'N/A'} days ago`
      )
      .join('\n');
  }

  private calculateHealthScore(avgRiskScore: number, riskPercentage: number): number {
    // Invert risk score to get health score (lower risk = better health)
    const riskComponent = (100 - avgRiskScore) * 0.6;
    const volumeComponent = (1 - riskPercentage) * 100 * 0.4;
    return Math.round(riskComponent + volumeComponent);
  }

  private determineHealth(healthScore: number): 'excellent' | 'good' | 'moderate' | 'poor' {
    if (healthScore >= 80) return 'excellent';
    if (healthScore >= 60) return 'good';
    if (healthScore >= 40) return 'moderate';
    return 'poor';
  }

  private generateRuleBasedAnalysis(customers: any[], metrics: {
    totalCustomers: number;
    atRiskCustomers: number;
    totalRevenue: number;
    atRiskRevenue: number;
    avgRiskScore: number;
  }): PortfolioAnalysis {
    const healthScore = this.calculateHealthScore(
      metrics.avgRiskScore || 0, 
      metrics.atRiskCustomers / Math.max(metrics.totalCustomers, 1)
    );
    
    const insights: CustomerInsight[] = [];

    // High risk alert
    if (metrics.atRiskCustomers / metrics.totalCustomers > 0.3) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'High Churn Risk Alert',
        description: `${metrics.atRiskCustomers} customers (${((metrics.atRiskCustomers / metrics.totalCustomers) * 100).toFixed(1)}%) are at high risk of churning.`,
        actionable: true,
        confidence: 0.9
      });
    }

    // Revenue at risk
    if (metrics.atRiskRevenue / metrics.totalRevenue > 0.2) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'Significant Revenue at Risk',
        description: `$${metrics.atRiskRevenue.toLocaleString()} in revenue at risk from high-risk customers.`,
        actionable: true,
        confidence: 0.85
      });
    }

    const recommendations = [
      'Prioritize retention campaigns for high-value at-risk customers',
      'Implement win-back strategies for inactive customers',
      'Enhance early engagement programs for new customers',
      'Create VIP programs for high-value customers',
      'Improve data collection to enhance analysis accuracy'
    ];

    return {
      overallHealth: this.determineHealth(healthScore),
      healthScore,
      totalCustomers: metrics.totalCustomers,
      atRiskCustomers: metrics.atRiskCustomers,
      totalRevenue: metrics.totalRevenue,
      atRiskRevenue: metrics.atRiskRevenue,
      insights,
      recommendations
    };
  }

  private getEmptyAnalysis(): PortfolioAnalysis {
    return {
      overallHealth: 'moderate',
      healthScore: 50,
      totalCustomers: 0,
      atRiskCustomers: 0,
      totalRevenue: 0,
      atRiskRevenue: 0,
      insights: [],
      recommendations: ['Upload customer data to begin analysis']
    };
  }
}

export const aiInsightsEngine = new AIInsightsEngine();
