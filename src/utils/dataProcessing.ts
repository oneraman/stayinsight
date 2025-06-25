
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import * as XLSX from "xlsx";
import { validateFileData, CustomerRowData } from "./dataValidation";

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

// Calculate risk score based on RFM (Recency, Frequency, Monetary)
const calculateRiskScore = (
  lastPurchaseDate: Date | undefined, 
  purchaseCount: number | undefined, 
  totalSpent: number | undefined
): number => {
  console.log("Calculating risk score for:", { lastPurchaseDate, purchaseCount, totalSpent });
  let score = 50; // Default medium risk
  const now = new Date();
  
  // Recency factor - more recent purchases lower the risk
  if (lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log("Days since last purchase:", daysSinceLastPurchase);
    if (daysSinceLastPurchase < 30) score -= 20;
    else if (daysSinceLastPurchase < 90) score -= 10;
    else if (daysSinceLastPurchase > 180) score += 20;
  } else {
    score += 25;
  }
  
  // Frequency factor
  if (purchaseCount) {
    console.log("Purchase count:", purchaseCount);
    if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount < 2) score += 15;
  } else {
    score += 15;
  }
  
  // Monetary factor
  if (totalSpent) {
    console.log("Total spent:", totalSpent);
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent > 500) score -= 10;
    else if (totalSpent < 100) score += 10;
  } else {
    score += 10;
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  console.log("Final risk score:", finalScore);
  return finalScore;
};

// Determine customer segment based on risk score
const determineSegment = (riskScore: number): 'low-risk' | 'medium-risk' | 'high-risk' => {
  if (riskScore < 30) return 'low-risk';
  if (riskScore < 70) return 'medium-risk';
  return 'high-risk';
};

// Enhanced date parsing with better error handling
const parseDate = (dateStr: string | number): Date | undefined => {
  if (!dateStr) return undefined;
  
  try {
    console.log("Parsing date:", dateStr, "Type:", typeof dateStr);
    
    // Handle Excel serial number dates
    if (typeof dateStr === 'number') {
      console.log("Processing Excel serial date number:", dateStr);
      // Excel epoch starts at 1900-01-01, but there's a leap year bug
      const excelEpoch = new Date(1900, 0, 1);
      const days = dateStr - 1; // Adjust for Excel's 1-based indexing
      const result = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      console.log("Converted Excel date to:", result);
      return result;
    }
    
    // Handle string dates
    if (typeof dateStr === 'string') {
      // Try multiple date formats
      const formats = [
        dateStr, // Original format
        dateStr.replace(/[-]/g, '/'), // Convert dashes to slashes
        dateStr.replace(/[/]/g, '-'), // Convert slashes to dashes
      ];
      
      for (const format of formats) {
        const parsedDate = new Date(format);
        if (!isNaN(parsedDate.getTime())) {
          console.log("Successfully parsed date:", format, "->", parsedDate);
          return parsedDate;
        }
      }
    }
    
    console.warn("Could not parse date:", dateStr);
    return undefined;
  } catch (e) {
    console.error("Error parsing date:", dateStr, e);
    return undefined;
  }
};

// Main function to process customer data from uploaded file
export const processCustomerDataFile = async (
  fileUrl: string, 
  onProgress?: (progress: number, message: string) => void
): Promise<{ success: boolean; customersProcessed: number; errors: string[] }> => {
  console.log("🚀 Starting file processing pipeline...");
  console.log("File URL:", fileUrl);
  
  try {
    onProgress?.(5, "Initializing file processing...");
    
    console.log("📥 Step 1: Downloading file from URL");
    onProgress?.(10, "Downloading file...");
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    console.log("✅ File downloaded successfully");
    
    console.log("📖 Step 2: Reading file data");
    onProgress?.(20, "Reading file data...");
    const fileBlob = await response.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();
    console.log("File size:", arrayBuffer.byteLength, "bytes");
    
    console.log("📊 Step 3: Parsing spreadsheet");
    onProgress?.(30, "Parsing spreadsheet...");
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    console.log("Sheet name:", sheetName);
    console.log("Available sheets:", workbook.SheetNames);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as CustomerRowData[];
    console.log("✅ Parsed", data.length, "rows from spreadsheet");
    console.log("Sample data (first 3 rows):", data.slice(0, 3));
    
    console.log("✅ Step 4: Validating data");
    onProgress?.(40, "Validating data...");
    const validation = validateFileData(data);
    console.log("Validation result:", validation);
    
    if (!validation.isValid) {
      console.error("❌ Data validation failed:", validation.errors);
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    console.log("⚙️ Step 5: Processing customer records");
    onProgress?.(50, "Processing customer records...");
    
    const customers: CustomerData[] = [];
    const allErrors: string[] = [...validation.warnings];
    let processedCount = 0;
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      processedCount++;
      
      // Update progress every 50 rows or on last row
      if (index % 50 === 0 || index === data.length - 1) {
        const progress = 50 + ((index / data.length) * 30);
        onProgress?.(progress, `Processing customer ${index + 1} of ${data.length}...`);
        console.log(`Processing progress: ${index + 1}/${data.length} (${Math.round(progress)}%)`);
      }
      
      try {
        console.log(`Processing row ${index + 1}:`, row);
        
        const customerData: CustomerData = {
          customerId: row.customer_id || row.customerId || row.id || `C${Date.now()}_${index}`,
          email: row.email || row.email_address || undefined,
          name: row.name || row.customer_name || row.fullname || 
                `${row.first_name || ''} ${row.last_name || ''}`.trim() || undefined,
          lastPurchaseDate: parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date),
          purchaseCount: row.purchase_count || row.purchaseCount || row.order_count ? 
                        Number(row.purchase_count || row.purchaseCount || row.order_count) : undefined,
          totalSpent: row.total_spent || row.totalSpent || row.lifetime_value ? 
                     Number(row.total_spent || row.totalSpent || row.lifetime_value) : undefined,
          avgOrderValue: row.avg_order_value || row.avgOrderValue ? 
                        Number(row.avg_order_value || row.avgOrderValue) : undefined
        };
        
        console.log(`Customer data for row ${index + 1}:`, customerData);
        
        // Calculate risk score
        customerData.riskScore = calculateRiskScore(
          customerData.lastPurchaseDate,
          customerData.purchaseCount,
          customerData.totalSpent
        );
        
        customerData.segment = determineSegment(customerData.riskScore);
        console.log(`Customer ${customerData.customerId} assigned to ${customerData.segment} segment with risk score ${customerData.riskScore}`);
        
        customers.push(customerData);
      } catch (error) {
        console.error(`❌ Error processing row ${index + 1}:`, error);
        allErrors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
      }
    }
    
    console.log("✅ Processing complete:", customers.length, "customers processed");
    
    if (customers.length === 0) {
      throw new Error("No valid customer records found in the file.");
    }
    
    console.log("💾 Step 6: Storing customer data in database");
    onProgress?.(80, "Storing customer data...");
    await storeCustomerData(customers, onProgress);
    
    onProgress?.(100, "Processing complete!");
    console.log("🎉 File processing pipeline completed successfully!");
    
    return {
      success: true,
      customersProcessed: customers.length,
      errors: allErrors
    };
  } catch (error) {
    console.error("💥 Error in file processing pipeline:", error);
    throw new Error(`Failed to process customer data file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Store processed customer data in Firestore using batched writes
const storeCustomerData = async (
  customers: CustomerData[], 
  onProgress?: (progress: number, message: string) => void
): Promise<void> => {
  try {
    console.log(`💾 Starting to store ${customers.length} customers in Firestore`);
    
    const batchSize = 500;
    const totalBatches = Math.ceil(customers.length / batchSize);
    console.log(`Creating ${totalBatches} batches of max ${batchSize} customers each`);
    
    // Create and execute batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, customers.length);
      const batchCustomers = customers.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}: customers ${startIndex + 1}-${endIndex}`);
      
      const batch = writeBatch(firestore);
      
      batchCustomers.forEach((customer, customerIndex) => {
        const docRef = doc(collection(firestore, "customers"));
        const customerWithTimestamps = {
          ...customer,
          lastPurchaseDate: customer.lastPurchaseDate || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(docRef, customerWithTimestamps);
        
        if (customerIndex % 100 === 0) {
          console.log(`Added customer ${customerIndex + 1}/${batchCustomers.length} to batch ${batchIndex + 1}`);
        }
      });
      
      const progress = 80 + ((batchIndex + 1) / totalBatches * 20);
      onProgress?.(progress, `Storing batch ${batchIndex + 1} of ${totalBatches}...`);
      
      await batch.commit();
      console.log(`✅ Batch ${batchIndex + 1}/${totalBatches} committed successfully`);
    }
    
    console.log(`🎉 Successfully stored all ${customers.length} customer records in Firestore`);
  } catch (error) {
    console.error("💥 Error storing customer data:", error);
    throw new Error(`Failed to store customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
