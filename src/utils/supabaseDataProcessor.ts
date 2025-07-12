import * as XLSX from 'xlsx';
import { supabase, CustomerRecord } from '@/lib/supabase';
import { validateFileData, CustomerRowData, findCustomerIdColumn, generateCustomerId } from './dataValidation';

export interface ProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  warnings: string[];
  sessionId?: string;
  duplicatesFound: number;
  dataQualityScore: number;
}

export interface ProcessingProgress {
  phase: 'uploading' | 'processing' | 'storing';
  progress: number;
  message: string;
}

// Enhanced risk score calculation with more sophisticated algorithms
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
  let score = 35; // Default medium-low risk (more neutral)
  const now = new Date();
  
  // Recency factor (35% weight) - More sophisticated time-based scoring
  if (lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPurchase < 7) score -= 20;
    else if (daysSinceLastPurchase < 30) score -= 15;
    else if (daysSinceLastPurchase < 60) score -= 5;
    else if (daysSinceLastPurchase < 90) score += 5;
    else if (daysSinceLastPurchase < 180) score += 15;
    else if (daysSinceLastPurchase < 365) score += 25;
    else score += 35;
  } else {
    score += 15; // Reduced penalty for missing purchase history
  }
  
  // Frequency factor (30% weight) - Enhanced purchase behavior analysis
  if (purchaseCount !== undefined && purchaseCount !== null) {
    if (purchaseCount > 20) score -= 20;
    else if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount > 2) score -= 5;
    else if (purchaseCount === 1) score += 10;
    else if (purchaseCount === 0) score += 20;
  } else {
    score += 10; // Reduced penalty for missing purchase count
  }
  
  // Monetary factor (25% weight) - More nuanced spending analysis
  if (totalSpent !== undefined && totalSpent !== null) {
    if (totalSpent > 5000) score -= 20;
    else if (totalSpent > 2000) score -= 15;
    else if (totalSpent > 1000) score -= 10;
    else if (totalSpent > 500) score -= 5;
    else if (totalSpent > 100) score += 0;
    else if (totalSpent > 50) score += 10;
    else score += 20;
  } else {
    score += 10; // Reduced penalty for missing spending data
  }
  
  // Support interaction factor (5% weight)
  if (supportCalls !== undefined && supportCalls !== null) {
    if (supportCalls > 10) score += 15;
    else if (supportCalls > 5) score += 10;
    else if (supportCalls > 2) score += 5;
    else if (supportCalls === 0) score -= 2;
  }
  
  // Payment behavior factor (3% weight)
  if (paymentDelay !== undefined && paymentDelay !== null) {
    if (paymentDelay > 60) score += 20;
    else if (paymentDelay > 30) score += 15;
    else if (paymentDelay > 7) score += 10;
    else if (paymentDelay === 0) score -= 5;
  }
  
  // Usage frequency factor (2% weight)
  if (usageFrequency) {
    const freq = usageFrequency.toLowerCase();
    if (freq.includes('never') || freq.includes('rarely')) score += 15;
    else if (freq.includes('low') || freq.includes('infrequent')) score += 10;
    else if (freq.includes('medium') || freq.includes('moderate')) score += 0;
    else if (freq.includes('high') || freq.includes('frequent')) score -= 10;
    else if (freq.includes('daily') || freq.includes('very high')) score -= 15;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Enhanced segment determination with more granular categories
const determineSegment = (riskScore: number): 'low-risk' | 'medium-risk' | 'high-risk' => {
  if (riskScore < 35) return 'low-risk';
  if (riskScore < 65) return 'medium-risk';
  return 'high-risk';
};

// Enhanced date parsing with multiple format support
const parseDate = (dateStr: string | number): Date | null => {
  if (!dateStr) return null;
  
  try {
    if (typeof dateStr === 'number') {
      // Excel serial date
      if (dateStr > 25569) { // Valid Excel date range
        const excelEpoch = new Date(1900, 0, 1);
        const days = dateStr - 1;
        return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      }
      return null;
    }
    
    if (typeof dateStr === 'string') {
      // Try multiple date formats
      const formats = [
        dateStr, // ISO format
        dateStr.replace(/[-/]/g, '/'), // Normalize separators
        dateStr.replace(/\./g, '/'), // Handle dot separators
      ];
      
      for (const format of formats) {
        const parsed = new Date(format);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
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
const parseNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  
  // Handle string numbers with currency symbols or commas
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,\s]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? undefined : num;
  }
  
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// Enhanced string cleaning
const cleanString = (value: any): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const cleaned = String(value).trim();
  return cleaned === '' ? undefined : cleaned;
};

// Data quality assessment
const assessDataQuality = (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]): number => {
  if (customers.length === 0) return 0;
  
  let qualityScore = 0;
  const totalFields = customers.length * 8; // 8 key fields
  let filledFields = 0;
  
  customers.forEach(customer => {
    if (customer.customer_id) filledFields++;
    if (customer.email) filledFields++;
    if (customer.name) filledFields++;
    if (customer.last_purchase_date) filledFields++;
    if (customer.purchase_count !== undefined) filledFields++;
    if (customer.total_spent !== undefined) filledFields++;
    if (customer.risk_score !== undefined) filledFields++;
    if (customer.segment) filledFields++;
  });
  
  qualityScore = (filledFields / totalFields) * 100;
  return Math.round(qualityScore);
};

// Duplicate detection
const findDuplicates = (customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[]): number => {
  const seen = new Set<string>();
  let duplicates = 0;
  
  customers.forEach(customer => {
    const key = customer.email || customer.customer_id;
    if (key && seen.has(key)) {
      duplicates++;
    } else if (key) {
      seen.add(key);
    }
  });
  
  return duplicates;
};

// Get current authenticated user with enhanced error handling
const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error.message);
      throw new Error('Authentication failed. Please log in again.');
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

// Enhanced file processing with better accuracy
export const processFileWithSupabase = async (
  file: File,
  userId: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> => {
  console.log('🚀 Starting enhanced Supabase file processing for:', file.name);
  
  try {
    // Validate Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    
    // Authenticate user
    const currentUser = await getCurrentUser();
    console.log('✅ User authenticated:', currentUser.id);
    
    // Create upload session for tracking
    const { data: session, error: sessionError } = await supabase
      .from('upload_sessions')
      .insert({
        user_id: currentUser.id,
        file_name: file.name,
        file_size: file.size,
        total_rows: 0,
        processed_rows: 0,
        status: 'uploading'
      })
      .select()
      .single();
    
    if (sessionError) {
      console.warn('⚠️ Could not create upload session:', sessionError.message);
    }
    
    // Read and parse file with enhanced error handling
    onProgress?.({
      phase: 'uploading',
      progress: 15,
      message: 'Reading and parsing file data...'
    });

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array', 
      cellDates: true,
      cellNF: false,
      cellText: false
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '',
      blankrows: false
    }) as CustomerRowData[];
    
    console.log('📊 Parsed', data.length, 'rows from spreadsheet');

    // Update session with total rows
    if (session) {
      await supabase
        .from('upload_sessions')
        .update({ total_rows: data.length, status: 'processing' })
        .eq('id', session.id);
    }

    // Enhanced data validation
    onProgress?.({
      phase: 'processing',
      progress: 25,
      message: 'Validating and cleaning data...'
    });

    const validation = validateFileData(data);
    console.log('Enhanced validation result:', validation);

    if (data.length === 0) {
      throw new Error('No data found in the file');
    }

    // Process customer records with enhanced accuracy
    onProgress?.({
      phase: 'processing',
      progress: 35,
      message: 'Processing customer records with enhanced algorithms...'
    });

    const customers: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'>[] = [];
    const allErrors: string[] = [...validation.warnings];
    const allWarnings: string[] = [];
    
    // Process in optimized batches
    const batchSize = 250; // Smaller batches for better accuracy
    const totalBatches = Math.ceil(data.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, data.length);
      const batchData = data.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: rows ${startIndex + 1}-${endIndex}`);
      
      for (let i = 0; i < batchData.length; i++) {
        const row = batchData[i];
        const globalIndex = startIndex + i;
        
        // Update progress more frequently for better UX
        if (globalIndex % 50 === 0 || globalIndex === data.length - 1) {
          const progress = 35 + ((globalIndex / data.length) * 30);
          onProgress?.({
            phase: 'processing',
            progress,
            message: `Processing customer ${globalIndex + 1} of ${data.length} with enhanced accuracy...`
          });
        }
        
        try {
          // Enhanced customer ID handling
          const idColumn = findCustomerIdColumn(row);
          const customerId = idColumn ? String(row[idColumn]).trim() : generateCustomerId(row, globalIndex);
          
          if (!customerId) {
            allWarnings.push(`Row ${globalIndex + 1}: Could not generate customer ID`);
            continue;
          }
          
          // Enhanced data parsing with validation
          const lastPurchaseDate = parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date);
          const purchaseCount = parseNumber(row.purchase_count || row.purchaseCount || row.order_count);
          const totalSpent = parseNumber(row.total_spent || row.totalSpent || row.lifetime_value);
          const avgOrderValue = parseNumber(row.avg_order_value || row.avgOrderValue) || 
                               (totalSpent && purchaseCount && purchaseCount > 0 ? totalSpent / purchaseCount : undefined);
          
          // Enhanced demographic data parsing
          const age = parseNumber(row.Age || row.age);
          const tenure = parseNumber(row.Tenure || row.tenure);
          const supportCalls = parseNumber(row['Support Calls'] || row.support_calls);
          const paymentDelay = parseNumber(row['Payment Delay'] || row.payment_delay);
          
          // Data validation warnings
          if (lastPurchaseDate && lastPurchaseDate > new Date()) {
            allWarnings.push(`Row ${globalIndex + 1}: Future purchase date detected`);
          }
          
          if (totalSpent && totalSpent < 0) {
            allWarnings.push(`Row ${globalIndex + 1}: Negative total spent value`);
          }
          
          if (purchaseCount && purchaseCount < 0) {
            allWarnings.push(`Row ${globalIndex + 1}: Negative purchase count`);
          }
          
          // Enhanced risk score calculation
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
          
          // Enhanced name parsing
          let customerName = cleanString(row.name || row.customer_name || row.fullname);
          if (!customerName && (row.first_name || row.last_name)) {
            customerName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || undefined;
          }
          
          const customerRecord: Omit<CustomerRecord, 'id' | 'created_at' | 'updated_at'> = {
            customer_id: customerId,
            email: cleanString(row.email || row.email_address),
            name: customerName,
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
            user_id: currentUser.id
          };
          
          customers.push(customerRecord);
        } catch (error) {
          console.error(`❌ Error processing row ${globalIndex + 1}:`, error);
          allErrors.push(`Row ${globalIndex + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      }
    }

    console.log('✅ Enhanced processing complete:', customers.length, 'customers processed');

    if (customers.length === 0) {
      throw new Error('No valid customer records found in the file');
    }

    // Data quality assessment
    const dataQualityScore = assessDataQuality(customers);
    const duplicatesFound = findDuplicates(customers);
    
    console.log(`📊 Data quality score: ${dataQualityScore}%`);
    console.log(`🔍 Duplicates found: ${duplicatesFound}`);

    // Store in Supabase with enhanced error handling
    onProgress?.({
      phase: 'storing',
      progress: 70,
      message: 'Storing processed data in Supabase database...'
    });

    // Optimized batch insertion
    const insertBatchSize = 50; // Smaller batches for better reliability
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
          .insert(batchCustomers)
          .select('id');
        
        if (error) {
          console.error('Supabase insert error:', error);
          
          // Handle specific database errors
          if (error.code === '23505') { // Unique constraint violation
            allWarnings.push(`Batch ${batchIndex + 1}: Some customers already exist and were skipped`);
          } else {
            throw new Error(`Database insert failed: ${error.message}`);
          }
        } else {
          totalInserted += batchCustomers.length;
        }
        
        // Update session progress
        if (session) {
          await supabase
            .from('upload_sessions')
            .update({ processed_rows: totalInserted })
            .eq('id', session.id);
        }
        
        // Update progress
        const progress = 70 + ((batchIndex + 1) / insertBatches * 25);
        onProgress?.({
          phase: 'storing',
          progress,
          message: `Stored batch ${batchIndex + 1} of ${insertBatches} (${totalInserted} customers)...`
        });

        // Optimized delay between batches
        if (batchIndex < insertBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error(`❌ Error inserting batch ${batchIndex + 1}:`, error);
        allErrors.push(`Batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Insert error'}`);
        continue;
      }
    }

    // Update final session status
    if (session) {
      await supabase
        .from('upload_sessions')
        .update({ 
          status: totalInserted > 0 ? 'completed' : 'failed',
          processed_rows: totalInserted,
          error_message: allErrors.length > 0 ? allErrors.slice(0, 3).join('; ') : null
        })
        .eq('id', session.id);
    }

    onProgress?.({
      phase: 'storing',
      progress: 100,
      message: 'Enhanced processing complete!'
    });

    console.log('🎉 Enhanced Supabase processing completed successfully!');
    console.log(`📊 Final stats: ${totalInserted} inserted, ${duplicatesFound} duplicates, ${dataQualityScore}% quality`);

    return {
      success: true,
      customersProcessed: totalInserted,
      errors: allErrors,
      warnings: allWarnings,
      sessionId: session?.id,
      duplicatesFound,
      dataQualityScore
    };

  } catch (error) {
    console.error('💥 Error in enhanced Supabase processing:', error);
    
    // Enhanced error messages
    if (error instanceof Error) {
      if (error.message.includes('not configured') || error.message.includes('environment variables')) {
        throw new Error('Supabase configuration missing: Please create a .env file with your Supabase project URL and API key.');
      }
      
      if (error.message.includes('Authentication failed') || error.message.includes('not authenticated')) {
        throw new Error('Authentication required: Please log in to upload customer data.');
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      }
    }
    
    throw new Error(`Enhanced processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};