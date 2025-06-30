import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD1IUVaUj3nDzRJWoGZU4BlCYpo4pjcGQk';

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateCustomerInsights = async (customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this customer data and provide comprehensive churn insights:
    
    Customer: ${customerData.name || customerData.customer_name || 'Unknown'}
    Customer ID: ${customerData.customerId || customerData.customer_id}
    Email: ${customerData.email || 'Not provided'}
    Total Orders: ${customerData.purchaseCount || customerData.total_orders || 0}
    Total Spent: $${customerData.totalSpent || customerData.total_spent || 0}
    Average Order Value: $${customerData.avgOrderValue || 0}
    Risk Score: ${customerData.riskScore || customerData.risk_score || 'Not calculated'}
    Risk Level: ${customerData.segment || customerData.risk_level || 'Unknown'}
    Last Purchase: ${customerData.lastPurchaseDate || customerData.last_purchase_date || 'Unknown'}
    Days Since Last Purchase: ${customerData.daysSinceLastPurchase || customerData.days_since_last_purchase || 'Unknown'}
    
    Please provide a detailed analysis including:
    
    1. **Churn Risk Assessment** (High/Medium/Low with reasoning)
    2. **Key Risk Factors** (What's driving the churn risk)
    3. **Customer Value Analysis** (Their importance to the business)
    4. **Behavioral Patterns** (Purchase frequency, spending trends)
    5. **Retention Strategies** (3-4 specific actionable recommendations)
    6. **Urgency Level** (How quickly action should be taken)
    7. **Success Probability** (Likelihood of retention if action is taken)
    
    Format the response in clear sections with actionable insights for business use.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating customer insights:', error);
    throw error;
  }
};

export const generateChurnPrediction = async (customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    As an AI churn prediction expert, analyze this customer's likelihood to churn:
    
    Customer Profile:
    - Purchase History: ${customerData.purchaseCount || 0} orders
    - Total Revenue: $${customerData.totalSpent || 0}
    - Last Purchase: ${customerData.lastPurchaseDate || 'Unknown'}
    - Average Order Value: $${customerData.avgOrderValue || 0}
    - Customer Tenure: ${customerData.customerTenure || 'Unknown'}
    - Risk Score: ${customerData.riskScore || 'Not calculated'}
    
    Provide a churn prediction analysis with:
    
    1. **Churn Probability**: Percentage likelihood (0-100%)
    2. **Time Frame**: When churn might occur (days/weeks/months)
    3. **Primary Indicators**: Top 3 factors suggesting churn risk
    4. **Protective Factors**: What's keeping them engaged
    5. **Intervention Window**: Best time to take action
    6. **Recommended Actions**: Immediate steps to prevent churn
    
    Be specific and data-driven in your analysis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating churn prediction:', error);
    throw error;
  }
};

export const generateDataSummary = async (customers: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const totalCustomers = customers.length;
    const highRiskCount = customers.filter(c => 
      (c.riskScore >= 70) || (c.risk_level === 'High') || (c.segment === 'high-risk')
    ).length;
    const mediumRiskCount = customers.filter(c => 
      ((c.riskScore >= 30 && c.riskScore < 70) || (c.risk_level === 'Medium') || (c.segment === 'medium-risk'))
    ).length;
    const lowRiskCount = customers.filter(c => 
      (c.riskScore < 30) || (c.risk_level === 'Low') || (c.segment === 'low-risk')
    ).length;
    
    const avgRiskScore = customers.reduce((sum, c) => sum + (c.riskScore || c.risk_score || 0), 0) / totalCustomers;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / totalCustomers;
    
    const recentCustomers = customers.filter(c => {
      const lastPurchase = c.lastPurchaseDate || c.last_purchase_date;
      if (!lastPurchase) return false;
      const daysSince = Math.floor((Date.now() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 30;
    }).length;

    const prompt = `
    Analyze this customer portfolio and provide executive-level churn insights:
    
    Portfolio Overview:
    - Total Customers: ${totalCustomers}
    - High Risk Customers: ${highRiskCount} (${((highRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Medium Risk Customers: ${mediumRiskCount} (${((mediumRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Low Risk Customers: ${lowRiskCount} (${((lowRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Average Risk Score: ${avgRiskScore.toFixed(2)}
    - Total Portfolio Value: $${totalRevenue.toLocaleString()}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    - Recently Active Customers: ${recentCustomers} (last 30 days)
    
    Provide a comprehensive analysis including:
    
    1. **Portfolio Health Score** (1-10 with explanation)
    2. **Churn Risk Assessment** (Overall risk level and trends)
    3. **Revenue at Risk** (Estimated revenue loss from potential churn)
    4. **Critical Issues** (Top 3 areas requiring immediate attention)
    5. **Strategic Opportunities** (Ways to improve retention)
    6. **30-Day Action Plan** (Specific steps for the next month)
    7. **90-Day Roadmap** (Medium-term retention strategy)
    8. **Success Metrics** (KPIs to track improvement)
    
    Focus on actionable insights that can drive business decisions and improve customer retention.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating data summary:', error);
    throw error;
  }
};

export const generateRetentionStrategy = async (customerSegment: string, customers: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const segmentCustomers = customers.filter(c => 
      c.segment === customerSegment || c.risk_level === customerSegment
    );
    
    const avgSpent = segmentCustomers.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0) / segmentCustomers.length;
    const avgOrders = segmentCustomers.reduce((sum, c) => sum + (c.purchaseCount || c.total_orders || 0), 0) / segmentCustomers.length;
    
    const prompt = `
    Create a targeted retention strategy for ${customerSegment} customers:
    
    Segment Analysis:
    - Customer Count: ${segmentCustomers.length}
    - Average Spent: $${avgSpent.toFixed(2)}
    - Average Orders: ${avgOrders.toFixed(1)}
    - Risk Level: ${customerSegment}
    
    Develop a comprehensive retention strategy including:
    
    1. **Segment Characteristics** (Key traits and behaviors)
    2. **Retention Challenges** (Why they might churn)
    3. **Engagement Tactics** (How to re-engage them)
    4. **Personalization Approach** (Tailored messaging and offers)
    5. **Channel Strategy** (Best communication methods)
    6. **Timeline** (When to execute each tactic)
    7. **Success Metrics** (How to measure effectiveness)
    8. **Budget Considerations** (Cost-effective approaches)
    
    Provide specific, actionable recommendations that can be implemented immediately.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating retention strategy:', error);
    throw error;
  }
};

export const analyzeFileStructure = async (fileData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this customer data file structure and content for churn analysis processing:
    
    ${JSON.stringify(fileData, null, 2)}
    
    Please provide:
    1. **Data Quality Assessment** (Overall quality score 1-10)
    2. **Churn Analysis Readiness** (Can we perform effective churn analysis?)
    3. **Missing Critical Fields** (What's needed for better churn prediction)
    4. **Data Enrichment Suggestions** (How to improve the dataset)
    5. **Processing Recommendations** (Best practices for import)
    6. **Column Mapping** (Suggested field mappings)
    7. **Potential Issues** (Problems that might affect analysis)
    8. **Enhancement Opportunities** (Ways to get better insights)
    
    Focus on optimizing the data for customer churn analysis and retention insights.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing file structure:', error);
    throw error;
  }
};

export const generateChurnReport = async (timeframe: string, customers: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const now = new Date();
    const daysBack = parseInt(timeframe);
    const periodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const recentChurners = customers.filter(c => {
      const lastPurchase = c.lastPurchaseDate || c.last_purchase_date;
      if (!lastPurchase) return false;
      const lastPurchaseDate = new Date(lastPurchase);
      return lastPurchaseDate < periodStart && (c.riskScore >= 70 || c.segment === 'high-risk');
    });
    
    const atRiskRevenue = customers
      .filter(c => c.riskScore >= 70 || c.segment === 'high-risk')
      .reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);

    const prompt = `
    Generate a comprehensive churn analysis report for the last ${timeframe} days:
    
    Report Data:
    - Analysis Period: ${timeframe} days
    - Total Customers: ${customers.length}
    - High Risk Customers: ${customers.filter(c => c.riskScore >= 70 || c.segment === 'high-risk').length}
    - Potential Churners: ${recentChurners.length}
    - Revenue at Risk: $${atRiskRevenue.toLocaleString()}
    - Average Risk Score: ${(customers.reduce((sum, c) => sum + (c.riskScore || 0), 0) / customers.length).toFixed(2)}
    
    Create a detailed report with:
    
    1. **Executive Summary** (Key findings and recommendations)
    2. **Churn Trends** (Patterns and changes over time)
    3. **Risk Segmentation** (Breakdown by risk levels)
    4. **Financial Impact** (Revenue implications)
    5. **Root Cause Analysis** (Why customers are churning)
    6. **Intervention Opportunities** (Where to focus efforts)
    7. **Predictive Insights** (Future churn predictions)
    8. **Action Plan** (Immediate and long-term strategies)
    9. **Success Metrics** (KPIs to track)
    10. **Next Steps** (Specific recommendations)
    
    Make it executive-ready with clear insights and actionable recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating churn report:', error);
    throw error;
  }
};

export const generateDataChatResponse = async (question: string, customerData: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare data summary for the AI
    const totalCustomers = customerData.length;
    const highRiskCount = customerData.filter(c => (c.riskScore >= 70) || (c.segment === 'high-risk')).length;
    const mediumRiskCount = customerData.filter(c => ((c.riskScore >= 30 && c.riskScore < 70) || (c.segment === 'medium-risk'))).length;
    const lowRiskCount = customerData.filter(c => (c.riskScore < 30) || (c.segment === 'low-risk')).length;
    
    const totalRevenue = customerData.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgOrderValue = customerData.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / totalCustomers;
    const avgRiskScore = customerData.reduce((sum, c) => sum + (c.riskScore || 0), 0) / totalCustomers;
    
    // Get sample data for context
    const sampleCustomers = customerData.slice(0, 5).map(c => ({
      id: c.customerId,
      name: c.name,
      email: c.email,
      riskScore: c.riskScore,
      segment: c.segment,
      totalSpent: c.totalSpent,
      purchaseCount: c.purchaseCount,
      lastPurchaseDate: c.lastPurchaseDate
    }));
    
    const prompt = `
    You are an expert data analyst for a customer retention platform. A user is asking a question about their customer data. 
    
    IMPORTANT INSTRUCTIONS:
    - Answer ONLY based on the provided customer data
    - Be specific and provide exact numbers when possible
    - If the data doesn't contain the information needed to answer the question, say so clearly
    - Format your response in a clear, conversational way
    - Include relevant insights and recommendations when appropriate
    - Use bullet points or numbered lists for clarity when listing multiple items
    
    CUSTOMER DATA SUMMARY:
    - Total Customers: ${totalCustomers}
    - High Risk Customers: ${highRiskCount} (${((highRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Medium Risk Customers: ${mediumRiskCount} (${((mediumRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Low Risk Customers: ${lowRiskCount} (${((lowRiskCount/totalCustomers)*100).toFixed(1)}%)
    - Total Revenue: $${totalRevenue.toLocaleString()}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    - Average Risk Score: ${avgRiskScore.toFixed(1)}
    
    SAMPLE CUSTOMER RECORDS:
    ${JSON.stringify(sampleCustomers, null, 2)}
    
    AVAILABLE DATA FIELDS:
    - Customer ID, Name, Email
    - Risk Score (0-100), Segment (low-risk, medium-risk, high-risk)
    - Total Spent, Purchase Count, Average Order Value
    - Last Purchase Date
    - Age, Gender, Tenure
    - Usage Frequency, Support Calls, Payment Delay
    - Subscription Type
    
    USER QUESTION: "${question}"
    
    Please analyze the data and provide a helpful, accurate response based on the customer data provided.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating data chat response:', error);
    throw error;
  }
};