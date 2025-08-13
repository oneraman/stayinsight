export interface RiskFactors {
  recency: number;
  frequency: number;
  monetary: number;
  behavioral: number;
  demographic: number;
}

export interface CustomerMetrics {
  lastPurchaseDate: string | null;
  purchaseCount: number;
  totalSpent: number;
  avgOrderValue: number;
  age?: number;
  tenure?: number;
  supportCalls?: number;
  paymentDelay?: number;
  usageFrequency?: string;
  subscriptionType?: string;
}

// Optimized RFM-based risk scoring with behavioral factors
const riskScoreCache = new Map<string, { score: number; factors: RiskFactors }>();

export const calculateEnhancedRiskScore = (metrics: CustomerMetrics): { score: number; factors: RiskFactors } => {
  // Create cache key from metrics
  const cacheKey = JSON.stringify(metrics);
  
  if (riskScoreCache.has(cacheKey)) {
    return riskScoreCache.get(cacheKey)!;
  }
  
  // Pre-calculate commonly used values
  const now = new Date();
  const currentTime = now.getTime();
  
  // Optimized Recency Score (40% weight)
  let recencyScore = 50;
  if (metrics.lastPurchaseDate) {
    const lastPurchaseTime = new Date(metrics.lastPurchaseDate).getTime();
    const daysSinceLastPurchase = Math.floor((currentTime - lastPurchaseTime) / 86400000); // 24*60*60*1000
    
    // Use lookup table for better performance
    if (daysSinceLastPurchase <= 7) recencyScore = 10;
    else if (daysSinceLastPurchase <= 14) recencyScore = 15;
    else if (daysSinceLastPurchase <= 30) recencyScore = 25;
    else if (daysSinceLastPurchase <= 60) recencyScore = 40;
    else if (daysSinceLastPurchase <= 90) recencyScore = 55;
    else if (daysSinceLastPurchase <= 180) recencyScore = 70;
    else if (daysSinceLastPurchase <= 365) recencyScore = 85;
    else recencyScore = 95;
  } else {
    recencyScore = 90;
  }
  
  // Optimized Frequency Score (25% weight)
  const purchaseCount = metrics.purchaseCount || 0;
  let frequencyScore = 50;
  
  if (purchaseCount >= 50) frequencyScore = 5;
  else if (purchaseCount >= 20) frequencyScore = 15;
  else if (purchaseCount >= 10) frequencyScore = 25;
  else if (purchaseCount >= 5) frequencyScore = 35;
  else if (purchaseCount >= 2) frequencyScore = 50;
  else if (purchaseCount === 1) frequencyScore = 70;
  else frequencyScore = 90;
  
  // Optimized Monetary Score (20% weight)
  const totalSpent = metrics.totalSpent || 0;
  const avgOrderValue = metrics.avgOrderValue || 0;
  
  // Simplified tier calculation
  const spendingTier = totalSpent > 10000 ? 1 : totalSpent > 5000 ? 2 : totalSpent > 1000 ? 3 : totalSpent > 500 ? 4 : totalSpent > 100 ? 5 : 6;
  const orderValueTier = avgOrderValue > 500 ? 1 : avgOrderValue > 200 ? 2 : avgOrderValue > 100 ? 3 : avgOrderValue > 50 ? 4 : 5;
  
  const monetaryScore = Math.min(spendingTier, orderValueTier) * 15;
  
  // Optimized Behavioral Score (10% weight)
  let behavioralScore = 50;
  const supportCalls = metrics.supportCalls || 0;
  const paymentDelay = metrics.paymentDelay || 0;
  
  // Simplified behavioral scoring
  if (supportCalls > 10) behavioralScore += 25;
  else if (supportCalls > 5) behavioralScore += 15;
  else if (supportCalls > 2) behavioralScore += 5;
  else if (supportCalls === 0) behavioralScore -= 5;
  
  if (paymentDelay > 60) behavioralScore += 30;
  else if (paymentDelay > 30) behavioralScore += 20;
  else if (paymentDelay > 7) behavioralScore += 10;
  else if (paymentDelay === 0) behavioralScore -= 5;
  
  if (metrics.usageFrequency) {
    const usage = metrics.usageFrequency.toLowerCase();
    if (usage.includes('never') || usage.includes('rarely')) behavioralScore += 20;
    else if (usage.includes('low')) behavioralScore += 10;
    else if (usage.includes('high') || usage.includes('frequent')) behavioralScore -= 10;
  }
  
  // Optimized Demographic Score (5% weight)
  let demographicScore = 50;
  
  if (metrics.tenure) {
    if (metrics.tenure > 36) demographicScore -= 15;
    else if (metrics.tenure > 24) demographicScore -= 10;
    else if (metrics.tenure > 12) demographicScore -= 5;
    else if (metrics.tenure < 3) demographicScore += 10;
  }
  
  if (metrics.subscriptionType) {
    const subType = metrics.subscriptionType.toLowerCase();
    if (subType.includes('premium') || subType.includes('annual')) demographicScore -= 10;
    else if (subType.includes('trial') || subType.includes('free')) demographicScore += 15;
  }
  
  // Calculate final score efficiently
  const finalScore = Math.round(
    recencyScore * 0.40 +
    frequencyScore * 0.25 +
    monetaryScore * 0.20 +
    behavioralScore * 0.10 +
    demographicScore * 0.05
  );
  
  const result = {
    score: Math.max(0, Math.min(100, finalScore)),
    factors: {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore,
      behavioral: behavioralScore,
      demographic: demographicScore
    }
  };
  
  // Cache the result
  riskScoreCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (riskScoreCache.size > 1000) {
    const firstKey = riskScoreCache.keys().next().value;
    riskScoreCache.delete(firstKey);
  }
  
  return result;
};

// Enhanced segment determination with more granular categories
export const determineEnhancedSegment = (riskScore: number): 'low-risk' | 'medium-risk' | 'high-risk' => {
  if (riskScore < 30) return 'low-risk';
  if (riskScore < 70) return 'medium-risk';
  return 'high-risk';
};

// Optimized data quality scoring with caching
const qualityScoreCache = new Map<string, number>();

export const calculateDataQualityScore = (customer: any): number => {
  const cacheKey = JSON.stringify(customer);
  
  if (qualityScoreCache.has(cacheKey)) {
    return qualityScoreCache.get(cacheKey)!;
  }
  
  let score = 0;
  
  // Core fields (weighted scoring)
  if (customer.customer_id || customer.customerId) score += 15;
  if (customer.email) score += 15;
  if (customer.last_purchase_date || customer.lastPurchaseDate) score += 15;
  if ((customer.purchase_count || customer.purchaseCount) !== undefined) score += 10;
  if ((customer.total_spent || customer.totalSpent) !== undefined) score += 10;
  if ((customer.avg_order_value || customer.avgOrderValue) !== undefined) score += 5;
  if (customer.age) score += 5;
  if (customer.gender) score += 5;
  if (customer.tenure) score += 5;
  if (customer.subscription_type || customer.subscriptionType) score += 5;
  if ((customer.support_calls || customer.supportCalls) !== undefined) score += 3;
  if ((customer.payment_delay || customer.paymentDelay) !== undefined) score += 3;
  if (customer.usage_frequency || customer.usageFrequency) score += 4;
  
  // Cache the result
  qualityScoreCache.set(cacheKey, score);
  
  // Limit cache size
  if (qualityScoreCache.size > 1000) {
    const firstKey = qualityScoreCache.keys().next().value;
    qualityScoreCache.delete(firstKey);
  }
  
  return score;
};
