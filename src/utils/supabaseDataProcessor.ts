import * as XLSX from 'xlsx';
import { supabase, CustomerRecord, createUploadSession, updateUploadSession } from '@/lib/supabase';
import { validateFileData, CustomerRowData, findCustomerIdColumn, generateCustomerId } from './dataValidation';

export interface ProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  sessionId?: string;
}

export interface ProcessingProgress {
  phase: 'uploading' | 'processing' | 'storing';
  progress: number;
  message: string;
}

// Calculate enhanced risk score based on multiple factors
const calculateRiskScore = (
  lastPurchaseDate: Date | null,
  purchaseCount: number | undefined,
  totalSpent: number | undefined,
  age?: number,
  tenure?: number,
  supportCalls?: number,
  paymentDelay?: number,
  usageFrequency?: string
): number => {
  let score = 50; // Default medium risk
  const now = new Date();
  
  // Recency factor (30% weight)
  if (lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastPurchase < 30) score -= 15;
    else if (daysSinceLastPurchase < 90) score -= 5;
    else if (daysSinceLastPurchase > 180) score += 20;
    else if (daysSinceLastPurchase > 365) score += 30;
  } else {
    score += 20;
  }
  
  // Frequency factor (25% weight)
  if (purchaseCount !== undefined && purchaseCount !== null) {
    if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount > 2) score -= 5;
    else if (purchaseCount < 2) score += 15;
  } else {
    score += 10;
  }
  
  // Monetary factor (25% weight)
  if (totalSpent !== undefined && totalSpent !== null) {
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent > 500) score -= 10;
    else if (totalSpent > 100) score -= 5;
    else if (totalSpent < 50) score += 15;
  } else {
    score += 10;
  }
  
  // Support calls factor (10% weight)
  if (supportCalls !== undefined && supportCalls !== null) {
    if (supportCalls > 5) score += 10;
    else if (supportCalls > 2) score += 5;
    else if (supportCalls === 0) score -= 5;
  }
  
  // Payment delay factor (5% weight)
  if (paymentDelay !== undefined && paymentDelay !== null) {
    if (paymentDelay > 30) score += 15;
    else if (paymentDelay > 7) score += 10;
    else if (paymentDelay === 0) score -= 5;
  }
  
  // Usage frequency factor (5% weight)
  if (usageFrequency) {
    const freq = usageFrequency.toLowerCase();
    if (freq.includes('low') || freq.includes('rarely')) score += 10;
    else if (freq.includes('high') || freq.includes('frequent')) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

// Determine customer segment based on risk score
const determineSegment = (riskScore: number): 'low-risk' | 'medium-risk' | 'high-risk' => {
  if (riskScore < 30) return 'low-risk';
  if (riskScore < 70) return 'medium-risk';
  return 'high-risk';
};

// Enhanced date parsing
const parseDate = (dateStr: string | number): Date | null => {
  if (!dateStr) return null;
  
  try {
    if (typeof dateStr === 'number') {
      // Excel serial date
      const excelEpoch = new Date(1900, 0, 1);
      const days = dateStr - 1;
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    }
    
    if (typeof dateStr === 'string') {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  } catch {
    return null;
  }
};

// Safe number parsing
const parseNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// Process file and store in Supabase
export const processFileWithSupabase = async (
  file: File,
  userId: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> => {
  console.log('🚀 Starting Supabase file processing for:', file.name);
  
  let sessionId: string | undefined;
  
  try {
    // Create upload session
    onProgress?.({
      phase: 'uploading',
      progress: 5,
      message: 'Creating upload session...'
    });

    const session = await createUploadSession({
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      total_rows: 0,
      processed_rows: 0,
      status: 'uploading'
    });
    
    sessionId = session.id;
    console.log('✅ Upload session created:', sessionId);

    // Read and parse file
    onProgress?.({
      phase: 'uploading',
      progress: 15,
      message: 'Reading file data...'
    });

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as CustomerRowData[];
    
    console.log('📊 Parsed', data.length, 'rows from spreadsheet');

    // Update session with total rows
    await updateUploadSession(sessionId, {
      total_rows: data.length,
      status: 'processing'
    });

    // Validate data
    onProgress?.({
      phase: 'processing',
      progress: 25,
      message: 'Validating data...'
    });

    const validation = validateFileData(data);
    console.log('Validation result:', validation);

    if (!validation.isValid && data.length === 0) {
      throw new Error('No valid data found in the file');
    }

    // Process customer records
    onProgress?.({
      phase: 'processing',
      progress: 35,
      message: 'Processing customer records...'
    });

    const customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[] = [];
    const allErrors: string[] = [...validation.warnings];
    
    // Process in batches for better performance
    const batchSize = 1000;
    const totalBatches = Math.ceil(data.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, data.length);
      const batchData = data.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: rows ${startIndex + 1}-${endIndex}`);
      
      for (let i = 0; i < batchData.length; i++) {
        const row = batchData[i];
        const globalIndex = startIndex + i;
        
        // Update progress
        if (globalIndex % 500 === 0 || globalIndex === data.length - 1) {
          const progress = 35 + ((globalIndex / data.length) * 30);
          onProgress?.({
            phase: 'processing',
            progress,
            message: `Processing customer ${globalIndex + 1} of ${data.length}...`
          });
        }
        
        try {
          // Get or generate customer ID
          const idColumn = findCustomerIdColumn(row);
          const customerId = idColumn ? String(row[idColumn]) : generateCustomerId(row, globalIndex);
          
          // Parse dates and numbers safely
          const lastPurchaseDate = parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date);
          const purchaseCount = parseNumber(row.purchase_count || row.purchaseCount || row.order_count);
          const totalSpent = parseNumber(row.total_spent || row.totalSpent || row.lifetime_value);
          const avgOrderValue = parseNumber(row.avg_order_value || row.avgOrderValue);
          const age = parseNumber(row.Age);
          const tenure = parseNumber(row.Tenure);
          const supportCalls = parseNumber(row['Support Calls']);
          const paymentDelay = parseNumber(row['Payment Delay']);
          
          // Calculate risk score
          const riskScore = calculateRiskScore(
            lastPurchaseDate,
            purchaseCount,
            totalSpent,
            age,
            tenure,
            supportCalls,
            paymentDelay,
            row['Usage Frequency'] || row.usage_frequency
          );
          
          const customerRecord: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'> = {
            customer_id: customerId,
            email: row.email || row.email_address || undefined,
            name: row.name || row.customer_name || row.fullname || 
                  `${row.first_name || ''} ${row.last_name || ''}`.trim() || undefined,
            last_purchase_date: lastPurchaseDate?.toISOString(),
            purchase_count: purchaseCount,
            total_spent: totalSpent,
            avg_order_value: avgOrderValue,
            risk_score: riskScore,
            segment: determineSegment(riskScore),
            age,
            gender: row.Gender || row.gender,
            tenure,
            usage_frequency: row['Usage Frequency'] || row.usage_frequency,
            support_calls: supportCalls,
            payment_delay: paymentDelay,
            subscription_type: row['Subscription Type'] || row.subscription_type
          };
          
          customers.push(customerRecord);
        } catch (error) {
          console.error(`❌ Error processing row ${globalIndex + 1}:`, error);
          allErrors.push(`Row ${globalIndex + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      }
    }

    console.log('✅ Processing complete:', customers.length, 'customers processed');

    if (customers.length === 0) {
      throw new Error('No valid customer records found in the file');
    }

    // Store in Supabase
    onProgress?.({
      phase: 'storing',
      progress: 70,
      message: 'Storing customer data in database...'
    });

    // Insert customers in batches to avoid timeout
    const insertBatchSize = 500;
    const insertBatches = Math.ceil(customers.length / insertBatchSize);
    let totalInserted = 0;

    for (let batchIndex = 0; batchIndex < insertBatches; batchIndex++) {
      const startIndex = batchIndex * insertBatchSize;
      const endIndex = Math.min(startIndex + insertBatchSize, customers.length);
      const batchCustomers = customers.slice(startIndex, endIndex);
      
      console.log(`Inserting batch ${batchIndex + 1}/${insertBatches}: customers ${startIndex + 1}-${endIndex}`);
      
      const { data, error } = await supabase
        .from('customers')
        .insert(batchCustomers);
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database insert failed: ${error.message}`);
      }
      
      totalInserted += batchCustomers.length;
      
      // Update progress
      const progress = 70 + ((batchIndex + 1) / insertBatches * 25);
      onProgress?.({
        phase: 'storing',
        progress,
        message: `Stored batch ${batchIndex + 1} of ${insertBatches}...`
      });

      // Update session progress
      await updateUploadSession(sessionId, {
        processed_rows: totalInserted
      });
    }

    // Complete the session
    await updateUploadSession(sessionId, {
      status: 'completed',
      processed_rows: totalInserted
    });

    onProgress?.({
      phase: 'storing',
      progress: 100,
      message: 'Processing complete!'
    });

    console.log('🎉 Supabase processing completed successfully!');

    return {
      success: true,
      customersProcessed: totalInserted,
      errors: allErrors,
      sessionId
    };

  } catch (error) {
    console.error('💥 Error in Supabase processing:', error);
    
    // Update session with error
    if (sessionId) {
      await updateUploadSession(sessionId, {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    throw new Error(`Failed to process customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};