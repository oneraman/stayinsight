// Customer data interface - keeping only the interface for compatibility
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
  // Additional fields for enhanced analysis
  age?: number;
  gender?: string;
  tenure?: number;
  usageFrequency?: string;
  supportCalls?: number;
  paymentDelay?: number;
  subscriptionType?: string;
}

// Note: All file processing functionality has been moved to supabaseDataProcessor.ts
// This file now only contains the CustomerData interface for compatibility