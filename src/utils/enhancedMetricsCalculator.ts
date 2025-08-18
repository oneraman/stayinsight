import { CustomerData } from '@/utils/dataProcessing';

export interface PreciseMetrics {
  churnRate: number;
  retentionRate: number;
  customerLifetimeValue: number;
  atRiskRevenue: number;
  totalCustomers: number;
  highRiskCustomers: number;
  mediumRiskCustomers: number;
  lowRiskCustomers: number;
  accuracy: {
    confidence: number;
    dataQuality: number;
    predictionAccuracy: number;
  };
}

export class EnhancedMetricsCalculator {
  private readonly CHURN_THRESHOLDS = {
    HIGH: 65,    // Top 35% risk
    MEDIUM: 25   // Middle 40% risk, bottom 25% low risk
  };

  private readonly RECENCY_WEIGHTS = {
    RECENT: 1.0,      // Within time period
    MODERATE: 0.7,    // 1-2x time period
    STALE: 0.4        // 2-3x time period
  };

  calculatePreciseMetrics(
    customers: any[], 
    timePeriod: string = "30"
  ): PreciseMetrics {
    console.log('🎯 Calculating ultra-precise metrics...');
    
    if (!customers.length) {
      return this.getEmptyMetrics();
    }

    const periodDays = parseInt(timePeriod);
    const now = new Date();
    
    // Enhanced customer segmentation
    const segments = this.segmentCustomers(customers, now, periodDays);
    
    // Calculate precision-weighted churn rate
    const churnRate = this.calculateWeightedChurnRate(segments, customers.length);
    
    // Calculate enhanced retention rate
    const retentionRate = this.calculateEnhancedRetentionRate(segments, churnRate);
    
    // Calculate predictive customer lifetime value
    const customerLifetimeValue = this.calculatePredictiveLifetimeValue(customers, segments);
    
    // Calculate risk-weighted revenue at risk
    const atRiskRevenue = this.calculateRiskWeightedRevenue(customers);
    
    // Calculate accuracy metrics
    const accuracy = this.calculateAccuracyMetrics(customers, segments);

    const metrics: PreciseMetrics = {
      churnRate: Math.round(churnRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      customerLifetimeValue: Math.round(customerLifetimeValue),
      atRiskRevenue: Math.round(atRiskRevenue),
      totalCustomers: customers.length,
      highRiskCustomers: segments.highRisk.length,
      mediumRiskCustomers: segments.mediumRisk.length,
      lowRiskCustomers: segments.lowRisk.length,
      accuracy
    };

    console.log('✅ Precise metrics calculated:', metrics);
    return metrics;
  }

  private segmentCustomers(customers: any[], now: Date, periodDays: number) {
    const segments = {
      highRisk: [] as any[],
      mediumRisk: [] as any[],
      lowRisk: [] as any[],
      recent: [] as any[],
      moderate: [] as any[],
      stale: [] as any[]
    };

    customers.forEach(customer => {
      const riskScore = customer.risk_score || 0;
      
      // Risk segmentation
      if (riskScore > this.CHURN_THRESHOLDS.HIGH) {
        segments.highRisk.push(customer);
      } else if (riskScore > this.CHURN_THRESHOLDS.MEDIUM) {
        segments.mediumRisk.push(customer);
      } else {
        segments.lowRisk.push(customer);
      }

      // Recency segmentation
      if (customer.last_purchase_date) {
        const daysSinceLastPurchase = Math.floor(
          (now.getTime() - new Date(customer.last_purchase_date).getTime()) / (24 * 60 * 60 * 1000)
        );
        
        if (daysSinceLastPurchase <= periodDays) {
          segments.recent.push(customer);
        } else if (daysSinceLastPurchase <= periodDays * 2) {
          segments.moderate.push(customer);
        } else if (daysSinceLastPurchase <= periodDays * 3) {
          segments.stale.push(customer);
        }
      }
    });

    return segments;
  }

  private calculateWeightedChurnRate(segments: any, totalCustomers: number): number {
    if (totalCustomers === 0) return 0;

    // Weight by recency and activity
    const recentHighRisk = segments.recent.filter((c: any) => (c.risk_score || 0) > this.CHURN_THRESHOLDS.HIGH);
    const moderateHighRisk = segments.moderate.filter((c: any) => (c.risk_score || 0) > this.CHURN_THRESHOLDS.HIGH);
    const staleHighRisk = segments.stale.filter((c: any) => (c.risk_score || 0) > this.CHURN_THRESHOLDS.HIGH);

    // Apply recency weights to get more accurate churn probability
    const weightedChurnCustomers = 
      (recentHighRisk.length * this.RECENCY_WEIGHTS.RECENT) +
      (moderateHighRisk.length * this.RECENCY_WEIGHTS.MODERATE) +
      (staleHighRisk.length * this.RECENCY_WEIGHTS.STALE);

    return (weightedChurnCustomers / totalCustomers) * 100;
  }

  private calculateEnhancedRetentionRate(segments: any, churnRate: number): number {
    // Calculate retention rate based on active customers and trend analysis
    const activeCustomers = segments.recent.length + (segments.moderate.length * 0.7);
    const totalEvaluated = segments.recent.length + segments.moderate.length + segments.stale.length;
    
    if (totalEvaluated === 0) return Math.max(0, 100 - churnRate);
    
    const activityAdjustedRetention = (activeCustomers / totalEvaluated) * (100 - churnRate);
    return Math.max(0, Math.min(100, activityAdjustedRetention));
  }

  private calculatePredictiveLifetimeValue(customers: any[], segments: any): number {
    if (customers.length === 0) return 0;

    const totalRevenue = customers.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0);
    const avgRevenue = totalRevenue / customers.length;
    
    // Calculate purchase velocity
    const avgPurchaseCount = customers.reduce((sum: number, c: any) => sum + (c.purchase_count || 0), 0) / customers.length;
    const purchaseVelocity = Math.max(1, avgPurchaseCount / 12); // Purchases per month
    
    // Calculate retention multiplier based on segment health
    const lowRiskRatio = segments.lowRisk.length / customers.length;
    const retentionMultiplier = 1 + (lowRiskRatio * 2); // Up to 3x for very healthy portfolio
    
    // Predictive CLV formula
    return avgRevenue * purchaseVelocity * retentionMultiplier;
  }

  private calculateRiskWeightedRevenue(customers: any[]): number {
    return customers.reduce((sum: number, customer: any) => {
      const riskScore = customer.risk_score || 0;
      const revenue = customer.total_spent || 0;
      
      // Progressive risk weighting for more accurate revenue-at-risk calculation
      if (riskScore > 80) return sum + (revenue * 0.95);      // Very high risk - 95%
      if (riskScore > 70) return sum + (revenue * 0.80);      // High risk - 80%
      if (riskScore > 60) return sum + (revenue * 0.65);      // Medium-high risk - 65%
      if (riskScore > 50) return sum + (revenue * 0.45);      // Medium risk - 45%
      if (riskScore > 40) return sum + (revenue * 0.25);      // Medium-low risk - 25%
      if (riskScore > 30) return sum + (revenue * 0.10);      // Low-medium risk - 10%
      return sum;                                             // Low risk - 0%
    }, 0);
  }

  private calculateAccuracyMetrics(customers: any[], segments: any) {
    // Data quality assessment
    let totalQualityScore = 0;
    let validCustomers = 0;

    customers.forEach(customer => {
      let qualityScore = 0;
      let maxScore = 0;

      // Essential fields
      if (customer.customer_id || customer.customerId) qualityScore += 20;
      maxScore += 20;

      if (customer.email) qualityScore += 15;
      maxScore += 15;

      if (customer.last_purchase_date) qualityScore += 15;
      maxScore += 15;

      if ((customer.purchase_count || customer.purchaseCount) !== undefined) qualityScore += 15;
      maxScore += 15;

      if ((customer.total_spent || customer.totalSpent) !== undefined) qualityScore += 15;
      maxScore += 15;

      // Additional fields
      if (customer.risk_score !== undefined) qualityScore += 10;
      maxScore += 10;

      if (customer.segment) qualityScore += 5;
      maxScore += 5;

      if (customer.name) qualityScore += 5;
      maxScore += 5;

      const customerQuality = maxScore > 0 ? (qualityScore / maxScore) * 100 : 0;
      totalQualityScore += customerQuality;
      validCustomers++;
    });

    const dataQuality = validCustomers > 0 ? totalQualityScore / validCustomers : 0;

    // Confidence based on data completeness and distribution
    const riskDistribution = [
      segments.lowRisk.length,
      segments.mediumRisk.length,
      segments.highRisk.length
    ];
    
    // Calculate distribution entropy for confidence
    const total = customers.length;
    const entropy = riskDistribution.reduce((ent, count) => {
      if (count === 0) return ent;
      const p = count / total;
      return ent - (p * Math.log2(p));
    }, 0);
    
    const maxEntropy = Math.log2(3); // Max entropy for 3 categories
    const distributionScore = entropy / maxEntropy; // 0-1 score
    
    const confidence = Math.round((dataQuality * 0.7 + distributionScore * 30));

    // Prediction accuracy based on data recency and completeness
    const recentDataRatio = segments.recent.length / customers.length;
    const predictionAccuracy = Math.round(
      (dataQuality * 0.5 + recentDataRatio * 30 + distributionScore * 20)
    );

    return {
      confidence: Math.max(0, Math.min(100, confidence)),
      dataQuality: Math.round(dataQuality),
      predictionAccuracy: Math.max(0, Math.min(100, predictionAccuracy))
    };
  }

  private getEmptyMetrics(): PreciseMetrics {
    return {
      churnRate: 0,
      retentionRate: 0,
      customerLifetimeValue: 0,
      atRiskRevenue: 0,
      totalCustomers: 0,
      highRiskCustomers: 0,
      mediumRiskCustomers: 0,
      lowRiskCustomers: 0,
      accuracy: {
        confidence: 0,
        dataQuality: 0,
        predictionAccuracy: 0
      }
    };
  }
}

export const enhancedMetricsCalculator = new EnhancedMetricsCalculator();