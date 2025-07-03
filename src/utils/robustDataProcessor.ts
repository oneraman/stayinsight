
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { mapColumnsIntelligently } from './advancedColumnMapper';

export interface RobustProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  warnings: string[];
  processingStats: {
    totalTime: number;
    accuracyScore: number;
    confidenceLevel: number;
    dataStoredSuccessfully: boolean;
    aiInsightsGenerated: boolean;
  };
  columnMapping?: any;
  qualityReport?: any;
  aiInsights?: any;
}

export interface ProcessingProgress {
  phase: 'parsing' | 'processing' | 'storing' | 'complete';
  progress: number;
  message: string;
}

export class RobustDataProcessor {
  private timeouts = {
    aiInsights: 30000, // 30 seconds max for AI insights
    databaseOperation: 10000 // 10 seconds max for DB operations
  };

  async processFileWithRobustHandling(
    file: File,
    userId: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<RobustProcessingResult> {
    const startTime = performance.now();
    
    console.log('🔧 Starting robust data processing for:', file.name);
    console.log('👤 User ID received:', userId);
    console.log('🆔 User ID type:', typeof userId);
    console.log('🔍 User ID validation:', this.isValidUUID(userId));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!userId || !this.isValidUUID(userId)) {
      const error = `Invalid user ID: ${userId}`;
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      // Phase 1: Parse File (0-20%)
      onProgress?.({
        phase: 'parsing',
        progress: 5,
        message: 'Reading and parsing file data...'
      });

      const { data, headers } = await this.parseFileWithLogging(file);
      console.log('✅ File parsed successfully:', { rows: data.length, headers: headers.length });

      onProgress?.({
        phase: 'parsing',
        progress: 15,
        message: `Parsed ${data.length} rows with ${headers.length} columns`
      });

      // Phase 2: Column Mapping (20-30%)
      onProgress?.({
        phase: 'processing',
        progress: 20,
        message: 'Mapping columns with intelligent detection...'
      });

      const columnMapping = mapColumnsIntelligently(headers);
      console.log('🗺️ Column mapping result:', columnMapping);

      // Phase 3: Data Processing (30-50%)
      onProgress?.({
        phase: 'processing',
        progress: 35,
        message: 'Processing and validating customer data...'
      });

      const customerRecords = await this.processCustomerData(data, columnMapping.mappings, userId);
      console.log('👥 Customer records generated:', customerRecords.length);

      if (customerRecords.length === 0) {
        throw new Error('No valid customer records could be generated from the data');
      }

      // Phase 4: Database Storage (50-80%) - CRITICAL SECTION
      onProgress?.({
        phase: 'storing',
        progress: 55,
        message: 'Storing customer data in database...'
      });

      const insertedCount = await this.storeCustomersWithRobustHandling(customerRecords, onProgress);
      console.log('💾 Successfully stored customers:', insertedCount);

      if (insertedCount === 0) {
        throw new Error('Failed to store any customer data in the database');
      }

      // Phase 5: AI Insights (80-95%) - NON-BLOCKING
      onProgress?.({
        phase: 'processing',
        progress: 85,
        message: 'Generating AI insights (optional)...'
      });

      let aiInsights = null;
      let aiInsightsGenerated = false;
      
      try {
        aiInsights = await Promise.race([
          this.generateAIInsightsAsync(customerRecords),
          this.createTimeout(this.timeouts.aiInsights, 'AI insights generation timeout')
        ]);
        aiInsightsGenerated = true;
        console.log('🧠 AI insights generated successfully');
      } catch (aiError) {
        console.warn('⚠️ AI insights failed, continuing without insights:', aiError);
        warnings.push(`AI insights generation failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
      }

      // Final Phase: Complete (95-100%)
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Processing complete! ${insertedCount} customers stored successfully.`
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log('🎉 Robust processing completed successfully!');
      console.log(`📊 Final stats: ${insertedCount} customers stored, ${totalTime.toFixed(2)}ms total time`);

      return {
        success: true,
        customersProcessed: insertedCount,
        errors,
        warnings,
        processingStats: {
          totalTime,
          accuracyScore: columnMapping.confidence || 75,
          confidenceLevel: Math.min(85, columnMapping.confidence || 75),
          dataStoredSuccessfully: insertedCount > 0,
          aiInsightsGenerated
        },
        columnMapping,
        qualityReport: this.generateBasicQualityReport(customerRecords),
        aiInsights
      };

    } catch (error) {
      console.error('💥 Robust processing failed:', error);
      
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return {
        success: false,
        customersProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        warnings,
        processingStats: {
          totalTime: performance.now() - startTime,
          accuracyScore: 0,
          confidenceLevel: 0,
          dataStoredSuccessfully: false,
          aiInsightsGenerated: false
        }
      };
    }
  }

  private async parseFileWithLogging(file: File): Promise<{ data: any[]; headers: string[] }> {
    console.log('📖 Starting file parsing...');
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('📂 File buffer size:', arrayBuffer.byteLength);
    
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false
    });

    const sheetName = workbook.SheetNames[0];
    console.log('📄 Reading sheet:', sheetName);
    
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

    console.log('📊 Parsing complete:', { headers: headers.length, dataRows: data.length });
    return { data, headers };
  }

  private async processCustomerData(data: any[], mappings: any[], userId: string): Promise<any[]> {
    console.log('⚙️ Processing customer data...');
    console.log('🔗 Column mappings available:', mappings.length);
    
    const customerRecords: any[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const customerId = this.generateCustomerId(row, i);
        const lastPurchaseDate = this.parseDate(this.extractValue(row, mappings, 'last_purchase_date'));
        const purchaseCount = this.parseNumber(this.extractValue(row, mappings, 'purchase_count')) || 0;
        const totalSpent = this.parseNumber(this.extractValue(row, mappings, 'total_spent')) || 0;
        const avgOrderValue = this.parseNumber(this.extractValue(row, mappings, 'avg_order_value')) || 
                             (purchaseCount > 0 ? totalSpent / purchaseCount : 0);

        const customerRecord = {
          customer_id: customerId,
          email: this.extractValue(row, mappings, 'email') || null,
          name: this.extractValue(row, mappings, 'name') || null,
          last_purchase_date: lastPurchaseDate?.toISOString() || null,
          purchase_count: purchaseCount,
          total_spent: totalSpent,
          avg_order_value: avgOrderValue,
          risk_score: this.calculateBasicRiskScore(lastPurchaseDate, purchaseCount, totalSpent),
          segment: this.determineSegment(this.calculateBasicRiskScore(lastPurchaseDate, purchaseCount, totalSpent)),
          age: this.parseNumber(this.extractValue(row, mappings, 'age')) || null,
          gender: this.extractValue(row, mappings, 'gender') || null,
          tenure: this.parseNumber(this.extractValue(row, mappings, 'tenure')) || null,
          usage_frequency: this.extractValue(row, mappings, 'usage_frequency') || null,
          support_calls: this.parseNumber(this.extractValue(row, mappings, 'support_calls')) || null,
          payment_delay: this.parseNumber(this.extractValue(row, mappings, 'payment_delay')) || null,
          subscription_type: this.extractValue(row, mappings, 'subscription_type') || null,
          user_id: userId
        };

        customerRecords.push(customerRecord);
        
        if (i % 100 === 0) {
          console.log(`⚙️ Processed ${i + 1}/${data.length} rows`);
        }
      } catch (error) {
        console.warn(`⚠️ Error processing row ${i + 1}:`, error);
      }
    }

    console.log('✅ Customer data processing complete:', customerRecords.length);
    return customerRecords;
  }

  private async storeCustomersWithRobustHandling(
    customerRecords: any[], 
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<number> {
    console.log('💾 Starting robust database storage...');
    console.log('📊 Records to store:', customerRecords.length);
    
    const batchSize = 20; // Smaller batches for reliability
    const batches = Math.ceil(customerRecords.length / batchSize);
    let totalInserted = 0;

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, customerRecords.length);
      const batch = customerRecords.slice(startIndex, endIndex);
      
      console.log(`💾 Inserting batch ${batchIndex + 1}/${batches}: records ${startIndex + 1}-${endIndex}`);
      
      try {
        const insertPromise = supabase
          .from('customers')
          .insert(batch)
          .select('id');

        const timeoutPromise = this.createTimeout(this.timeouts.databaseOperation, 'Database operation timeout');
        
        const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

        if (error) {
          console.error('❌ Batch insert error:', error);
          if (error.code === '23505') {
            console.log('⚠️ Some customers already exist, continuing...');
          } else {
            throw error;
          }
        } else {
          totalInserted += batch.length;
          console.log(`✅ Batch ${batchIndex + 1} inserted successfully: ${batch.length} records`);
        }

        // Update progress
        const progress = 55 + ((batchIndex + 1) / batches) * 25;
        onProgress?.({
          phase: 'storing',
          progress,
          message: `Stored batch ${batchIndex + 1} of ${batches} (${totalInserted} customers)`
        });

        // Small delay between batches
        if (batchIndex < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Failed to insert batch ${batchIndex + 1}:`, error);
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`💾 Database storage complete: ${totalInserted}/${customerRecords.length} customers stored`);
    return totalInserted;
  }

  private async generateAIInsightsAsync(customerRecords: any[]): Promise<any> {
    console.log('🧠 Generating AI insights asynchronously...');
    
    // Simplified AI insights generation - non-blocking
    const highRiskCustomers = customerRecords.filter(c => c.risk_score >= 70);
    const totalRevenue = customerRecords.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    
    return {
      portfolioAnalysis: {
        totalCustomers: customerRecords.length,
        highRiskCount: highRiskCustomers.length,
        totalRevenue,
        avgCustomerValue: totalRevenue / customerRecords.length
      },
      sampleCustomerInsights: highRiskCustomers.slice(0, 3).map(customer => ({
        customerId: customer.customer_id,
        riskLevel: 'high',
        churnProbability: customer.risk_score / 100,
        recommendations: ['Re-engagement campaign needed', 'Customer retention focus'],
        keyFactors: ['High risk score', 'Requires attention']
      }))
    };
  }

  private extractValue(row: any, mappings: any[], targetField: string): any {
    const mapping = mappings.find(m => m.targetField === targetField);
    if (mapping) {
      return row[mapping.sourceColumn];
    }
    
    // Fallback direct mapping
    const directMappings: Record<string, string[]> = {
      customer_id: ['customer_id', 'id', 'customerId', 'Customer ID'],
      email: ['email', 'email_address', 'Email', 'Email Address'],
      name: ['name', 'customer_name', 'Customer Name', 'full_name'],
      total_spent: ['total_spent', 'totalSpent', 'Total Spent', 'lifetime_value'],
      purchase_count: ['purchase_count', 'purchaseCount', 'Purchase Count', 'order_count'],
      last_purchase_date: ['last_purchase_date', 'lastPurchaseDate', 'Last Purchase Date', 'last_order_date']
    };
    
    const possibleKeys = directMappings[targetField] || [];
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
    }
    
    return null;
  }

  private generateCustomerId(row: any, index: number): string {
    const possibleIds = ['customer_id', 'id', 'customerId', 'Customer ID'];
    
    for (const key of possibleIds) {
      const value = row[key];
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
    
    return `CUST_${Date.now()}_${index}`;
  }

  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'number') {
        if (dateValue > 25569 && dateValue < 73050) {
          const excelEpoch = new Date(1900, 0, 1);
          const days = dateValue - 1;
          return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        }
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

  private calculateBasicRiskScore(lastPurchaseDate: Date | null, purchaseCount: number, totalSpent: number): number {
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

  private generateBasicQualityReport(customerRecords: any[]): any {
    const totalFields = customerRecords.length * 5; // 5 key fields
    let filledFields = 0;
    
    customerRecords.forEach(customer => {
      if (customer.customer_id) filledFields++;
      if (customer.email) filledFields++;
      if (customer.name) filledFields++;
      if (customer.total_spent !== null) filledFields++;
      if (customer.purchase_count !== null) filledFields++;
    });
    
    const overallScore = (filledFields / totalFields) * 100;
    
    return {
      overallScore,
      completenessScore: overallScore,
      accuracyScore: Math.min(overallScore + 10, 100),
      consistencyScore: Math.min(overallScore + 5, 100),
      recommendations: overallScore < 80 ? ['Consider data enrichment'] : ['Data quality is good'],
      fieldScores: {}
    };
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
}

export const robustProcessor = new RobustDataProcessor();
