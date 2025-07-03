import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { mapColumnsIntelligently, ColumnMappingResult } from './advancedColumnMapper';
import { EnhancedDataValidator, DataQualityReport } from './enhancedDataValidator';
import { AdvancedAIAnalyzer, CustomerProfile, AIInsightResult } from './advancedAIAnalyzer';
import { calculateEnhancedRiskScore } from './riskScoring';

export interface AccurateProcessingResult {
  success: boolean;
  customersProcessed: number;
  columnMapping: ColumnMappingResult;
  qualityReport: DataQualityReport;
  aiInsights?: {
    portfolioAnalysis: any;
    sampleCustomerInsights: AIInsightResult[];
  };
  processingStats: {
    totalTime: number;
    accuracyScore: number;
    confidenceLevel: number;
  };
  errors: string[];
  warnings: string[];
}

export class AccurateDataProcessor {
  private validator = new EnhancedDataValidator();
  private aiAnalyzer = new AdvancedAIAnalyzer();

  async processFileWithMaximumAccuracy(
    file: File,
    userId: string,
    onProgress?: (progress: { phase: string; progress: number; message: string }) => void
  ): Promise<AccurateProcessingResult> {
    const startTime = performance.now();
    
    console.log('🎯 Starting maximum accuracy processing for:', file.name);
    console.log('🔑 Processing for user ID:', userId);
    
    try {
      // Phase 1: Intelligent File Reading
      onProgress?.({
        phase: 'parsing',
        progress: 10,
        message: 'Reading file with advanced parsing algorithms...'
      });

      const { data, headers } = await this.readFileIntelligently(file);
      console.log('📊 Parsed data rows:', data.length);
      console.log('📋 Headers found:', headers);
      
      // Phase 2: Advanced Column Mapping
      onProgress?.({
        phase: 'processing',
        progress: 20,
        message: 'Mapping columns with AI-powered detection...'
      });

      const columnMapping = mapColumnsIntelligently(headers);
      console.log('📊 Column mapping results:', columnMapping);

      if (columnMapping.confidence < 60) {
        throw new Error(`Low confidence in column mapping (${columnMapping.confidence.toFixed(1)}%). Please check your file structure.`);
      }

      // Phase 3: Enhanced Data Validation & Cleaning
      onProgress?.({
        phase: 'processing',
        progress: 40,
        message: 'Validating and cleaning data with advanced algorithms...'
      });

      const { cleanedData, qualityReport } = this.validator.validateAndCleanData(data, columnMapping.mappings);
      console.log('🔍 Data quality report:', qualityReport);
      console.log('🧹 Cleaned data rows:', cleanedData.length);

      // Phase 4: Advanced Risk Scoring
      onProgress?.({
        phase: 'processing',
        progress: 60,
        message: 'Calculating enhanced risk scores...'
      });

      const customerRecords = this.generateCustomerRecords(cleanedData, columnMapping.mappings, userId);
      console.log('👥 Generated customer records:', customerRecords.length);

      // Phase 5: AI-Powered Insights
      onProgress?.({
        phase: 'processing',
        progress: 75,
        message: 'Generating AI insights with advanced analysis...'
      });

      const customerProfiles = this.generateCustomerProfiles(cleanedData, userId);
      const aiInsights = await this.generateAdvancedInsights(customerProfiles, qualityReport);

      // Phase 6: Database Storage
      onProgress?.({
        phase: 'storing',
        progress: 85,
        message: 'Storing processed data with accuracy validation...'
      });

      const insertedCount = await this.storeCustomersWithValidation(customerRecords);
      console.log('💾 Successfully stored customers:', insertedCount);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Calculate final accuracy metrics
      const accuracyScore = this.calculateOverallAccuracy(qualityReport, columnMapping);
      const confidenceLevel = Math.min(qualityReport.overallScore, columnMapping.confidence);

      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Accurate processing complete! ${accuracyScore.toFixed(1)}% accuracy achieved.`
      });

      console.log('🎉 Maximum accuracy processing completed!');
      console.log(`📊 Results: ${insertedCount} customers, ${accuracyScore.toFixed(1)}% accuracy, ${confidenceLevel.toFixed(1)}% confidence`);

      return {
        success: true,
        customersProcessed: insertedCount,
        columnMapping,
        qualityReport,
        aiInsights,
        processingStats: {
          totalTime,
          accuracyScore,
          confidenceLevel
        },
        errors: [],
        warnings: qualityReport.recommendations
      };

    } catch (error) {
      console.error('💥 Accurate processing failed:', error);
      throw new Error(`Accurate processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async readFileIntelligently(file: File): Promise<{ data: any[]; headers: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use optimized XLSX settings for maximum accuracy
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false,
      dateNF: 'yyyy-mm-dd',
      cellStyles: true, // Preserve formatting for better date detection
      sheetStubs: true  // Include empty cells for better structure detection
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get range to understand data structure
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    
    // Extract headers with intelligent detection
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false
    }) as any[][];

    if (rawData.length === 0) {
      throw new Error('No data found in the file');
    }

    // Detect header row (might not be the first row)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i];
      if (row.some((cell: any) => typeof cell === 'string' && cell.length > 0)) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rawData[headerRowIndex].map((h: any) => String(h).trim()).filter(h => h.length > 0);
    const dataRows = rawData.slice(headerRowIndex + 1);

    // Convert to objects with intelligent null handling
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

    return { data, headers };
  }

  private generateCustomerRecords(cleanedData: any[], mappings: any[], userId: string): any[] {
    console.log('🔄 Generating customer records with proper mapping...');
    
    return cleanedData.map((row, index) => {
      try {
        // Extract data using column mappings
        const extractedData = this.extractDataUsingMappings(row, mappings);
        
        // Generate customer ID if not present
        const customerId = extractedData.customer_id || `CUST_${Date.now()}_${index}`;
        
        // Parse dates properly
        const lastPurchaseDate = this.parseDate(extractedData.last_purchase_date);
        
        // Parse numbers with validation
        const purchaseCount = this.parseNumber(extractedData.purchase_count) || 0;
        const totalSpent = this.parseNumber(extractedData.total_spent) || 0;
        const avgOrderValue = this.parseNumber(extractedData.avg_order_value) || 
                             (purchaseCount > 0 ? totalSpent / purchaseCount : 0);
        
        // Calculate enhanced risk score
        const riskAnalysis = calculateEnhancedRiskScore({
          lastPurchaseDate: lastPurchaseDate?.toISOString() || null,
          purchaseCount,
          totalSpent,
          avgOrderValue,
          age: this.parseNumber(extractedData.age),
          tenure: this.parseNumber(extractedData.tenure),
          supportCalls: this.parseNumber(extractedData.support_calls),
          paymentDelay: this.parseNumber(extractedData.payment_delay),
          usageFrequency: extractedData.usage_frequency,
          subscriptionType: extractedData.subscription_type
        });

        const customerRecord = {
          customer_id: customerId,
          email: extractedData.email || null,
          name: extractedData.name || null,
          last_purchase_date: lastPurchaseDate?.toISOString() || null,
          purchase_count: purchaseCount,
          total_spent: totalSpent,
          avg_order_value: avgOrderValue,
          risk_score: riskAnalysis.score,
          segment: this.determineSegment(riskAnalysis.score),
          age: this.parseNumber(extractedData.age),
          gender: extractedData.gender || null,
          tenure: this.parseNumber(extractedData.tenure),
          usage_frequency: extractedData.usage_frequency || null,
          support_calls: this.parseNumber(extractedData.support_calls),
          payment_delay: this.parseNumber(extractedData.payment_delay),
          subscription_type: extractedData.subscription_type || null,
          user_id: userId // Fix: Use the actual userId parameter instead of hardcoded value
        };

        console.log(`✅ Generated record for customer ${customerId}:`, customerRecord);
        return customerRecord;
      } catch (error) {
        console.error(`❌ Error generating record for row ${index}:`, error);
        throw error;
      }
    });
  }

  private extractDataUsingMappings(row: any, mappings: any[]): any {
    const extractedData: any = {};
    
    // Create a mapping lookup for faster processing
    const mappingLookup = new Map();
    mappings.forEach(mapping => {
      mappingLookup.set(mapping.sourceColumn, mapping.targetField);
    });

    // Extract data based on mappings
    Object.keys(row).forEach(sourceColumn => {
      const targetField = mappingLookup.get(sourceColumn);
      if (targetField) {
        extractedData[targetField] = row[sourceColumn];
      }
    });

    // Also try direct mapping for common field names
    const directMappings = {
      'customer_id': row.customer_id || row.id || row.customerId,
      'email': row.email || row.email_address,
      'name': row.name || row.customer_name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      'total_spent': row.total_spent || row.totalSpent || row.lifetime_value,
      'purchase_count': row.purchase_count || row.purchaseCount || row.order_count,
      'last_purchase_date': row.last_purchase_date || row.lastPurchaseDate || row.last_order_date,
      'avg_order_value': row.avg_order_value || row.avgOrderValue,
      'age': row.age || row.Age,
      'gender': row.gender || row.Gender,
      'tenure': row.tenure || row.Tenure,
      'usage_frequency': row.usage_frequency || row['Usage Frequency'],
      'support_calls': row.support_calls || row['Support Calls'],
      'payment_delay': row.payment_delay || row['Payment Delay'],
      'subscription_type': row.subscription_type || row['Subscription Type']
    };

    // Fill in any missing mappings with direct mappings
    Object.keys(directMappings).forEach(field => {
      if (!extractedData[field] && directMappings[field]) {
        extractedData[field] = directMappings[field];
      }
    });

    return extractedData;
  }

  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'number') {
        // Excel serial date
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

  private parseNumber(value: any): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,£€¥\s%]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? undefined : Math.max(0, num);
    }
    
    const num = Number(value);
    return isNaN(num) ? undefined : Math.max(0, num);
  }

  private async storeCustomersWithValidation(customerRecords: any[]): Promise<number> {
    console.log('💾 Starting database storage with validation...');
    
    if (customerRecords.length === 0) {
      console.warn('⚠️ No customer records to store');
      return 0;
    }

    const batchSize = 50;
    let totalInserted = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < customerRecords.length; i += batchSize) {
        const batch = customerRecords.slice(i, i + batchSize);
        console.log(`💾 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(customerRecords.length/batchSize)}: ${batch.length} records`);
        
        try {
          const { data, error } = await supabase
            .from('customers')
            .insert(batch)
            .select('id');

          if (error) {
            console.error('❌ Batch insert error:', error);
            
            if (error.code === '23505') {
              console.log('⚠️ Some customers already exist, skipping duplicates');
              errors.push(`Batch ${Math.floor(i/batchSize) + 1}: Some customers already exist`);
            } else {
              throw error;
            }
          } else {
            totalInserted += batch.length;
            console.log(`✅ Successfully inserted batch: ${data?.length || batch.length} customers`);
          }
        } catch (batchError) {
          console.error(`❌ Failed to insert batch ${Math.floor(i/batchSize) + 1}:`, batchError);
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }

        // Small delay between batches to avoid overwhelming the database
        if (i + batchSize < customerRecords.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`🎉 Database storage complete: ${totalInserted}/${customerRecords.length} customers stored`);
      if (errors.length > 0) {
        console.warn('⚠️ Storage warnings:', errors);
      }

      return totalInserted;
    } catch (error) {
      console.error('💥 Critical storage error:', error);
      throw new Error(`Database storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateCustomerProfiles(cleanedData: any[], userId: string): CustomerProfile[] {
    return cleanedData.map((row, index) => {
      // Generate customer ID if not present
      const customerId = row.customer_id || `CUST_${Date.now()}_${index}`;
      
      // Calculate business metrics
      const totalSpent = row.total_spent || 0;
      const purchaseCount = row.purchase_count || 0;
      const avgOrderValue = row.avg_order_value || (purchaseCount > 0 ? totalSpent / purchaseCount : 0);
      const lastPurchaseDate = row.last_purchase_date ? new Date(row.last_purchase_date) : null;
      const daysSinceLastPurchase = lastPurchaseDate 
        ? Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      const tenure = row.tenure || 12; // Default to 12 months
      const purchaseFrequency = purchaseCount > 0 && tenure > 0 ? (purchaseCount / (tenure / 12)) : 0;
      const customerLifetimeValue = totalSpent + (avgOrderValue * 2); // Simple CLV calculation

      // Enhanced risk scoring
      const riskAnalysis = calculateEnhancedRiskScore({
        lastPurchaseDate: lastPurchaseDate?.toISOString() || null,
        purchaseCount,
        totalSpent,
        avgOrderValue,
        age: row.age,
        tenure,
        supportCalls: row.support_calls,
        paymentDelay: row.payment_delay,
        usageFrequency: row.usage_frequency,
        subscriptionType: row.subscription_type
      });

      // Behavioral analysis
      const engagementLevel = this.calculateEngagementLevel(purchaseFrequency, daysSinceLastPurchase);
      const loyaltyScore = this.calculateLoyaltyScore(purchaseCount, tenure, totalSpent);
      const riskFactors = this.identifyRiskFactors(row, daysSinceLastPurchase);
      const opportunityAreas = this.identifyOpportunities(row, riskAnalysis.score);

      return {
        customerId,
        riskScore: riskAnalysis.score,
        segment: this.determineSegment(riskAnalysis.score),
        dataQuality: this.calculateRowDataQuality(row),
        businessMetrics: {
          totalSpent,
          purchaseCount,
          avgOrderValue,
          daysSinceLastPurchase,
          customerLifetimeValue,
          purchaseFrequency
        },
        behavioralIndicators: {
          engagementLevel,
          loyaltyScore,
          riskFactors,
          opportunityAreas
        }
      };
    });
  }

  private async generateAdvancedInsights(
    customerProfiles: CustomerProfile[],
    qualityReport: DataQualityReport
  ): Promise<{ portfolioAnalysis: any; sampleCustomerInsights: AIInsightResult[] }> {
    try {
      // Generate portfolio-level insights
      const portfolioAnalysis = await this.aiAnalyzer.generatePortfolioInsights(customerProfiles, qualityReport);

      // Generate insights for top 3 highest-risk customers
      const highRiskCustomers = customerProfiles
        .filter(c => c.riskScore >= 70)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 3);

      const sampleCustomerInsights: AIInsightResult[] = [];
      for (const customer of highRiskCustomers) {
        try {
          const insight = await this.aiAnalyzer.generateContextualInsights(
            customer,
            null, // Industry benchmarks would go here
            qualityReport
          );
          sampleCustomerInsights.push(insight);
        } catch (error) {
          console.warn(`Failed to generate insights for customer ${customer.customerId}:`, error);
        }
      }

      return { portfolioAnalysis, sampleCustomerInsights };
    } catch (error) {
      console.warn('AI insights generation failed:', error);
      return { portfolioAnalysis: null, sampleCustomerInsights: [] };
    }
  }

  private calculateEngagementLevel(frequency: number, daysSinceLastPurchase: number | null): 'low' | 'medium' | 'high' {
    if (daysSinceLastPurchase === null || daysSinceLastPurchase > 180) return 'low';
    if (frequency >= 6 && daysSinceLastPurchase <= 30) return 'high';
    if (frequency >= 2 && daysSinceLastPurchase <= 90) return 'medium';
    return 'low';
  }

  private calculateLoyaltyScore(purchaseCount: number, tenure: number, totalSpent: number): number {
    const frequencyScore = Math.min(100, (purchaseCount / Math.max(1, tenure / 12)) * 10);
    const monetaryScore = Math.min(100, Math.log10(Math.max(1, totalSpent)) * 15);
    const tenureScore = Math.min(100, tenure * 2);
    
    return Math.round((frequencyScore + monetaryScore + tenureScore) / 3);
  }

  private identifyRiskFactors(row: any, daysSinceLastPurchase: number | null): string[] {
    const factors = [];
    
    if (daysSinceLastPurchase && daysSinceLastPurchase > 90) {
      factors.push('Long time since last purchase');
    }
    if ((row.purchase_count || 0) < 2) {
      factors.push('Low purchase frequency');
    }
    if ((row.support_calls || 0) > 5) {
      factors.push('High support interaction');
    }
    if ((row.payment_delay || 0) > 30) {
      factors.push('Payment delays');
    }
    
    return factors;
  }

  private identifyOpportunities(row: any, riskScore: number): string[] {
    const opportunities = [];
    
    if ((row.total_spent || 0) > 1000) {
      opportunities.push('High-value customer retention');
    }
    if (riskScore < 50 && (row.purchase_count || 0) > 5) {
      opportunities.push('Upselling potential');
    }
    if ((row.age || 0) > 0 && (row.age || 0) < 35) {
      opportunities.push('Young demographic growth');
    }
    
    return opportunities;
  }

  private calculateRowDataQuality(row: any): number {
    const fields = ['customer_id', 'email', 'total_spent', 'purchase_count', 'last_purchase_date'];
    const filledFields = fields.filter(field => row[field] !== undefined && row[field] !== null && row[field] !== '');
    return (filledFields.length / fields.length) * 100;
  }

  private determineSegment(riskScore: number): string {
    if (riskScore < 30) return 'low-risk';
    if (riskScore < 70) return 'medium-risk';
    return 'high-risk';
  }

  private calculateOverallAccuracy(qualityReport: DataQualityReport, columnMapping: ColumnMappingResult): number {
    const qualityWeight = 0.6;
    const mappingWeight = 0.4;
    
    return (qualityReport.overallScore * qualityWeight) + (columnMapping.confidence * mappingWeight);
  }
}

export const accurateProcessor = new AccurateDataProcessor();
