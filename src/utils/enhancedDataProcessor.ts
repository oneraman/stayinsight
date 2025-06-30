
import * as XLSX from 'xlsx';
import { supabase, CustomerRecord } from '@/lib/supabase';
import { calculateEnhancedRiskScore, determineEnhancedSegment, calculateDataQualityScore } from './riskScoring';
import { validateFileData, CustomerRowData, findCustomerIdColumn, generateCustomerId } from './dataValidation';

export interface EnhancedProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  warnings: string[];
  sessionId?: string;
  duplicatesFound: number;
  dataQualityScore: number;
  riskDistribution: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  processingInsights: {
    averageRiskScore: number;
    totalValue: number;
    dataCompletenessScore: number;
  };
}

// Enhanced date parsing with better accuracy
const parseEnhancedDate = (dateStr: string | number): Date | null => {
  if (!dateStr) return null;
  
  try {
    if (typeof dateStr === 'number') {
      // Excel serial date with better validation
      if (dateStr > 25569 && dateStr < 73050) { // Valid range 1970-2099
        const excelEpoch = new Date(1900, 0, 1);
        const days = dateStr - 1;
        const result = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        return isNaN(result.getTime()) ? null : result;
      }
      return null;
    }
    
    if (typeof dateStr === 'string') {
      // Clean and normalize the date string
      const cleaned = dateStr.trim().replace(/[^\d\-\/\.\s:]/g, '');
      
      // Try multiple formats in order of preference
      const formats = [
        cleaned, // Original format
        cleaned.replace(/[-/\.]/g, '/'), // Normalize to forward slashes
        cleaned.split(' ')[0], // Remove time component if present
      ];
      
      for (const format of formats) {
        const parsed = new Date(format);
        if (!isNaN(parsed.getTime()) && 
            parsed.getFullYear() > 1900 && 
            parsed.getFullYear() < 2100 &&
            parsed <= new Date()) { // Don't allow future dates
          return parsed;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

// Enhanced number parsing with validation
const parseEnhancedNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,£€¥\s%]/g, '').replace(/[()]/g, '-');
    if (cleaned === '' || cleaned === '-') return undefined;
    
    const num = Number(cleaned);
    return isNaN(num) || !isFinite(num) ? undefined : Math.max(0, num);
  }
  
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? undefined : Math.max(0, num);
};

// Enhanced duplicate detection
const detectDuplicates = (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]): {
  count: number;
  details: Array<{ indices: number[]; reason: string; key: string }>;
} => {
  const seen = new Map<string, number[]>();
  const duplicates: Array<{ indices: number[]; reason: string; key: string }> = [];
  
  customers.forEach((customer, index) => {
    // Check by email
    if (customer.email) {
      const emailKey = `email:${customer.email.toLowerCase()}`;
      if (!seen.has(emailKey)) {
        seen.set(emailKey, []);
      }
      seen.get(emailKey)!.push(index);
    }
    
    // Check by customer_id
    if (customer.customer_id) {
      const idKey = `id:${customer.customer_id}`;
      if (!seen.has(idKey)) {
        seen.set(idKey, []);
      }
      seen.get(idKey)!.push(index);
    }
  });
  
  // Find duplicates
  seen.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicates.push({
        indices,
        reason: key.startsWith('email:') ? 'Duplicate email' : 'Duplicate customer ID',
        key
      });
    }
  });
  
  return {
    count: duplicates.reduce((sum, dup) => sum + dup.indices.length - 1, 0),
    details: duplicates
  };
};

export const processFileWithEnhancedAccuracy = async (
  file: File,
  userId: string,
  onProgress?: (progress: { phase: string; progress: number; message: string }) => void
): Promise<EnhancedProcessingResult> => {
  console.log('🚀 Starting enhanced accuracy processing for:', file.name);
  
  try {
    // Validate environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }
    
    // Read file with enhanced parsing
    onProgress?.({
      phase: 'parsing',
      progress: 10,
      message: 'Reading file with enhanced accuracy algorithms...'
    });

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array', 
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '',
      blankrows: false,
      header: 1
    });
    
    // Enhanced header detection
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1) as any[][];
    
    const data = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined && row[index] !== '') {
          obj[header] = row[index];
        }
      });
      return obj;
    }).filter(row => Object.keys(row).length > 0);
    
    console.log('📊 Enhanced parsing complete:', data.length, 'rows');

    onProgress?.({
      phase: 'processing',
      progress: 30,
      message: 'Processing customers with enhanced risk algorithms...'
    });

    const customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (i % 100 === 0) {
        onProgress?.({
          phase: 'processing',
          progress: 30 + (i / data.length) * 40,
          message: `Processing customer ${i + 1} of ${data.length} with enhanced accuracy...`
        });
      }
      
      try {
        // Enhanced customer ID detection
        const idColumn = findCustomerIdColumn(row);
        const customerId = idColumn ? String(row[idColumn]).trim() : generateCustomerId(row, i);
        
        if (!customerId) {
          warnings.push(`Row ${i + 1}: Could not generate customer ID`);
          continue;
        }
        
        // Enhanced data parsing
        const lastPurchaseDate = parseEnhancedDate(
          row.last_purchase_date || row.lastPurchaseDate || row['Last Purchase Date'] || row.last_order_date
        );
        const purchaseCount = parseEnhancedNumber(
          row.purchase_count || row.purchaseCount || row['Purchase Count'] || row.total_orders
        );
        const totalSpent = parseEnhancedNumber(
          row.total_spent || row.totalSpent || row['Total Spent'] || row.lifetime_value
        );
        
        // Calculate enhanced metrics
        const avgOrderValue = parseEnhancedNumber(row.avg_order_value) || 
                             (totalSpent && purchaseCount && purchaseCount > 0 ? totalSpent / purchaseCount : undefined);
        
        // Enhanced risk scoring
        const customerMetrics = {
          lastPurchaseDate: lastPurchaseDate?.toISOString() || null,
          purchaseCount: purchaseCount || 0,
          totalSpent: totalSpent || 0,
          avgOrderValue: avgOrderValue || 0,
          age: parseEnhancedNumber(row.age || row.Age),
          tenure: parseEnhancedNumber(row.tenure || row.Tenure),
          supportCalls: parseEnhancedNumber(row.support_calls || row['Support Calls']),
          paymentDelay: parseEnhancedNumber(row.payment_delay || row['Payment Delay']),
          usageFrequency: row.usage_frequency || row['Usage Frequency'],
          subscriptionType: row.subscription_type || row['Subscription Type']
        };
        
        const riskAnalysis = calculateEnhancedRiskScore(customerMetrics);
        
        const customerRecord: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'> = {
          customer_id: customerId,
          email: row.email || row.email_address || row.Email,
          name: row.name || row.customer_name || row['Customer Name'] || 
                `${row.first_name || ''} ${row.last_name || ''}`.trim() || undefined,
          last_purchase_date: lastPurchaseDate?.toISOString(),
          purchase_count: purchaseCount,
          total_spent: totalSpent,
          avg_order_value: avgOrderValue,
          risk_score: riskAnalysis.score,
          segment: determineEnhancedSegment(riskAnalysis.score),
          age: customerMetrics.age,
          gender: row.gender || row.Gender,
          tenure: customerMetrics.tenure,
          usage_frequency: customerMetrics.usageFrequency,
          support_calls: customerMetrics.supportCalls,
          payment_delay: customerMetrics.paymentDelay,
          subscription_type: customerMetrics.subscriptionType,
          user_id: userId
        };
        
        customers.push(customerRecord);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
      }
    }

    if (customers.length === 0) {
      throw new Error('No valid customer records found');
    }

    // Enhanced duplicate detection
    const duplicateAnalysis = detectDuplicates(customers);
    
    // Enhanced quality assessment
    const avgDataQuality = customers.reduce((sum, c) => sum + calculateDataQualityScore(c), 0) / customers.length;
    
    // Risk distribution analysis
    const riskDistribution = {
      highRisk: customers.filter(c => c.risk_score >= 70).length,
      mediumRisk: customers.filter(c => c.risk_score >= 30 && c.risk_score < 70).length,
      lowRisk: customers.filter(c => c.risk_score < 30).length
    };
    
    // Processing insights
    const processingInsights = {
      averageRiskScore: customers.reduce((sum, c) => sum + c.risk_score, 0) / customers.length,
      totalValue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
      dataCompletenessScore: avgDataQuality
    };

    onProgress?.({
      phase: 'storing',
      progress: 75,
      message: 'Storing enhanced data in database...'
    });

    // Store in database with batching
    const batchSize = 25;
    const batches = Math.ceil(customers.length / batchSize);
    let totalInserted = 0;

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, customers.length);
      const batchCustomers = customers.slice(startIndex, endIndex);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(batchCustomers)
          .select('id');
        
        if (error) {
          if (error.code === '23505') {
            warnings.push(`Batch ${batchIndex + 1}: Some customers already exist and were skipped`);
          } else {
            throw error;
          }
        } else {
          totalInserted += batchCustomers.length;
        }
        
        onProgress?.({
          phase: 'storing',
          progress: 75 + ((batchIndex + 1) / batches) * 20,
          message: `Stored batch ${batchIndex + 1} of ${batches}...`
        });
        
        // Small delay between batches
        if (batchIndex < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        errors.push(`Batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Insert error'}`);
      }
    }

    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: 'Enhanced processing complete!'
    });

    console.log('🎉 Enhanced processing completed successfully!');
    console.log(`📊 Results: ${totalInserted} customers, ${duplicateAnalysis.count} duplicates, ${avgDataQuality.toFixed(1)}% quality`);

    return {
      success: true,
      customersProcessed: totalInserted,
      errors,
      warnings,
      duplicatesFound: duplicateAnalysis.count,
      dataQualityScore: Math.round(avgDataQuality),
      riskDistribution,
      processingInsights
    };

  } catch (error) {
    console.error('💥 Enhanced processing failed:', error);
    throw new Error(`Enhanced processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
