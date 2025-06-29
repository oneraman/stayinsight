
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerRowData } from "./dataValidation";

export interface CustomerRecord {
  customerId: string;
  email?: string;
  name?: string;
  lastPurchaseDate?: Date | null;
  purchaseCount?: number;
  totalSpent?: number;
  riskScore: number;
  segment: 'low-risk' | 'medium-risk' | 'high-risk';
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageResult {
  success: boolean;
  processed: number;
  errors: string[];
  message: string;
}

const calculateRiskScore = (
  lastPurchaseDate: Date | null | undefined,
  purchaseCount: number | undefined,
  totalSpent: number | undefined
): number => {
  let score = 50; // Default medium risk
  const now = new Date();
  
  // Recency factor
  if (lastPurchaseDate) {
    const daysSince = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 30) score -= 20;
    else if (daysSince < 90) score -= 10;
    else if (daysSince > 180) score += 20;
  } else {
    score += 25;
  }
  
  // Frequency factor
  if (purchaseCount && purchaseCount > 0) {
    if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount < 2) score += 15;
  } else {
    score += 15;
  }
  
  // Monetary factor
  if (totalSpent && totalSpent > 0) {
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent > 500) score -= 10;
    else if (totalSpent < 100) score += 10;
  } else {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

const parseDate = (dateStr: string | number | undefined): Date | null => {
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

export const storeCustomerData = async (
  rawData: CustomerRowData[],
  onProgress?: (processed: number, total: number, message: string) => void
): Promise<StorageResult> => {
  try {
    console.log('💾 Starting to store customer data...');
    
    const customers: CustomerRecord[] = [];
    const errors: string[] = [];
    
    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        const customerId = row.customer_id || row.customerId || row.id || `C${Date.now()}_${i}`;
        const email = row.email || row.email_address;
        const name = row.name || row.customer_name || row.fullname || 
                    `${row.first_name || ''} ${row.last_name || ''}`.trim() || undefined;
        const lastPurchaseDate = parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date);
        const purchaseCount = row.purchase_count || row.purchaseCount || row.order_count ? 
                             Number(row.purchase_count || row.purchaseCount || row.order_count) : undefined;
        const totalSpent = row.total_spent || row.totalSpent || row.lifetime_value ? 
                          Number(row.total_spent || row.totalSpent || row.lifetime_value) : undefined;
        
        const riskScore = calculateRiskScore(lastPurchaseDate, purchaseCount, totalSpent);
        const segment = riskScore < 30 ? 'low-risk' : riskScore < 70 ? 'medium-risk' : 'high-risk';
        
        customers.push({
          customerId,
          email,
          name,
          lastPurchaseDate,
          purchaseCount,
          totalSpent,
          riskScore,
          segment,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
      }
      
      if (onProgress && i % 10 === 0) {
        onProgress(i + 1, rawData.length, `Processing customer ${i + 1}...`);
      }
    }
    
    console.log(`✅ Processed ${customers.length} customers, ${errors.length} errors`);
    
    // Store in batches
    const batchSize = 500;
    const batches = Math.ceil(customers.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, customers.length);
      const batchCustomers = customers.slice(start, end);
      
      const batch = writeBatch(firestore);
      
      batchCustomers.forEach(customer => {
        const docRef = doc(collection(firestore, "customers"));
        batch.set(docRef, {
          ...customer,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      
      if (onProgress) {
        onProgress(end, customers.length, `Stored batch ${batchIndex + 1} of ${batches}...`);
      }
    }
    
    return {
      success: true,
      processed: customers.length,
      errors,
      message: `Successfully processed ${customers.length} customers`
    };
    
  } catch (error) {
    console.error('❌ Storage error:', error);
    return {
      success: false,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown storage error'],
      message: 'Failed to store customer data'
    };
  }
};
