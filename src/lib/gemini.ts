
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDlpRe9eVvkCEeUXoLVN--a6IRlhfa8rIo';

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateCustomerInsights = async (customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this customer data and provide business insights:
    
    Customer: ${customerData.customer_name}
    Total Orders: ${customerData.total_orders}
    Total Spent: $${customerData.total_spent}
    Risk Score: ${customerData.risk_score}
    Risk Level: ${customerData.risk_level}
    Last Purchase: ${customerData.last_purchase_date}
    Days Since Last Purchase: ${customerData.days_since_last_purchase}
    
    Please provide:
    1. A brief risk assessment summary
    2. 2-3 specific retention strategies
    3. Key factors contributing to their risk level
    
    Keep the response concise and actionable for business use.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating customer insights:', error);
    throw error;
  }
};

export const generateDataSummary = async (customers: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const totalCustomers = customers.length;
    const highRiskCount = customers.filter(c => c.risk_level === 'High').length;
    const mediumRiskCount = customers.filter(c => c.risk_level === 'Medium').length;
    const lowRiskCount = customers.filter(c => c.risk_level === 'Low').length;
    const avgRiskScore = customers.reduce((sum, c) => sum + c.risk_score, 0) / totalCustomers;
    
    const prompt = `
    Analyze this customer portfolio summary and provide executive insights:
    
    Total Customers: ${totalCustomers}
    High Risk: ${highRiskCount} customers
    Medium Risk: ${mediumRiskCount} customers
    Low Risk: ${lowRiskCount} customers
    Average Risk Score: ${avgRiskScore.toFixed(2)}
    
    Please provide:
    1. Overall portfolio health assessment
    2. Key areas of concern
    3. Top 3 strategic recommendations
    4. Priority actions for the next 30 days
    
    Keep it executive-level and actionable.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating data summary:', error);
    throw error;
  }
};
