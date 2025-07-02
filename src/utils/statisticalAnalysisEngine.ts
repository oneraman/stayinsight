
export interface CorrelationAnalysis {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: number;
  interpretation: string;
}

export interface CohortAnalysis {
  cohortPeriod: string;
  customerCount: number;
  retentionRate: number;
  averageValue: number;
  churnRate: number;
  insights: string[];
}

export interface PredictiveModel {
  customerId: string;
  churnProbability: number;
  confidenceLevel: number;
  keyFactors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  recommendations: string[];
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  seasonality: number;
  forecast: Array<{
    period: string;
    predictedValue: number;
    confidence: number;
  }>;
}

export class StatisticalAnalysisEngine {
  calculateCorrelations(customers: any[]): CorrelationAnalysis[] {
    const correlations: CorrelationAnalysis[] = [];
    
    const metrics = [
      { key: 'total_spent', name: 'Total Spent' },
      { key: 'purchase_count', name: 'Purchase Count' },
      { key: 'avg_order_value', name: 'Average Order Value' },
      { key: 'tenure', name: 'Customer Tenure' },
      { key: 'support_calls', name: 'Support Calls' },
      { key: 'risk_score', name: 'Risk Score' }
    ];

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = customers.map(c => c[metric1.key] || 0).filter(v => v !== null);
        const values2 = customers.map(c => c[metric2.key] || 0).filter(v => v !== null);
        
        if (values1.length > 10 && values2.length > 10) {
          const correlation = this.calculatePearsonCorrelation(values1, values2);
          const significance = this.calculateSignificance(correlation, values1.length);
          
          correlations.push({
            metric1: metric1.name,
            metric2: metric2.name,
            correlation: Math.round(correlation * 1000) / 1000,
            significance,
            interpretation: this.interpretCorrelation(correlation, significance)
          });
        }
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSignificance(correlation: number, sampleSize: number): number {
    const t = Math.abs(correlation) * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    // Simplified p-value approximation
    return Math.max(0, 1 - (t / (t + sampleSize - 2)));
  }

  private interpretCorrelation(correlation: number, significance: number): string {
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    const confidenceLevel = significance < 0.05 ? 'statistically significant' : 'not statistically significant';
    
    let strengthDesc = '';
    if (strength > 0.8) strengthDesc = 'very strong';
    else if (strength > 0.6) strengthDesc = 'strong';
    else if (strength > 0.4) strengthDesc = 'moderate';
    else if (strength > 0.2) strengthDesc = 'weak';
    else strengthDesc = 'very weak';

    return `${strengthDesc} ${direction} correlation (${confidenceLevel})`;
  }

  performCohortAnalysis(customers: any[]): CohortAnalysis[] {
    const cohorts = new Map<string, any[]>();
    
    // Group customers by signup month
    customers.forEach(customer => {
      if (customer.created_at) {
        const cohortMonth = new Date(customer.created_at).toISOString().slice(0, 7);
        if (!cohorts.has(cohortMonth)) {
          cohorts.set(cohortMonth, []);
        }
        cohorts.get(cohortMonth)!.push(customer);
      }
    });

    const cohortAnalyses: CohortAnalysis[] = [];
    const now = new Date();

    cohorts.forEach((cohortCustomers, period) => {
      const totalCustomers = cohortCustomers.length;
      const activeCustomers = cohortCustomers.filter(c => {
        if (!c.last_purchase_date) return false;
        const daysSinceLastPurchase = (now.getTime() - new Date(c.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastPurchase <= 90; // Active if purchased within 90 days
      }).length;

      const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
      const churnRate = 100 - retentionRate;
      const averageValue = cohortCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / totalCustomers;

      const insights: string[] = [];
      if (retentionRate > 80) insights.push('High retention cohort - excellent customer loyalty');
      if (retentionRate < 50) insights.push('Low retention cohort - requires attention');
      if (averageValue > 1000) insights.push('High-value customer cohort');
      if (churnRate > 30) insights.push('High churn risk - implement retention strategies');

      cohortAnalyses.push({
        cohortPeriod: period,
        customerCount: totalCustomers,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageValue: Math.round(averageValue),
        churnRate: Math.round(churnRate * 10) / 10,
        insights
      });
    });

    return cohortAnalyses.sort((a, b) => b.cohortPeriod.localeCompare(a.cohortPeriod));
  }

  generatePredictiveModels(customers: any[]): PredictiveModel[] {
    return customers.map(customer => {
      const factors = this.analyzeChurnFactors(customer);
      const churnProbability = this.calculateChurnProbability(customer, factors);
      const confidenceLevel = this.calculatePredictionConfidence(customer);

      return {
        customerId: customer.customer_id,
        churnProbability: Math.round(churnProbability * 1000) / 1000,
        confidenceLevel: Math.round(confidenceLevel * 1000) / 1000,
        keyFactors: factors,
        recommendations: this.generateRecommendations(customer, factors)
      };
    }).filter(model => model.churnProbability > 0.3) // Focus on at-risk customers
     .sort((a, b) => b.churnProbability - a.churnProbability)
     .slice(0, 50); // Top 50 at-risk customers
  }

  private analyzeChurnFactors(customer: any): Array<{ factor: string; impact: number; direction: 'positive' | 'negative' }> {
    const factors = [];
    const now = new Date();

    // Recency factor
    if (customer.last_purchase_date) {
      const daysSinceLastPurchase = (now.getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24);
      const recencyImpact = Math.min(daysSinceLastPurchase / 365, 1); // Normalize to 0-1
      factors.push({
        factor: 'Days Since Last Purchase',
        impact: recencyImpact,
        direction: 'negative' as const
      });
    }

    // Frequency factor
    const purchaseCount = customer.purchase_count || 0;
    const frequencyImpact = Math.max(0, 1 - (purchaseCount / 50)); // Normalize, more purchases = less churn risk
    factors.push({
      factor: 'Purchase Frequency',
      impact: frequencyImpact,
      direction: 'negative' as const
    });

    // Monetary factor
    const totalSpent = customer.total_spent || 0;
    const monetaryImpact = Math.max(0, 1 - (totalSpent / 10000)); // Normalize, more spending = less churn risk
    factors.push({
      factor: 'Total Spending',
      impact: monetaryImpact,
      direction: 'negative' as const
    });

    // Support calls factor
    const supportCalls = customer.support_calls || 0;
    const supportImpact = Math.min(supportCalls / 20, 1); // More support calls = higher churn risk
    factors.push({
      factor: 'Support Interactions',
      impact: supportImpact,
      direction: 'positive' as const
    });

    return factors.sort((a, b) => b.impact - a.impact);
  }

  private calculateChurnProbability(customer: any, factors: any[]): number {
    // Weighted combination of factors
    const weights = { recency: 0.4, frequency: 0.3, monetary: 0.2, support: 0.1 };
    
    let probability = 0;
    factors.forEach((factor, index) => {
      const weight = Object.values(weights)[index] || 0.1;
      probability += factor.impact * weight * (factor.direction === 'positive' ? 1 : -1);
    });

    return Math.max(0, Math.min(1, probability + 0.5)); // Normalize to 0-1 range
  }

  private calculatePredictionConfidence(customer: any): number {
    let confidence = 0.5; // Base confidence
    
    // More data points = higher confidence
    const dataPoints = [
      customer.total_spent,
      customer.purchase_count,
      customer.last_purchase_date,
      customer.avg_order_value,
      customer.tenure
    ].filter(point => point !== null && point !== undefined).length;
    
    confidence += (dataPoints / 10) * 0.3; // Up to 30% boost for complete data
    
    // Tenure affects confidence
    if (customer.tenure && customer.tenure > 12) {
      confidence += 0.2; // 20% boost for long-term customers
    }

    return Math.min(1, confidence);
  }

  private generateRecommendations(customer: any, factors: any[]): string[] {
    const recommendations: string[] = [];
    
    factors.forEach(factor => {
      if (factor.impact > 0.6) {
        switch (factor.factor) {
          case 'Days Since Last Purchase':
            recommendations.push('Send targeted re-engagement campaign');
            recommendations.push('Offer personalized discount or incentive');
            break;
          case 'Purchase Frequency':
            recommendations.push('Implement loyalty program to encourage repeat purchases');
            recommendations.push('Send product recommendations based on purchase history');
            break;
          case 'Total Spending':
            recommendations.push('Provide value-added services to increase engagement');
            recommendations.push('Offer budget-friendly product alternatives');
            break;
          case 'Support Interactions':
            recommendations.push('Proactive customer success outreach');
            recommendations.push('Review and improve product experience');
            break;
        }
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  analyzeTrends(customers: any[], metric: string): TrendAnalysis {
    // Group customers by month and calculate metric values
    const monthlyData = new Map<string, number[]>();
    
    customers.forEach(customer => {
      if (customer.last_purchase_date) {
        const month = new Date(customer.last_purchase_date).toISOString().slice(0, 7);
        if (!monthlyData.has(month)) {
          monthlyData.set(month, []);
        }
        monthlyData.get(month)!.push(customer[metric] || 0);
      }
    });

    // Calculate monthly averages
    const monthlyAverages = Array.from(monthlyData.entries())
      .map(([month, values]) => ({
        month,
        average: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trend
    const trend = this.calculateTrend(monthlyAverages.map(d => d.average));
    const changeRate = this.calculateChangeRate(monthlyAverages.map(d => d.average));
    const seasonality = this.calculateSeasonality(monthlyAverages.map(d => d.average));

    // Generate forecast
    const forecast = this.generateForecast(monthlyAverages, 6); // 6 months forecast

    return {
      metric,
      trend,
      changeRate: Math.round(changeRate * 1000) / 1000,
      seasonality: Math.round(seasonality * 1000) / 1000,
      forecast
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  private calculateChangeRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return first !== 0 ? ((last - first) / first) * 100 : 0;
  }

  private calculateSeasonality(values: number[]): number {
    if (values.length < 12) return 0; // Need at least a year of data
    
    // Simple seasonality calculation - coefficient of variation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean !== 0 ? (stdDev / mean) * 100 : 0;
  }

  private generateForecast(
    historicalData: Array<{ month: string; average: number }>, 
    periods: number
  ): Array<{ period: string; predictedValue: number; confidence: number }> {
    if (historicalData.length < 3) {
      return Array(periods).fill(null).map((_, i) => ({
        period: this.getNextMonth(historicalData[historicalData.length - 1]?.month || '2024-01', i + 1),
        predictedValue: historicalData[historicalData.length - 1]?.average || 0,
        confidence: 0.3
      }));
    }

    const values = historicalData.map(d => d.average);
    const trend = this.calculateLinearTrend(values);
    const lastValue = values[values.length - 1];
    const lastMonth = historicalData[historicalData.length - 1].month;

    return Array(periods).fill(null).map((_, i) => {
      const periodIndex = i + 1;
      const predictedValue = lastValue + (trend * periodIndex);
      const confidence = Math.max(0.1, 0.8 - (periodIndex * 0.1)); // Decreasing confidence over time

      return {
        period: this.getNextMonth(lastMonth, periodIndex),
        predictedValue: Math.max(0, Math.round(predictedValue * 100) / 100),
        confidence: Math.round(confidence * 100) / 100
      };
    });
  }

  private calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private getNextMonth(currentMonth: string, periodsAhead: number): string {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() + periodsAhead);
    return date.toISOString().slice(0, 7);
  }
}

export const statisticalEngine = new StatisticalAnalysisEngine();
