/**
 * Additional methods for RobustDataProcessor
 * Extracted to keep main file focused
 */
import { SmartDataExtractor } from './smartDataExtractor';
import { calculateEnhancedRiskScore, determineEnhancedSegment } from './riskScoring';

/**
 * Process customer data using smart extraction
 */
export const processCustomerDataWithSmartExtraction = async (
  data: any[],
  mappings: any[],
  userId: string
): Promise<any[]> => {
  console.log('🧠 Processing customer data with smart extraction...');
  console.log('🔗 Mappings available:', mappings.length);
  
  const customerRecords: any[] = [];
  let qualityScoreSum = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      // Use smart extractor
      const record = SmartDataExtractor.extractCustomerRecord(row, mappings, userId, i);
      
      // Calculate enhanced risk score
      const { score: riskScore, factors } = calculateEnhancedRiskScore({
        lastPurchaseDate: record.last_purchase_date,
        purchaseCount: record.purchase_count || 0,
        totalSpent: record.total_spent || 0,
        avgOrderValue: record.avg_order_value || 0,
        age: record.age,
        tenure: record.tenure,
        supportCalls: record.support_calls,
        paymentDelay: record.payment_delay,
        usageFrequency: record.usage_frequency,
        subscriptionType: record.subscription_type
      });
      
      record.risk_score = riskScore;
      record.segment = determineEnhancedSegment(riskScore);
      
      // Calculate data quality
      const qualityScore = SmartDataExtractor.calculateQualityScore(record);
      qualityScoreSum += qualityScore;
      
      customerRecords.push(record);
      
      if ((i + 1) % 100 === 0) {
        console.log(`🧠 Processed ${i + 1}/${data.length} rows (avg quality: ${(qualityScoreSum / (i + 1)).toFixed(1)}%)`);
      }
    } catch (error) {
      console.warn(`⚠️ Error processing row ${i + 1}:`, error);
    }
  }
  
  const avgQuality = customerRecords.length > 0 ? qualityScoreSum / customerRecords.length : 0;
  console.log(`✅ Smart extraction complete: ${customerRecords.length} records (avg quality: ${avgQuality.toFixed(1)}%)`);
  
  return customerRecords;
};
