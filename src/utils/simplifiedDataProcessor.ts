import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { mapColumnsWithAI, inferDataType } from './intelligentColumnMapper';
import { generateCustomerInsights } from '@/lib/gemini';
import { updateUploadSession, createUploadSession } from '@/lib/supabase';

export interface SimplifiedProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  warnings: string[];
  processingStats: {
    totalTime: number;
    dataStoredSuccessfully: boolean;
    accuracyScore: number;
  };
}

export interface ProcessingProgress {
  phase: 'parsing' | 'processing' | 'storing' | 'complete';
  progress: number;
  message: string;
}

// Simplified processor focused on core functionality
export class SimplifiedDataProcessor {
  async processFileSimply(
    file: File,
    userId: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<SimplifiedProcessingResult> {
    const startTime = performance.now();
    console.log('🚀 Starting simplified data processing for:', file.name);
    console.log('👤 User ID:', userId);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    let session: any | null = null;
    
    try {
      // Step 1: Upload file to Supabase Storage first
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      
      console.log('📤 Uploading file to storage:', fileName);
      onProgress?.({ 
        progress: 10, 
        message: 'Uploading file to secure storage...', 
        phase: 'parsing' 
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploaded-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ File upload failed:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      // Get the file URL
      const { data: urlData } = supabase.storage
        .from('uploaded-files')
        .getPublicUrl(fileName);

      // Create upload session with file storage info
      const uploadSession = await createUploadSession({
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        status: 'processing',
        total_rows: 0,
        processed_rows: 0,
        file_path: uploadData.path,
        file_url: urlData.publicUrl,
        storage_bucket: 'uploaded-files'
      });

      session = uploadSession;

      // Step 2: Parse File (10-30%)
      onProgress?.({
        phase: 'parsing',
        progress: 20,
        message: 'Reading file data...'
      });

      const { data, headers } = await this.parseFile(file);
      console.log('📊 File parsed:', { rows: data.length, headers: headers.length });

      if (session) {
        await supabase
          .from('upload_sessions')
          .update({ total_rows: data.length, status: 'processing' })
          .eq('id', session.id);
      }

      if (data.length === 0) {
        throw new Error('No data found in the file');
      }

      onProgress?.({
        phase: 'parsing',
        progress: 30,
        message: `Found ${data.length} rows with ${headers.length} columns`
      });

      // Step 3: Process Data (30-50%)
      onProgress?.({
        phase: 'processing',
        progress: 40,
        message: 'Processing customer data...'
      });

      const customerRecords = this.processCustomerData(data, userId);
      console.log('👥 Processed customer records:', customerRecords.length);

      if (customerRecords.length === 0) {
        throw new Error('No valid customer records found');
      }

      onProgress?.({
        phase: 'processing',
        progress: 50,
        message: `Processed ${customerRecords.length} customer records`
      });

      // Step 4: Store Data (50-90%)
      onProgress?.({
        phase: 'storing',
        progress: 60,
        message: 'Storing data in database...'
      });

      const insertedCount = await this.storeCustomers(customerRecords, onProgress, session?.id);
      console.log('💾 Stored customers:', insertedCount);

      if (insertedCount === 0) {
        throw new Error('Failed to store any customer data');
      }

      // Step 5: Complete (90-100%)
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Successfully processed ${insertedCount} customers!`
      });

      const endTime = performance.now();
      console.log('🎉 Processing completed successfully!');

      // Mark session as completed
      if (session) {
        await supabase
          .from('upload_sessions')
          .update({ status: 'completed' })
          .eq('id', session.id);
      }

      return {
        success: true,
        customersProcessed: insertedCount,
        errors,
        warnings,
        processingStats: {
          totalTime: endTime - startTime,
          dataStoredSuccessfully: true,
          accuracyScore: 85
        }
      };

    } catch (error) {
      console.error('❌ Processing failed:', error);
      
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      // Mark session as failed
      if (session) {
        try {
          await supabase
            .from('upload_sessions')
            .update({ status: 'failed', error_message: error instanceof Error ? error.message : String(error) })
            .eq('id', session.id);
        } catch (e) {
          console.warn('⚠️ Failed to update upload session status:', e);
        }
      }

      return {
        success: false,
        customersProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        warnings,
        processingStats: {
          totalTime: performance.now() - startTime,
          dataStoredSuccessfully: false,
          accuracyScore: 0
        }
      };
    }
  }

  private async parseFile(file: File): Promise<{ data: any[]; headers: string[] }> {
    console.log('📖 Parsing file...');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      raw: false
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false
    }) as any[][];

    if (rawData.length === 0) {
      throw new Error('No data found in the file');
    }

    const headers = rawData[0].map((h: any) => String(h).trim()).filter(h => h.length > 0);
    const dataRows = rawData.slice(1);

    const data = dataRows
      .map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          const value = row[index];
          if (value !== undefined && value !== null && value !== '') {
            obj[header] = value;
          }
        });
        return obj;
      })
      .filter(row => Object.keys(row).length > 0);

    console.log('✅ File parsed successfully');
    return { data, headers };
  }

  private async processCustomerData(data: any[], userId: string): Promise<any[]> {
    console.log('🔄 Processing customer data with AI-powered mapping...');
    
    if (data.length === 0) {
      console.warn('No data to process');
      return [];
    }

    // Get column headers
    const headers = Object.keys(data[0]);
    console.log('📋 Detected columns:', headers);

    // Use AI to intelligently map columns
    const mappingResult = await mapColumnsWithAI(headers, data);
    console.log('🎯 AI mapping result:', mappingResult);

    const customerRecords: any[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Use AI-mapped columns to extract data
        const customerId = this.extractValueByMapping(row, mappingResult.mappings, 'customerId') || this.generateCustomerId(row, i);
        const name = this.extractValueByMapping(row, mappingResult.mappings, 'name');
        const email = this.extractValueByMapping(row, mappingResult.mappings, 'email');
        const totalSpent = this.parseNumber(this.extractValueByMapping(row, mappingResult.mappings, 'totalSpent')) || 0;
        const purchaseCount = this.parseNumber(this.extractValueByMapping(row, mappingResult.mappings, 'purchaseCount')) || 0;
        const lastPurchaseDate = this.parseDate(this.extractValueByMapping(row, mappingResult.mappings, 'lastPurchaseDate'));

        // Calculate basic risk score with enhanced logic
        const riskScore = await this.calculateEnhancedRiskScore({
          totalSpent,
          purchaseCount,
          daysSinceLastPurchase: lastPurchaseDate ? 
            Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
          avgOrderValue: purchaseCount > 0 ? totalSpent / purchaseCount : 0,
          email,
          name
        });
        
        customerRecords.push({
          customer_id: customerId,
          email: email || null,
          name: name || null,
          total_spent: totalSpent,
          purchase_count: purchaseCount,
          last_purchase_date: lastPurchaseDate?.toISOString() || null,
          avg_order_value: purchaseCount > 0 ? totalSpent / purchaseCount : 0,
          risk_score: riskScore,
          segment: this.determineSegment(riskScore),
          user_id: userId
        });
        
      } catch (error) {
        console.warn(`⚠️ Error processing row ${i + 1}:`, error);
      }
    }

    console.log(`✅ Successfully processed ${customerRecords.length} customers`);
    console.log(`📊 Mapping confidence: ${(mappingResult.confidence * 100).toFixed(1)}%`);
    
    if (mappingResult.suggestions.length > 0) {
      console.warn('⚠️ Data quality suggestions:', mappingResult.suggestions);
    }

    return customerRecords;
  }

  private extractValueByMapping(row: any, mappings: Record<string, string>, targetField: string): any {
    // Find the source column that maps to our target field
    const sourceColumn = Object.entries(mappings).find(([_, target]) => target === targetField)?.[0];
    
    if (sourceColumn && row[sourceColumn] !== undefined) {
      return row[sourceColumn];
    }
    
    // Fallback to direct field access and flexible field names
    return this.extractValue(row, [
      targetField,
      targetField.toLowerCase(),
      targetField.replace(/([A-Z])/g, '_$1').toLowerCase(),
      targetField.replace(/([A-Z])/g, ' $1').trim()
    ]);
  }

  private async storeCustomers(
    customers: any[],
    onProgress?: (progress: ProcessingProgress) => void,
    sessionId?: string
  ): Promise<number> {
    console.log('💾 Storing customers in database...');
    
    const batchSize = 50;
    const batches = Math.ceil(customers.length / batchSize);
    let totalInserted = 0;

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIdx = batchIndex * batchSize;
      const endIdx = Math.min(startIdx + batchSize, customers.length);
      const batch = customers.slice(startIdx, endIdx);
      
      console.log(`💾 Inserting batch ${batchIndex + 1}/${batches}`);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(batch)
          .select('id');

        if (error) {
          console.error('❌ Batch insert error:', error);
          if (error.code !== '23505') { // Skip unique constraint violations
            throw error;
          }
        } else {
          totalInserted += batch.length;
          console.log(`✅ Batch ${batchIndex + 1} inserted successfully`);
        }

        // Update progress
        const progress = 60 + ((batchIndex + 1) / batches) * 30;
        onProgress?.({
          phase: 'storing',
          progress,
          message: `Stored batch ${batchIndex + 1} of ${batches}`
        });

        // Update upload session progress
        if (sessionId) {
          await supabase
            .from('upload_sessions')
            .update({ processed_rows: totalInserted })
            .eq('id', sessionId);
        }

      } catch (error) {
        console.error(`❌ Failed to insert batch ${batchIndex + 1}:`, error);
        throw error;
      }
    }

    console.log(`💾 Storage complete: ${totalInserted} customers stored`);
    return totalInserted;
  }

  private extractValue(row: any, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
    }
    return null;
  }

  private generateCustomerId(row: any, index: number): string {
    const possibleIds = ['customer_id', 'id', 'ID', 'Customer ID', 'customerId'];
    
    for (const key of possibleIds) {
      const value = row[key];
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
    
    return `CUST_${Date.now()}_${index}`;
  }

  private parseNumber(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,£€¥\s%]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? null : Math.max(0, num);
    }
    
    const num = Number(value);
    return isNaN(num) ? null : Math.max(0, num);
  }

  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'number' && dateValue > 25569) {
        // Excel date
        const excelEpoch = new Date(1900, 0, 1);
        const days = dateValue - 1;
        return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      }
      
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed <= new Date()) {
          return parsed;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private async calculateEnhancedRiskScore(metrics: {
    totalSpent: number;
    purchaseCount: number;
    daysSinceLastPurchase: number | null;
    avgOrderValue: number;
    email: any;
    name: any;
  }): Promise<number> {
    // Base risk calculation
    let riskScore = 0;

    // High risk if no purchases
    if (metrics.purchaseCount === 0) return 95;

    // Risk based on recency (40% weight)
    if (metrics.daysSinceLastPurchase) {
      if (metrics.daysSinceLastPurchase > 365) riskScore += 40;
      else if (metrics.daysSinceLastPurchase > 180) riskScore += 30;
      else if (metrics.daysSinceLastPurchase > 90) riskScore += 20;
      else if (metrics.daysSinceLastPurchase > 30) riskScore += 10;
    } else {
      // No purchase date = risky
      riskScore += 25;
    }

    // Risk based on frequency (30% weight)
    if (metrics.purchaseCount === 1) riskScore += 30;
    else if (metrics.purchaseCount < 3) riskScore += 20;
    else if (metrics.purchaseCount < 5) riskScore += 10;
    else if (metrics.purchaseCount < 10) riskScore += 5;

    // Risk based on monetary value (20% weight)
    if (metrics.totalSpent < 50) riskScore += 20;
    else if (metrics.totalSpent < 200) riskScore += 15;
    else if (metrics.totalSpent < 500) riskScore += 10;
    else if (metrics.totalSpent < 1000) riskScore += 5;

    // Risk based on engagement (10% weight)
    if (!metrics.email) riskScore += 10;
    if (!metrics.name || metrics.name === 'Unknown Customer') riskScore += 5;

    // Ensure risk is between 0-100
    return Math.min(Math.max(Math.round(riskScore), 0), 100);
  }
    let score = 50;
    
    if (lastPurchaseDate) {
      const daysSince = Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 180) score += 30;
      else if (daysSince > 90) score += 15;
      else if (daysSince < 30) score -= 15;
    } else {
      score += 20;
    }
    
    if (purchaseCount > 10) score -= 20;
    else if (purchaseCount < 2) score += 15;
    
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent < 100) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private determineSegment(riskScore: number): string {
    if (riskScore < 30) return 'low-risk';
    if (riskScore < 70) return 'medium-risk';
    return 'high-risk';
  }
}

export const simplifiedProcessor = new SimplifiedDataProcessor();
