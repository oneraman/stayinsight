/**
 * This file redirects to the new Lovable AI implementation
 * @deprecated Use src/lib/lovableAI.ts instead
 */
import { 
  generateCustomerInsights as lovableGenerateCustomerInsights,
  generateChurnPrediction as lovableGenerateChurnPrediction,
  generatePortfolioAnalysis as lovableGeneratePortfolioAnalysis
} from './lovableAI';

export const generateCustomerInsights = async (customerData: any) => {
  return await lovableGenerateCustomerInsights(customerData);
};

export const generateChurnPrediction = async (customerData: any) => {
  return await lovableGenerateChurnPrediction(customerData);
};

export const generateDataSummary = async (customers: any[]) => {
  return await lovableGeneratePortfolioAnalysis(customers);
};

export const generateRetentionStrategy = async (customerSegment: string, customers: any[]) => {
  return await lovableGeneratePortfolioAnalysis(customers);
};

export const analyzeFileStructure = async (fileData: any) => {
  // Simplified - no longer using direct Gemini API
  return "File structure analysis has been moved to the new processing pipeline.";
};
