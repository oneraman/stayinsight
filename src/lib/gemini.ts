import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD1IUVaUj3nDzRJWoGZU4BlCYpo4pjcGQk';

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateCustomerInsights = async (customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    IMPORTANT: Base your analysis STRICTLY on the provided customer data. Do NOT make up information or provide generic insights. Use ONLY the data points provided below to draw conclusions.
    
    Analyze this specific customer data and provide data-driven churn insights:
    
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
    Age: ${customerData.age || 'Unknown'}
    Gender: ${customerData.gender || 'Unknown'}
    Tenure: ${customerData.tenure || 'Unknown'}
    Usage Frequency: ${customerData.usageFrequency || 'Unknown'}
    Support Calls: ${customerData.supportCalls || 0}
    Payment Delay: ${customerData.paymentDelay || 0}
    Subscription Type: ${customerData.subscriptionType || 'Unknown'}
    
    Please provide a detailed analysis including:
    
    1. **Churn Risk Assessment** (High/Medium/Low)
       - ONLY use the provided risk score (${customerData.riskScore || customerData.risk_score || 'Unknown'}) and segment (${customerData.segment || customerData.risk_level || 'Unknown'}) to determine this
       - Explain how you arrived at this assessment using the specific data points
    
    2. **Key Risk Factors** 
       - List the SPECIFIC data points from this customer that indicate risk
       - For each factor, cite the exact value and explain why it's concerning
       - Do NOT include factors that aren't supported by the provided data
    
    3. **Customer Value Analysis**
       - Calculate and state the exact lifetime value based on the provided total spent ($${customerData.totalSpent || customerData.total_spent || 0})
       - Compare to average values only if provided in the data
    
    4. **Behavioral Patterns**
       - Analyze purchase frequency (${customerData.purchaseCount || customerData.total_orders || 0} orders)
       - Analyze spending patterns based on total spent and average order value
       - Only mention patterns that can be directly observed from the provided data
    
    5. **Retention Strategies**
       - Recommend 3-4 specific actions based ONLY on the data points provided
       - For each recommendation, cite which specific data point(s) led to this suggestion
    
    6. **Urgency Level** (High/Medium/Low)
       - Base this strictly on risk score, days since last purchase, and other provided metrics
       - Explain your reasoning using the specific values
    
    7. **Success Probability**
       - Estimate retention likelihood based on the specific data provided
       - Explain which data points support your conclusion
    
    Format the response in clear sections with actionable insights. Remember to ONLY use the data provided - do not make assumptions or provide generic advice that isn't supported by this specific customer's data.
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
    IMPORTANT: Base your analysis STRICTLY on the provided customer data. Do NOT make up information or provide generic insights. Use ONLY the data points provided below to draw conclusions.
    
    As an AI churn prediction expert, analyze this specific customer's likelihood to churn using ONLY the data provided:
    
    Customer Profile:
    - Customer ID: ${customerData.customerId || customerData.customer_id || 'Unknown'}
    - Name: ${customerData.name || customerData.customer_name || 'Unknown'}
    - Purchase History: ${customerData.purchaseCount || 0} orders
    - Total Revenue: $${customerData.totalSpent || 0}
    - Last Purchase: ${customerData.lastPurchaseDate || 'Unknown'}
    - Average Order Value: $${customerData.avgOrderValue || 0}
    - Customer Tenure: ${customerData.tenure || 'Unknown'}
    - Risk Score: ${customerData.riskScore || 'Not calculated'}
    - Segment: ${customerData.segment || 'Unknown'}
    - Age: ${customerData.age || 'Unknown'}
    - Gender: ${customerData.gender || 'Unknown'}
    - Usage Frequency: ${customerData.usageFrequency || 'Unknown'}
    - Support Calls: ${customerData.supportCalls || 0}
    - Payment Delay: ${customerData.paymentDelay || 0}
    - Subscription Type: ${customerData.subscriptionType || 'Unknown'}
    
    Provide a churn prediction analysis with:
    
    1. **Churn Probability**: 
       - Calculate a percentage (0-100%) based DIRECTLY on the risk score (${customerData.riskScore || 'Unknown'})
       - If risk score is unavailable, use segment and other metrics to estimate
       - Explain exactly how you arrived at this percentage using the data
    
    2. **Time Frame**: 
       - Estimate when churn might occur based on last purchase date and purchase frequency
       - Cite the specific data points that informed this estimate
       - If insufficient data, clearly state this rather than making up a timeframe
    
    3. **Primary Indicators**: 
       - List the top 3 factors from the provided data that suggest churn risk
       - For each factor, cite the exact value and explain why it's concerning
       - Only include factors that are present in the provided data
    
    4. **Protective Factors**: 
       - Identify specific data points that suggest customer loyalty
       - Only include factors that are present in the provided data
       - If no protective factors exist in the data, state this clearly
    
    5. **Intervention Window**: 
       - Based on the data, recommend the best timeframe to take action
       - Explain which specific data points informed this recommendation
    
    6. **Recommended Actions**: 
       - Suggest 3-4 specific interventions based ONLY on the data provided
       - For each recommendation, explain which data point(s) led to this suggestion
    
    Be specific and data-driven in your analysis. Do NOT include insights that cannot be directly derived from the provided customer data. If certain information is missing, acknowledge the limitations rather than making assumptions.
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
    IMPORTANT: Base your analysis STRICTLY on the provided customer portfolio data. Do NOT make up information or provide generic insights. Use ONLY the data points provided below to draw conclusions.
    
    Analyze this specific customer portfolio and provide executive-level churn insights based ONLY on the following data:
    
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
    
    1. **Portfolio Health Score** (1-10)
       - Calculate this score based DIRECTLY on the risk distribution (${highRiskCount}/${mediumRiskCount}/${lowRiskCount})
       - Explain exactly how you arrived at this score using the specific numbers provided
    
    2. **Churn Risk Assessment**
       - Use the exact percentages of high/medium/low risk customers provided above
       - Calculate the overall churn risk based on these specific numbers
       - Do NOT make up trends - only state what can be directly inferred from the data
    
    3. **Revenue at Risk**
       - Calculate this based on the high-risk percentage (${((highRiskCount/totalCustomers)*100).toFixed(1)}%) and total portfolio value ($${totalRevenue.toLocaleString()})
       - Show your calculation and explain your reasoning
    
    4. **Critical Issues**
       - Identify issues based ONLY on the data provided
       - For each issue, cite the specific data point(s) that indicate this problem
    
    5. **Strategic Opportunities**
       - Recommend strategies based ONLY on the risk distribution and customer activity data
       - For each opportunity, explain which specific data point led to this recommendation
    
    6. **30-Day Action Plan**
       - Suggest actions based ONLY on the data provided
       - Prioritize actions based on the risk distribution and revenue figures
    
    7. **90-Day Roadmap**
       - Outline medium-term strategies based ONLY on the portfolio metrics provided
       - For each strategy, cite which specific data point(s) informed this recommendation
    
    8. **Success Metrics**
       - Recommend KPIs that directly relate to the data points provided
       - Explain how each KPI connects to the specific portfolio metrics
    
    Focus on actionable insights that can drive business decisions and improve customer retention. Base ALL your analysis and recommendations STRICTLY on the data provided - do not make assumptions or provide generic advice that isn't supported by the specific numbers in this portfolio.
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
    const avgRiskScore = segmentCustomers.reduce((sum, c) => sum + (c.riskScore || c.risk_score || 0), 0) / segmentCustomers.length;
    
    // Calculate additional metrics for more accurate insights
    const avgAge = segmentCustomers.reduce((sum, c) => sum + (c.age || 0), 0) / segmentCustomers.filter(c => c.age).length || 'Unknown';
    const avgTenure = segmentCustomers.reduce((sum, c) => sum + (c.tenure || 0), 0) / segmentCustomers.filter(c => c.tenure).length || 'Unknown';
    const avgSupportCalls = segmentCustomers.reduce((sum, c) => sum + (c.supportCalls || 0), 0) / segmentCustomers.length || 0;
    
    // Get subscription type distribution
    const subscriptionTypes = segmentCustomers
      .filter(c => c.subscriptionType)
      .reduce((acc, c) => {
        acc[c.subscriptionType] = (acc[c.subscriptionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const prompt = `
    IMPORTANT: Base your strategy STRICTLY on the provided customer segment data. Do NOT make up information or provide generic insights. Use ONLY the data points provided below to develop your strategy.
    
    Create a targeted retention strategy for ${customerSegment} customers based ONLY on this specific data:
    
    Segment Analysis:
    - Customer Count: ${segmentCustomers.length}
    - Average Spent: $${avgSpent.toFixed(2)}
    - Average Orders: ${avgOrders.toFixed(1)}
    - Average Risk Score: ${avgRiskScore.toFixed(1)}
    - Risk Level: ${customerSegment}
    - Average Age: ${avgAge !== 'Unknown' ? avgAge.toFixed(1) : 'Unknown'}
    - Average Tenure: ${avgTenure !== 'Unknown' ? avgTenure.toFixed(1) + ' months' : 'Unknown'}
    - Average Support Calls: ${avgSupportCalls.toFixed(1)}
    - Subscription Types: ${Object.entries(subscriptionTypes).map(([type, count]) => `${type} (${count})`).join(', ') || 'Unknown'}
    
    Develop a comprehensive retention strategy including:
    
    1. **Segment Characteristics**
       - Describe this segment using ONLY the metrics provided above
       - Highlight the most significant data points that define this segment
       - Do NOT include characteristics that aren't supported by the data
    
    2. **Retention Challenges**
       - Identify specific challenges based ONLY on the provided metrics
       - For each challenge, cite the exact data point(s) that indicate this issue
       - Explain how each metric contributes to churn risk
    
    3. **Engagement Tactics**
       - Recommend specific tactics based on the segment's metrics
       - For each tactic, explain which data point(s) informed this recommendation
       - Prioritize tactics based on the segment's specific characteristics
    
    4. **Personalization Approach**
       - Suggest personalization strategies based on the available demographic data
       - Only include approaches that are supported by the data provided
    
    5. **Channel Strategy**
       - Recommend communication channels based on the segment's characteristics
       - Explain which specific data points informed these recommendations
    
    6. **Timeline**
       - Propose an implementation timeline based on the segment's risk level (${customerSegment})
       - Prioritize actions based on the average risk score (${avgRiskScore.toFixed(1)})
    
    7. **Success Metrics**
       - Suggest KPIs that directly relate to the segment's characteristics
       - For each KPI, explain how it connects to the specific segment metrics
    
    8. **Budget Considerations**
       - Recommend budget allocation based on the segment's value ($${avgSpent.toFixed(2)} average spent)
       - Justify your recommendations using the specific financial metrics provided
    
    Provide specific, actionable recommendations that can be implemented immediately. Base ALL your analysis and recommendations STRICTLY on the data provided - do not make assumptions or provide generic advice that isn't supported by the specific numbers for this segment.
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
    IMPORTANT: Base your analysis STRICTLY on the provided file structure data. Do NOT make up information or provide generic insights. Use ONLY the data provided below to draw conclusions.
    
    Analyze this specific customer data file structure and content for churn analysis processing:
    
    ${JSON.stringify(fileData, null, 2)}
    
    Please provide:
    
    1. **Data Quality Assessment** (1-10)
       - Score the data quality based ONLY on the provided file structure
       - Explain exactly how you arrived at this score using specific observations
    
    2. **Churn Analysis Readiness**
       - Determine if the data contains sufficient information for churn analysis
       - List the specific fields present that are useful for churn prediction
       - Identify which critical fields are missing, if any
    
    3. **Missing Critical Fields**
       - List any essential fields for churn analysis that are absent
       - For each missing field, explain why it's important
    
    4. **Data Enrichment Suggestions**
       - Recommend specific additional data points that would improve analysis
       - Explain how each suggestion would enhance churn prediction
    
    5. **Processing Recommendations**
       - Provide specific guidance for importing this exact file structure
       - Address any formatting or structure issues visible in the data
    
    6. **Column Mapping**
       - Suggest mappings between the file's columns and standard churn analysis fields
       - Only include columns that actually exist in the provided data
    
    7. **Potential Issues**
       - Identify specific problems in the data structure that might affect analysis
       - For each issue, cite the exact observation from the file structure
    
    8. **Enhancement Opportunities**
       - Suggest specific ways to improve this exact dataset
       - Explain how each enhancement would benefit churn analysis
    
    Focus on optimizing the data for customer churn analysis and retention insights. Base ALL your analysis and recommendations STRICTLY on the data provided - do not make assumptions or provide generic advice that isn't supported by the specific file structure shown.
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
      
    // Calculate additional metrics for more accurate insights
    const avgRiskScore = customers.reduce((sum, c) => sum + (c.riskScore || 0), 0) / customers.length;
    const highRiskPercentage = (customers.filter(c => c.riskScore >= 70 || c.segment === 'high-risk').length / customers.length) * 100;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / customers.length;

    const prompt = `
    IMPORTANT: Base your report STRICTLY on the provided customer data. Do NOT make up information or provide generic insights. Use ONLY the data points provided below to draw conclusions.
    
    Generate a comprehensive churn analysis report for the last ${timeframe} days based ONLY on this specific data:
    
    Report Data:
    - Analysis Period: ${timeframe} days
    - Total Customers: ${customers.length}
    - High Risk Customers: ${customers.filter(c => c.riskScore >= 70 || c.segment === 'high-risk').length} (${highRiskPercentage.toFixed(1)}%)
    - Potential Churners: ${recentChurners.length}
    - Revenue at Risk: $${atRiskRevenue.toLocaleString()}
    - Average Risk Score: ${avgRiskScore.toFixed(2)}
    - Total Portfolio Revenue: $${totalRevenue.toLocaleString()}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    
    Create a detailed report with:
    
    1. **Executive Summary**
       - Summarize the key findings based ONLY on the metrics provided above
       - Highlight the most significant insights from the data
       - Do NOT include information that isn't supported by the provided metrics
    
    2. **Churn Trends**
       - Analyze the current churn risk based on the provided metrics
       - Calculate the percentage of high-risk customers (${highRiskPercentage.toFixed(1)}%)
       - Do NOT make claims about trends over time unless that data is provided
    
    3. **Risk Segmentation**
       - Break down the customer base using the exact numbers provided
       - Calculate the percentage of customers in each risk segment
       - Analyze what these specific numbers mean for the business
    
    4. **Financial Impact**
       - Calculate the potential revenue loss based on the at-risk revenue ($${atRiskRevenue.toLocaleString()})
       - Express this as a percentage of total portfolio revenue
       - Explain the business implications of these specific figures
    
    5. **Root Cause Analysis**
       - Identify potential churn causes based ONLY on the available data
       - For each cause, cite the specific metrics that support this conclusion
       - Do NOT speculate on causes that aren't supported by the data
    
    6. **Intervention Opportunities**
       - Recommend specific interventions based on the risk distribution
       - Prioritize interventions based on the revenue at risk
       - For each recommendation, explain which data point(s) informed it
    
    7. **Predictive Insights**
       - Make predictions based ONLY on the current data snapshot
       - Be clear about the limitations of these predictions given the available data
    
    8. **Action Plan**
       - Suggest specific actions based on the risk distribution and revenue figures
       - Prioritize actions based on potential impact on the at-risk revenue
    
    9. **Success Metrics**
       - Recommend KPIs that directly relate to the provided metrics
       - Explain how each KPI connects to the specific data points
    
    10. **Next Steps**
        - Provide specific recommendations based ONLY on the data provided
        - Prioritize recommendations based on the risk distribution and revenue figures
    
    Make it executive-ready with clear insights and actionable recommendations. Base ALL your analysis and recommendations STRICTLY on the data provided - do not make assumptions or provide generic advice that isn't supported by the specific numbers in this report.
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