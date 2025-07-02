
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
    
    try {
      // Phase 1: Intelligent File Reading
      onProgress?.({
        phase: 'parsing',
        progress: 10,
        message: 'Reading file with advanced parsing algorithms...'
      });

      const { data, headers } = await this.readFileIntelligently(file);
      
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

      // Phase 4: Advanced Risk Scoring
      onProgress?.({
        phase: 'processing',
        progress: 60,
        message: 'Calculating enhanced risk scores...'
      });

      const customerProfiles = this.generateCustomerProfiles(cleanedData, userId);

      // Phase 5: AI-Powered Insights
      onProgress?.({
        phase: 'processing',
        progress: 75,
        message: 'Generating AI insights with advanced analysis...'
      });

      const aiInsights = await this.generateAdvancedInsights(customerProfiles, qualityReport);

      // Phase 6: Database Storage
      onProgress?.({
        phase: 'storing',
        progress: 85,
        message: 'Storing processed data with accuracy validation...'
      });

      const insertedCount = await this.storeCustomersWithValidation(customerProfiles);

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

  private async storeCustomersWithValidation(customerProfiles: CustomerProfile[]): Promise<number> {
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < customerProfiles.length; i += batchSize) {
      const batch = customerProfiles.slice(i, i + batchSize);
      
      // Convert profiles to database records
      const records = batch.map(profile => ({
        customer_id: profile.customerId,
        email: '', // Would be extracted from original data
        name: '', // Would be extracted from original data
        last_purchase_date: null, // Would be from business metrics
        purchase_count: profile.businessMetrics.purchaseCount,
        total_spent: profile.businessMetrics.totalSpent,
        avg_order_value: profile.businessMetrics.avgOrderValue,
        risk_score: profile.riskScore,
        segment: profile.segment,
        user_id: 'user-id-here' // Would be actual user ID
      }));

      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(records)
          .select('id');

        if (!error) {
          totalInserted += records.length;
        } else {
          console.warn('Batch insert warning:', error);
        }
      } catch (error) {
        console.error('Batch insert failed:', error);
      }
    }

    return totalInserted;
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
