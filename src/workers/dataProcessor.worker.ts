
// Web worker for heavy data processing operations
import { calculateEnhancedRiskScore, determineEnhancedSegment, calculateDataQualityScore } from '../utils/riskScoring';

interface WorkerMessage {
  type: 'PROCESS_BATCH' | 'CALCULATE_RISK' | 'VALIDATE_DATA';
  data: any;
  batchIndex?: number;
}

self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, data, batchIndex } = e.data;
  
  try {
    switch (type) {
      case 'PROCESS_BATCH':
        const results = processBatch(data);
        self.postMessage({
          type: 'BATCH_COMPLETE',
          data: results,
          batchIndex
        });
        break;
        
      case 'CALCULATE_RISK':
        const riskAnalysis = calculateEnhancedRiskScore(data);
        self.postMessage({
          type: 'RISK_COMPLETE',
          data: riskAnalysis
        });
        break;
        
      case 'VALIDATE_DATA':
        const qualityScore = calculateDataQualityScore(data);
        self.postMessage({
          type: 'VALIDATION_COMPLETE',
          data: qualityScore
        });
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

function processBatch(customers: any[]): any[] {
  return customers.map(customer => {
    // Enhanced parsing with better performance
    const lastPurchaseDate = parseOptimizedDate(
      customer.last_purchase_date || customer.lastPurchaseDate || customer['Last Purchase Date']
    );
    
    const purchaseCount = parseOptimizedNumber(
      customer.purchase_count || customer.purchaseCount || customer['Purchase Count']
    );
    
    const totalSpent = parseOptimizedNumber(
      customer.total_spent || customer.totalSpent || customer['Total Spent']
    );
    
    const avgOrderValue = parseOptimizedNumber(customer.avg_order_value) || 
                         (totalSpent && purchaseCount && purchaseCount > 0 ? totalSpent / purchaseCount : 0);
    
    const customerMetrics = {
      lastPurchaseDate: lastPurchaseDate?.toISOString() || null,
      purchaseCount: purchaseCount || 0,
      totalSpent: totalSpent || 0,
      avgOrderValue: avgOrderValue || 0,
      age: parseOptimizedNumber(customer.age || customer.Age),
      tenure: parseOptimizedNumber(customer.tenure || customer.Tenure),
      supportCalls: parseOptimizedNumber(customer.support_calls || customer['Support Calls']),
      paymentDelay: parseOptimizedNumber(customer.payment_delay || customer['Payment Delay']),
      usageFrequency: customer.usage_frequency || customer['Usage Frequency'],
      subscriptionType: customer.subscription_type || customer['Subscription Type']
    };
    
    const riskAnalysis = calculateEnhancedRiskScore(customerMetrics);
    
    return {
      customer_id: generateOptimizedId(customer),
      email: customer.email || customer.email_address || customer.Email,
      name: customer.name || customer.customer_name || customer['Customer Name'] || 
            `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || undefined,
      last_purchase_date: lastPurchaseDate?.toISOString(),
      purchase_count: purchaseCount,
      total_spent: totalSpent,
      avg_order_value: avgOrderValue,
      risk_score: riskAnalysis.score,
      segment: determineEnhancedSegment(riskAnalysis.score),
      age: customerMetrics.age,
      gender: customer.gender || customer.Gender,
      tenure: customerMetrics.tenure,
      usage_frequency: customerMetrics.usageFrequency,
      support_calls: customerMetrics.supportCalls,
      payment_delay: customerMetrics.paymentDelay,
      subscription_type: customerMetrics.subscriptionType
    };
  });
}

// Optimized parsing functions with caching
const dateCache = new Map<string, Date | null>();
const numberCache = new Map<string, number | undefined>();

function parseOptimizedDate(dateStr: string | number): Date | null {
  if (!dateStr) return null;
  
  const key = String(dateStr);
  if (dateCache.has(key)) {
    return dateCache.get(key)!;
  }
  
  let result: Date | null = null;
  
  try {
    if (typeof dateStr === 'number') {
      if (dateStr > 25569 && dateStr < 73050) {
        const excelEpoch = new Date(1900, 0, 1);
        result = new Date(excelEpoch.getTime() + (dateStr - 1) * 24 * 60 * 60 * 1000);
      }
    } else if (typeof dateStr === 'string') {
      const cleaned = dateStr.trim().replace(/[^\d\-\/\.\s:]/g, '');
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
        result = parsed;
      }
    }
  } catch {
    result = null;
  }
  
  dateCache.set(key, result);
  return result;
}

function parseOptimizedNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  const key = String(value);
  if (numberCache.has(key)) {
    return numberCache.get(key)!;
  }
  
  let result: number | undefined = undefined;
  
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,£€¥\s%]/g, '').replace(/[()]/g, '-');
    if (cleaned !== '' && cleaned !== '-') {
      const num = Number(cleaned);
      if (!isNaN(num) && isFinite(num)) {
        result = Math.max(0, num);
      }
    }
  } else {
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      result = Math.max(0, num);
    }
  }
  
  numberCache.set(key, result);
  return result;
}

function generateOptimizedId(row: any): string {
  const idFields = ['customer_id', 'customerId', 'id', 'CustomerID', 'customerid'];
  
  for (const field of idFields) {
    if (row[field] && String(row[field]).trim() !== '') {
      return String(row[field]).trim();
    }
  }
  
  const email = row.email || row.email_address;
  if (email && typeof email === 'string' && email.includes('@')) {
    return `email_${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
  }
  
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
