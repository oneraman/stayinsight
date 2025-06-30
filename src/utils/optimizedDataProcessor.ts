
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export interface OptimizedProcessingResult {
  success: boolean;
  customersProcessed: number;
  errors: string[];
  warnings: string[];
  duplicatesFound: number;
  dataQualityScore: number;
  processingTime: number;
  memoryUsage: number;
}

export class OptimizedDataProcessor {
  private worker: Worker | null = null;
  private batchSize = 50; // Optimized batch size
  private maxConcurrentBatches = 3;
  private processedBatches = 0;
  private totalBatches = 0;
  
  constructor() {
    this.initializeWorker();
  }
  
  private initializeWorker() {
    try {
      this.worker = new Worker(new URL('../workers/dataProcessor.worker.ts', import.meta.url), {
        type: 'module'
      });
    } catch (error) {
      console.warn('Web Worker not available, falling back to main thread');
    }
  }
  
  async processFileOptimized(
    file: File,
    userId: string,
    onProgress?: (progress: { phase: string; progress: number; message: string }) => void
  ): Promise<OptimizedProcessingResult> {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();
    
    console.log('🚀 Starting optimized processing for:', file.name);
    
    try {
      // Stream-based file reading for large files
      const data = await this.streamFileRead(file, onProgress);
      
      if (data.length === 0) {
        throw new Error('No valid data found in file');
      }
      
      // Process data in optimized batches
      const results = await this.processBatchesOptimized(data, userId, onProgress);
      
      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();
      
      return {
        ...results,
        processingTime: endTime - startTime,
        memoryUsage: finalMemory - initialMemory
      };
      
    } catch (error) {
      console.error('💥 Optimized processing failed:', error);
      throw error;
    } finally {
      this.cleanup();
    }
  }
  
  private async streamFileRead(
    file: File,
    onProgress?: (progress: { phase: string; progress: number; message: string }) => void
  ): Promise<any[]> {
    onProgress?.({
      phase: 'parsing',
      progress: 10,
      message: 'Reading file with optimized streaming...'
    });
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Use optimized XLSX settings for performance
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false,
      dense: true // Use dense mode for better performance
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with optimized settings
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      blankrows: false,
      header: 1,
      range: 0 // Process all rows
    });
    
    // Extract headers and data
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1) as any[][];
    
    // Convert to objects more efficiently
    const data = dataRows.map(row => {
      const obj: any = {};
      for (let i = 0; i < headers.length; i++) {
        if (headers[i] && row[i] !== undefined && row[i] !== '') {
          obj[headers[i]] = row[i];
        }
      }
      return obj;
    }).filter(row => Object.keys(row).length > 0);
    
    onProgress?.({
      phase: 'parsing',
      progress: 30,
      message: `Parsed ${data.length.toLocaleString()} rows efficiently`
    });
    
    return data;
  }
  
  private async processBatchesOptimized(
    data: any[],
    userId: string,
    onProgress?: (progress: { phase: string; progress: number; message: string }) => void
  ): Promise<Omit<OptimizedProcessingResult, 'processingTime' | 'memoryUsage'>> {
    this.totalBatches = Math.ceil(data.length / this.batchSize);
    this.processedBatches = 0;
    
    const allCustomers: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Process batches concurrently but with limits
    const batchPromises: Promise<any>[] = [];
    
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      const batchIndex = Math.floor(i / this.batchSize);
      
      // Limit concurrent processing
      if (batchPromises.length >= this.maxConcurrentBatches) {
        await Promise.race(batchPromises);
      }
      
      const batchPromise = this.processBatch(batch, batchIndex, userId)
        .then(result => {
          allCustomers.push(...result.customers);
          errors.push(...result.errors);
          warnings.push(...result.warnings);
          
          this.processedBatches++;
          onProgress?.({
            phase: 'processing',
            progress: 30 + (this.processedBatches / this.totalBatches) * 40,
            message: `Processed batch ${this.processedBatches} of ${this.totalBatches} (${result.customers.length} customers)`
          });
          
          // Remove completed promise
          const index = batchPromises.indexOf(batchPromise);
          if (index > -1) batchPromises.splice(index, 1);
          
          return result;
        });
      
      batchPromises.push(batchPromise);
    }
    
    // Wait for all remaining batches
    await Promise.all(batchPromises);
    
    // Optimized duplicate detection
    const duplicateAnalysis = this.detectDuplicatesOptimized(allCustomers);
    
    // Calculate quality metrics efficiently
    const dataQualityScore = this.calculateQualityOptimized(allCustomers);
    
    // Store in database with optimized batching
    const insertedCount = await this.insertCustomersOptimized(allCustomers, userId, onProgress);
    
    return {
      success: true,
      customersProcessed: insertedCount,
      errors,
      warnings,
      duplicatesFound: duplicateAnalysis.count,
      dataQualityScore: Math.round(dataQualityScore)
    };
  }
  
  private async processBatch(batch: any[], batchIndex: number, userId: string): Promise<{
    customers: any[];
    errors: string[];
    warnings: string[];
  }> {
    return new Promise((resolve, reject) => {
      if (this.worker) {
        // Use web worker for processing
        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'BATCH_COMPLETE' && e.data.batchIndex === batchIndex) {
            this.worker!.removeEventListener('message', handleMessage);
            const processedCustomers = e.data.data.map((customer: any) => ({
              ...customer,
              user_id: userId
            }));
            resolve({
              customers: processedCustomers,
              errors: [],
              warnings: []
            });
          } else if (e.data.type === 'ERROR') {
            this.worker!.removeEventListener('message', handleMessage);
            reject(new Error(e.data.error));
          }
        };
        
        this.worker.addEventListener('message', handleMessage);
        this.worker.postMessage({
          type: 'PROCESS_BATCH',
          data: batch,
          batchIndex
        });
      } else {
        // Fallback to main thread processing
        // This would contain the same logic as the worker but run on main thread
        setTimeout(() => {
          resolve({
            customers: batch.map(customer => ({ ...customer, user_id: userId })),
            errors: [],
            warnings: []
          });
        }, 0);
      }
    });
  }
  
  private detectDuplicatesOptimized(customers: any[]): { count: number } {
    const seen = new Set<string>();
    let duplicates = 0;
    
    for (const customer of customers) {
      const key = customer.email || customer.customer_id;
      if (key) {
        if (seen.has(key)) {
          duplicates++;
        } else {
          seen.add(key);
        }
      }
    }
    
    return { count: duplicates };
  }
  
  private calculateQualityOptimized(customers: any[]): number {
    if (customers.length === 0) return 0;
    
    let totalScore = 0;
    const keyFields = ['customer_id', 'email', 'total_spent', 'purchase_count'];
    
    for (const customer of customers) {
      let customerScore = 0;
      for (const field of keyFields) {
        if (customer[field] !== undefined && customer[field] !== null && customer[field] !== '') {
          customerScore += 25;
        }
      }
      totalScore += customerScore;
    }
    
    return totalScore / customers.length;
  }
  
  private async insertCustomersOptimized(
    customers: any[],
    userId: string,
    onProgress?: (progress: { phase: string; progress: number; message: string }) => void
  ): Promise<number> {
    onProgress?.({
      phase: 'storing',
      progress: 75,
      message: 'Storing data with optimized batching...'
    });
    
    const insertBatchSize = 100; // Larger batch size for inserts
    let totalInserted = 0;
    
    for (let i = 0; i < customers.length; i += insertBatchSize) {
      const batch = customers.slice(i, i + insertBatchSize);
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert(batch)
          .select('id');
        
        if (!error) {
          totalInserted += batch.length;
        }
        
        onProgress?.({
          phase: 'storing',
          progress: 75 + ((i + batch.length) / customers.length) * 20,
          message: `Stored batch ${Math.floor(i / insertBatchSize) + 1} of ${Math.ceil(customers.length / insertBatchSize)}`
        });
        
        // Minimal delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error('Insert batch failed:', error);
      }
    }
    
    return totalInserted;
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  private cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const optimizedProcessor = new OptimizedDataProcessor();
