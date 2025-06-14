
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import * as XLSX from "xlsx";

// Customer data interface
export interface CustomerData {
  id?: string; // Add id property for Firestore document id
  customerId: string;
  email?: string;
  name?: string;
  lastPurchaseDate?: Date;
  purchaseCount?: number;
  totalSpent?: number;
  avgOrderValue?: number;
  riskScore?: number;
  segment?: 'low-risk' | 'medium-risk' | 'high-risk';
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
    score += 25; // No purchase date is high risk
  }
  
  // Frequency factor - more purchases lower the risk
  if (purchaseCount) {
    if (purchaseCount > 10) score -= 15;
    else if (purchaseCount > 5) score -= 10;
    else if (purchaseCount < 2) score += 15;
  } else {
    score += 15; // No purchase count is higher risk
  }
  
  // Monetary factor - higher spend lowers the risk
  if (totalSpent) {
    if (totalSpent > 1000) score -= 15;
    else if (totalSpent > 500) score -= 10;
    else if (totalSpent < 100) score += 10;
  } else {
    score += 10; // No spending data is higher risk
  }
  
  // Ensure score is between 0-100
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
    // If it's an Excel date (number)
    if (typeof dateStr === 'number') {
      return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    }
    
    // Try to parse string date
    return new Date(dateStr);
  } catch (e) {
    console.error("Error parsing date:", e);
    return undefined;
  }
};

// Process Excel file data
const processExcelData = (data: any[]): CustomerData[] => {
  console.log("Processing Excel data:", data.length, "rows");
  
  return data.map((row, index) => {
    console.log(`Processing row ${index + 1}:`, row);
    
    // Map spreadsheet columns to our data structure
    // This mapping assumes certain column names - adjust based on your actual data structure
    const customerData: CustomerData = {
      customerId: row.customer_id || row.customerId || row.id || `C${Math.random().toString(36).substring(2, 10)}`,
      email: row.email || row.email_address,
      name: row.name || row.customer_name || row.fullname || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      lastPurchaseDate: parseDate(row.last_purchase_date || row.lastPurchaseDate || row.last_order_date),
      purchaseCount: Number(row.purchase_count || row.purchaseCount || row.order_count) || undefined,
      totalSpent: Number(row.total_spent || row.totalSpent || row.lifetime_value) || undefined,
      avgOrderValue: Number(row.avg_order_value || row.avgOrderValue) || undefined
    };
    
    // Calculate risk score
    customerData.riskScore = calculateRiskScore(
      customerData.lastPurchaseDate,
      customerData.purchaseCount,
      customerData.totalSpent
    );
    
    // Determine segment
    customerData.segment = determineSegment(customerData.riskScore);
    
    console.log(`Processed customer:`, customerData);
    return customerData;
  });
};

// Main function to process customer data from uploaded file
export const processCustomerDataFile = async (fileUrl: string): Promise<CustomerData[]> => {
  try {
    console.log("Starting to process file from URL:", fileUrl);
    
    // Fetch the file from Storage URL
    const response = await fetch(fileUrl);
    console.log("File fetched, size:", response.headers.get('content-length'));
    
    const fileBlob = await response.blob();
    console.log("File blob created, size:", fileBlob.size);
    
    // Read the file as array buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    console.log("Array buffer created, size:", arrayBuffer.byteLength);
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log("Workbook parsed, sheets:", workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log("Data converted to JSON, rows:", data.length);
    
    // Process the data
    const processedData = processExcelData(data);
    console.log("Data processed, customers:", processedData.length);
    
    // Store in Firestore
    await storeCustomerData(processedData);
    console.log("Data stored in Firestore successfully");
    
    return processedData;
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error(`Failed to process customer data file: ${error}`);
  }
};

// Store processed customer data in Firestore
const storeCustomerData = async (customers: CustomerData[]): Promise<void> => {
  try {
    console.log(`Starting to store ${customers.length} customers in Firestore`);
    
    // Get a reference to the customers collection
    const customersCollection = collection(firestore, "customers");
    
    // Store each customer
    const promises = customers.map(async (customer, index) => {
      console.log(`Storing customer ${index + 1}:`, customer.customerId);
      return addDoc(customersCollection, {
        ...customer,
        lastPurchaseDate: customer.lastPurchaseDate ? customer.lastPurchaseDate : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(promises);
    console.log(`Successfully stored ${customers.length} customer records in Firestore`);
  } catch (error) {
    console.error("Error storing customer data:", error);
    throw new Error(`Failed to store customer data: ${error}`);
  }
};
