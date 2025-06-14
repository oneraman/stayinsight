import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import * as XLSX from "xlsx";

// Customer data interface
export interface CustomerData {
  id?: string;
  customerId: string;
  email?: string;
  name?: string;
  lastPurchaseDate?: Date;
  purchaseCount?: number;
  totalSpent?: number;
  avgOrderValue?: number;
  riskScore?: number;
  segment?: 'low-risk' | 'medium-risk' | 'high-risk';
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for parsed row data from spreadsheet
interface CustomerRowData {
  [key: string]: any;
  customer_id?: string;
  customerId?: string;
  id?: string;
  email?: string;
  email_address?: string;
  name?: string;
  customer_name?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  last_purchase_date?: string | number;
  lastPurchaseDate?: string | number;
  last_order_date?: string | number;
  purchase_count?: number | string;
  purchaseCount?: number | string;
  order_count?: number | string;
  total_spent?: number | string;
  totalSpent?: number | string;
  lifetime_value?: number | string;
  avg_order_value?: number | string;
  avgOrderValue?: number | string;
}

// Calculate risk score based on RFM (Recency, Frequency, Monetary)
const calculateRiskScore = (
  lastPurchaseDate: Date | undefined, 
  purchaseCount: number | undefined, 
  totalSpent: number | undefined
): number => {
  let score = 50; // Default medium risk
  const now = new Date();
  
  // Recency factor - more recent purchases lower the risk
  if (lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastPurchase < 30) score -= 20;
    else if (daysSinceLastPurchase < 90) score -= 10;
    else if (daysSinceLastPurchase > 180) score += 20;
  } else {
    score += 25;
  }
  
  // Frequency factor
  if (purchaseCount) {
    if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount < 2) score += 15;
  } else {
    score += 15;
  }
  
  // Monetary factor
  if (totalSpent) {
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent > 500) score -= 10;
    else if (totalSpent < 100) score += 10;
  } else {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

// Determine customer segment based on risk score
const determineSegment = (riskScore: number): 'low-risk' | 'medium-risk' | 'high-risk' => {
  if (riskScore < 30) return 'low-risk';
  if (riskScore < 70) return 'medium-risk';
  return 'high-risk';
};

// Parse date from various formats
const parseDate = (dateStr: string | number): Date | undefined => {
  if (!dateStr) return undefined;
  
  try {
    if (typeof dateStr === 'number') {
      return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    }
    
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date:", dateStr);
      return undefined;
    }
    return parsedDate;
  } catch (e) {
    console.error("Error parsing date:", e);
    return undefined;
  }
};

// Validate customer data
const validateCustomerData = (row: CustomerRowData, index: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!row.customer_id && !row.customerId && !row.id) {
    errors.push(`Row ${index + 1}: Missing customer ID`);
  }
  
  if (row.total_spent && isNaN(Number(row.total_spent))) {
    errors.push(`Row ${index + 1}: Invalid total spent value`);
  }
  
  if (row.purchase_count && isNaN(Number(row.purchase_count))) {
    errors.push(`Row ${index + 1}: Invalid purchase count value`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Main function to process customer data from uploaded file
export const processCustomerDataFile = async (
  fileUrl: string, 
  onProgress?: (progress: number, message: string) => void
): Promise<{ success: boolean; customersProcessed: number; errors: string[] }> => {
  try {
    console.log("Starting to process file from URL:", fileUrl);
    
    onProgress?.(10, "Downloading file...");
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    onProgress?.(20, "Reading file data...");
    const fileBlob = await response.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();
    
    onProgress?.(30, "Parsing spreadsheet...");
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as CustomerRowData[];
    
    if (data.length === 0) {
      throw new Error("The uploaded file appears to be empty or has no valid data rows.");
    }
    
    onProgress?.(40, "Validating customer data...");
    
    const customers: CustomerData[] = [];
    const allErrors: string[] = [];
    
    data.forEach((row, index) => {
      // Update progress for every 100 rows
      if (index % 100 === 0) {
        const progress = 40 + ((index / data.length) * 30);
        onProgress?.(progress, `Processing row ${index + 1} of ${data.length}...`);
      }
      
      const validation = validateCustomerData(row, index);
      if (!validation.isValid) {
        allErrors.push(...validation.errors);
        return;
      }
      
      try {
        const customerData: CustomerData = {
          customerId: row.customer_id || row.customerId || row.id || `C${Math.random().toString(36).substring(2, 10)}`,
          email: row.email || row.email_address,
          name: row.name || row.customer_name || row.fullname || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          lastPurchaseDate: parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date),
          purchaseCount: Number(row.purchase_count || row.purchaseCount || row.order_count) || undefined,
          totalSpent: Number(row.total_spent || row.totalSpent || row.lifetime_value) || undefined,
          avgOrderValue: Number(row.avg_order_value || row.avgOrderValue) || undefined
        };
        
        customerData.riskScore = calculateRiskScore(
          customerData.lastPurchaseDate,
          customerData.purchaseCount,
          customerData.totalSpent
        );
        
        customerData.segment = determineSegment(customerData.riskScore);
        customers.push(customerData);
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        allErrors.push(`Row ${index + 1}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    
    if (customers.length === 0) {
      throw new Error("No valid customer records found in the file.");
    }
    
    onProgress?.(70, "Storing customer data...");
    await storeCustomerData(customers, onProgress);
    
    onProgress?.(100, "Processing complete!");
    
    return {
      success: true,
      customersProcessed: customers.length,
      errors: allErrors
    };
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error(`Failed to process customer data file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Store processed customer data in Firestore using batched writes
const storeCustomerData = async (
  customers: CustomerData[], 
  onProgress?: (progress: number, message: string) => void
): Promise<void> => {
  try {
    console.log(`Starting to store ${customers.length} customers in Firestore`);
    
    const batchSize = 500;
    const batches = [];
    
    // Create batches
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = writeBatch(firestore);
      const batchCustomers = customers.slice(i, i + batchSize);
      
      batchCustomers.forEach((customer) => {
        const docRef = doc(collection(firestore, "customers"));
        batch.set(docRef, {
          ...customer,
          lastPurchaseDate: customer.lastPurchaseDate || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      batches.push(batch);
    }
    
    // Execute batches with progress tracking
    for (let i = 0; i < batches.length; i++) {
      const progress = 70 + (((i + 1) / batches.length) * 30);
      onProgress?.(progress, `Storing batch ${i + 1} of ${batches.length}...`);
      
      await batches[i].commit();
      console.log(`Batch ${i + 1} committed successfully`);
    }
    
    console.log(`Successfully stored ${customers.length} customer records in Firestore`);
  } catch (error) {
    console.error("Error storing customer data:", error);
    throw new Error(`Failed to store customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
