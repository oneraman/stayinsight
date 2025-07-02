
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'analytical' | 'custom';
  sections: ReportSection[];
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients?: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'insights' | 'recommendations';
  config: any;
  order: number;
}

export interface ExecutiveReport {
  title: string;
  period: string;
  summary: {
    totalCustomers: number;
    churnRate: number;
    retentionRate: number;
    avgCustomerValue: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  keyInsights: string[];
  criticalActions: string[];
  trends: Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  recommendations: string[];
}

export interface OperationalReport {
  title: string;
  period: string;
  customerSegments: Array<{
    segment: string;
    count: number;
    avgValue: number;
    churnRisk: number;
  }>;
  riskDistribution: Array<{
    riskLevel: string;
    count: number;
    percentage: number;
  }>;
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    customers: number;
    expectedImpact: string;
  }>;
  metrics: Array<{
    name: string;
    value: number;
    target?: number;
    status: 'on-track' | 'at-risk' | 'off-track';
  }>;
}

export class ReportingEngine {
  private templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Executive Summary Template
    const executiveTemplate: ReportTemplate = {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for leadership',
      type: 'executive',
      sections: [
        {
          id: 'kpi-overview',
          title: 'Key Performance Indicators',
          type: 'metrics',
          config: { metrics: ['churn_rate', 'retention_rate', 'customer_ltv', 'total_customers'] },
          order: 1
        },
        {
          id: 'trend-analysis',
          title: 'Trend Analysis',
          type: 'chart',
          config: { chartType: 'line', timeframe: '6m' },
          order: 2
        },
        {
          id: 'key-insights',
          title: 'Strategic Insights',
          type: 'insights',
          config: { maxInsights: 5, priority: 'high' },
          order: 3
        }
      ],
      frequency: 'monthly'
    };

    // Operational Dashboard Template
    const operationalTemplate: ReportTemplate = {
      id: 'operational-dashboard',
      name: 'Operational Dashboard',
      description: 'Detailed operational metrics and actions',
      type: 'operational',
      sections: [
        {
          id: 'customer-segments',
          title: 'Customer Segmentation',
          type: 'chart',
          config: { chartType: 'pie', breakdown: 'risk_level' },
          order: 1
        },
        {
          id: 'high-risk-customers',
          title: 'High-Risk Customers',
          type: 'table',
          config: { filter: 'risk_score >= 70', limit: 20 },
          order: 2
        },
        {
          id: 'action-recommendations',
          title: 'Recommended Actions',
          type: 'recommendations',
          config: { maxRecommendations: 10 },
          order: 3
        }
      ],
      frequency: 'weekly'
    };

    this.templates.set(executiveTemplate.id, executiveTemplate);
    this.templates.set(operationalTemplate.id, operationalTemplate);
  }

  generateExecutiveReport(customers: any[], timeframe: string = '30'): ExecutiveReport {
    const totalCustomers = customers.length;
    const highRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 70);
    const churnRate = totalCustomers > 0 ? (highRiskCustomers.length / totalCustomers) * 100 : 0;
    const retentionRate = 100 - churnRate;
    const avgCustomerValue = totalCustomers > 0 
      ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers 
      : 0;

    const riskLevel: 'low' | 'medium' | 'high' = 
      churnRate > 25 ? 'high' : churnRate > 15 ? 'medium' : 'low';

    const keyInsights = this.generateKeyInsights(customers);
    const criticalActions = this.generateCriticalActions(customers, churnRate);
    const trends = this.analyzeTrends(customers);
    const recommendations = this.generateStrategicRecommendations(customers, churnRate, avgCustomerValue);

    return {
      title: 'Executive Summary Report',
      period: `Last ${timeframe} days`,
      summary: {
        totalCustomers,
        churnRate: Math.round(churnRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        avgCustomerValue: Math.round(avgCustomerValue),
        riskLevel
      },
      keyInsights,
      criticalActions,
      trends,
      recommendations
    };
  }

  generateOperationalReport(customers: any[], timeframe: string = '30'): OperationalReport {
    const customerSegments = this.analyzeCustomerSegments(customers);
    const riskDistribution = this.analyzeRiskDistribution(customers);
    const actionItems = this.generateActionItems(customers);
    const metrics = this.calculateOperationalMetrics(customers);

    return {
      title: 'Operational Report',
      period: `Last ${timeframe} days`,
      customerSegments,
      riskDistribution,
      actionItems,
      metrics
    };
  }

  private generateKeyInsights(customers: any[]): string[] {
    const insights: string[] = [];
    
    const highValueCustomers = customers.filter(c => (c.total_spent || 0) > 1000);
    if (highValueCustomers.length > 0) {
      const percentage = (highValueCustomers.length / customers.length) * 100;
      insights.push(`${percentage.toFixed(1)}% of customers are high-value (>$1,000 spent)`);
    }

    const recentPurchasers = customers.filter(c => {
      if (!c.last_purchase_date) return false;
      const daysSince = (Date.now() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    if (recentPurchasers.length > 0) {
      const percentage = (recentPurchasers.length / customers.length) * 100;
      insights.push(`${percentage.toFixed(1)}% of customers made purchases in the last 30 days`);
    }

    const supportHeavyCustomers = customers.filter(c => (c.support_calls || 0) > 5);
    if (supportHeavyCustomers.length > 0) {
      const percentage = (supportHeavyCustomers.length / customers.length) * 100;
      insights.push(`${percentage.toFixed(1)}% of customers have high support interaction (>5 calls)`);
    }

    return insights.slice(0, 5);
  }

  private generateCriticalActions(customers: any[], churnRate: number): string[] {
    const actions: string[] = [];

    if (churnRate > 20) {
      actions.push('Immediate intervention required: Churn rate exceeds 20%');
    }

    const highRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 80);
    if (highRiskCustomers.length > 0) {
      actions.push(`Urgent: ${highRiskCustomers.length} customers at critical churn risk (>80% risk score)`);
    }

    const inactiveCustomers = customers.filter(c => {
      if (!c.last_purchase_date) return true;
      const daysSince = (Date.now() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 90;
    });

    if (inactiveCustomers.length > customers.length * 0.3) {
      actions.push('High customer inactivity detected: Implement re-engagement campaign');
    }

    return actions;
  }

  private analyzeTrends(customers: any[]): Array<{ metric: string; trend: 'up' | 'down' | 'stable'; change: number; impact: 'positive' | 'negative' | 'neutral' }> {
    // This would typically compare with historical data
    // For now, we'll simulate trend analysis
    return [
      {
        metric: 'Customer Acquisition',
        trend: 'up',
        change: 12.5,
        impact: 'positive'
      },
      {
        metric: 'Average Order Value',
        trend: 'stable',
        change: 2.1,
        impact: 'neutral'
      },
      {
        metric: 'Churn Rate',
        trend: 'down',
        change: -8.3,
        impact: 'positive'
      }
    ];
  }

  private generateStrategicRecommendations(customers: any[], churnRate: number, avgCustomerValue: number): string[] {
    const recommendations: string[] = [];

    if (churnRate > 15) {
      recommendations.push('Implement proactive customer success program to reduce churn');
    }

    if (avgCustomerValue < 500) {
      recommendations.push('Focus on customer lifetime value optimization through upselling');
    }

    const lowEngagementCustomers = customers.filter(c => (c.purchase_count || 0) <= 1);
    if (lowEngagementCustomers.length > customers.length * 0.4) {
      recommendations.push('Develop customer onboarding and engagement programs');
    }

    recommendations.push('Invest in predictive analytics for early churn detection');
    recommendations.push('Enhance customer segmentation for targeted marketing');

    return recommendations;
  }

  private analyzeCustomerSegments(customers: any[]) {
    const segments = ['Champions', 'Loyal Customers', 'Potential Loyalists', 'At Risk', 'Cannot Lose Them'];
    
    return segments.map(segment => {
      let segmentCustomers: any[] = [];
      
      switch (segment) {
        case 'Champions':
          segmentCustomers = customers.filter(c => 
            (c.total_spent || 0) > 1000 && (c.purchase_count || 0) > 10
          );
          break;
        case 'Loyal Customers':
          segmentCustomers = customers.filter(c => 
            (c.purchase_count || 0) > 5 && (c.risk_score || 0) < 30
          );
          break;
        case 'At Risk':
          segmentCustomers = customers.filter(c => 
            (c.risk_score || 0) >= 70
          );
          break;
        default:
          segmentCustomers = [];
      }

      const avgValue = segmentCustomers.length > 0 
        ? segmentCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / segmentCustomers.length 
        : 0;
      
      const churnRisk = segmentCustomers.length > 0
        ? segmentCustomers.reduce((sum, c) => sum + (c.risk_score || 0), 0) / segmentCustomers.length
        : 0;

      return {
        segment,
        count: segmentCustomers.length,
        avgValue: Math.round(avgValue),
        churnRisk: Math.round(churnRisk)
      };
    });
  }

  private analyzeRiskDistribution(customers: any[]) {
    const riskLevels = [
      { level: 'Low Risk (0-30)', min: 0, max: 30 },
      { level: 'Medium Risk (31-69)', min: 31, max: 69 },
      { level: 'High Risk (70-100)', min: 70, max: 100 }
    ];

    return riskLevels.map(({ level, min, max }) => {
      const count = customers.filter(c => {
        const risk = c.risk_score || 0;
        return risk >= min && risk <= max;
      }).length;

      return {
        riskLevel: level,
        count,
        percentage: Math.round((count / customers.length) * 100)
      };
    });
  }

  private generateActionItems(customers: any[]) {
    const highRiskCustomers = customers.filter(c => (c.risk_score || 0) >= 70);
    const inactiveCustomers = customers.filter(c => {
      if (!c.last_purchase_date) return true;
      const daysSince = (Date.now() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 60;
    });

    return [
      {
        priority: 'high' as const,
        action: 'Immediate outreach to high-risk customers',
        customers: highRiskCustomers.length,
        expectedImpact: 'Prevent 30-50% of potential churn'
      },
      {
        priority: 'medium' as const,
        action: 'Re-engagement campaign for inactive customers',
        customers: inactiveCustomers.length,
        expectedImpact: 'Reactivate 15-25% of dormant customers'
      },
      {
        priority: 'low' as const,
        action: 'Loyalty program optimization',
        customers: customers.length,
        expectedImpact: 'Increase customer lifetime value by 10-20%'
      }
    ];
  }

  private calculateOperationalMetrics(customers: any[]) {
    const totalCustomers = customers.length;
    const highRiskCount = customers.filter(c => (c.risk_score || 0) >= 70).length;
    const churnRate = totalCustomers > 0 ? (highRiskCount / totalCustomers) * 100 : 0;
    
    const avgCustomerValue = totalCustomers > 0 
      ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers 
      : 0;

    return [
      {
        name: 'Churn Rate',
        value: Math.round(churnRate * 10) / 10,
        target: 15,
        status: churnRate <= 15 ? 'on-track' as const : churnRate <= 25 ? 'at-risk' as const : 'off-track' as const
      },
      {
        name: 'Customer Lifetime Value',
        value: Math.round(avgCustomerValue),
        target: 1000,
        status: avgCustomerValue >= 1000 ? 'on-track' as const : avgCustomerValue >= 700 ? 'at-risk' as const : 'off-track' as const
      },
      {
        name: 'Customer Satisfaction',
        value: 85, // This would come from actual data
        target: 90,
        status: 'at-risk' as const
      }
    ];
  }

  getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  createCustomTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }
}

export const reportingEngine = new ReportingEngine();
