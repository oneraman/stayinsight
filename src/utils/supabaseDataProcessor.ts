import * as XLSX from 'xlsx';
import { supabase, CustomerRecord } from '@/lib/supabase';
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

// Clean string values
const cleanString = (value: any): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value).trim() || undefined;
};

// Get current authenticated user with better error handling
const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error.message);
      throw new Error('Auth session missing!');
    }
    
    if (!user) {
      console.log('ℹ️ No authenticated user found');
      throw new Error('User not authenticated. Please log in to upload customer data.');
    }
    
    console.log('✅ Current user retrieved:', user.id);
    return user;
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
    throw error;
  }
};

// Process file and store in Supabase
export const processFileWithSupabase = async (
  file: File,
  userId: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> => {
  console.log('🚀 Starting Supabase file processing for:', file.name);
  
  try {
    // Check if Supabase is configured first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    
    // Get current authenticated user to ensure we have proper authentication
    const currentUser = await getCurrentUser();
    console.log('✅ User authenticated:', currentUser.id);
    
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

    // Validate data
    onProgress?.({
      phase: 'processing',
      progress: 25,
      message: 'Validating data...'
    });

    const validation = validateFileData(data);
    console.log('Validation result:', validation);

    if (data.length === 0) {
      throw new Error('No data found in the file');
    }

    // Process customer records
    onProgress?.({
      phase: 'processing',
      progress: 35,
      message: 'Processing customer records...'
    });

    const customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[] = [];
    const allErrors: string[] = [...validation.warnings];
    
    // Process in smaller batches for better performance
    const batchSize = 500;
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
        if (globalIndex % 100 === 0 || globalIndex === data.length - 1) {
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
            cleanString(row['Usage Frequency'] || row.usage_frequency)
          );
          
          const customerRecord: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'> = {
            customer_id: customerId,
            email: cleanString(row.email || row.email_address),
            name: cleanString(row.name || row.customer_name || row.fullname || 
                  `${row.first_name || ''} ${row.last_name || ''}`.trim()),
            last_purchase_date: lastPurchaseDate?.toISOString(),
            purchase_count: purchaseCount,
            total_spent: totalSpent,
            avg_order_value: avgOrderValue,
            risk_score: riskScore,
            segment: determineSegment(riskScore),
            age,
            gender: cleanString(row.Gender || row.gender),
            tenure,
            usage_frequency: cleanString(row['Usage Frequency'] || row.usage_frequency),
            support_calls: supportCalls,
            payment_delay: paymentDelay,
            subscription_type: cleanString(row['Subscription Type'] || row.subscription_type),
            user_id: currentUser.id // Associate customer with authenticated user
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
      message: 'Storing customer data in Supabase...'
    });

    // Insert customers in smaller batches to avoid timeout
    const insertBatchSize = 100; // Reduced batch size for better reliability
    const insertBatches = Math.ceil(customers.length / insertBatchSize);
    let totalInserted = 0;

    for (let batchIndex = 0; batchIndex < insertBatches; batchIndex++) {
      const startIndex = batchIndex * insertBatchSize;
      const endIndex = Math.min(startIndex + insertBatchSize, customers.length);
      const batchCustomers = customers.slice(startIndex, endIndex);
      
      console.log(`Inserting batch ${batchIndex + 1}/${insertBatches}: customers ${startIndex + 1}-${endIndex}`);
      
      try {
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

        // Small delay between batches to avoid overwhelming the database
        if (batchIndex < insertBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Error inserting batch ${batchIndex + 1}:`, error);
        allErrors.push(`Batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Insert error'}`);
        
        // Continue with next batch instead of failing completely
        continue;
      }
    }

    onProgress?.({
      phase: 'storing',
      progress: 100,
      message: 'Processing complete!'
    });

    console.log('🎉 Supabase processing completed successfully!');

    return {
      success: true,
      customersProcessed: totalInserted,
      errors: allErrors
    };

  } catch (error) {
    console.error('💥 Error in Supabase processing:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('not configured') || error.message.includes('environment variables')) {
        throw new Error('Supabase configuration missing: Please create a .env file with your Supabase project URL and API key.');
      }
      
      if (error.message.includes('Auth session missing') || error.message.includes('not authenticated')) {
        throw new Error('User not authenticated. Please log in to upload customer data. Authentication is required to process files.');
      }
    }
    
    throw new Error(`Failed to process customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};