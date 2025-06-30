
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD1IUVaUj3nDzRJWoGZU4BlCYpo4pjcGQk';
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateEnhancedCustomerInsights = async (customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Calculate additional metrics for context
    const daysSinceLastPurchase = customerData.lastPurchaseDate 
      ? Math.floor((Date.now() - new Date(customerData.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const purchaseFrequency = customerData.purchaseCount && customerData.tenure 
      ? (customerData.purchaseCount / (customerData.tenure / 12)).toFixed(2)
      : null;
    
    const prompt = `
    You are an expert data scientist specializing in customer churn prediction and retention analytics. Analyze this customer's data with extreme precision and provide actionable insights.

    CUSTOMER DATA ANALYSIS:
    Customer ID: ${customerData.customerId || customerData.customer_id}
    Name: ${customerData.name || 'Not provided'}
    Email: ${customerData.email || 'Not provided'}
    
    PURCHASE BEHAVIOR METRICS:
    - Total Orders: ${customerData.purchaseCount || 0}
    - Total Spent: $${customerData.totalSpent || 0}
    - Average Order Value: $${customerData.avgOrderValue || 0}
    - Last Purchase: ${customerData.lastPurchaseDate || 'Never'}
    - Days Since Last Purchase: ${daysSinceLastPurchase || 'Unknown'}
    - Purchase Frequency: ${purchaseFrequency ? purchaseFrequency + ' orders/year' : 'Unknown'}
    
    RISK ASSESSMENT:
    - Risk Score: ${customerData.riskScore || customerData.risk_score || 'Not calculated'}/100
    - Risk Segment: ${customerData.segment || customerData.risk_level || 'Unknown'}
    
    CUSTOMER PROFILE:
    - Age: ${customerData.age || 'Unknown'}
    - Gender: ${customerData.gender || 'Unknown'}
    - Customer Tenure: ${customerData.tenure ? customerData.tenure + ' months' : 'Unknown'}
    - Subscription Type: ${customerData.subscriptionType || 'Unknown'}
    
    BEHAVIORAL INDICATORS:
    - Usage Frequency: ${customerData.usageFrequency || 'Unknown'}
    - Support Calls: ${customerData.supportCalls || 0}
    - Payment Delays: ${customerData.paymentDelay || 0} days average
    
    ANALYSIS REQUIREMENTS:
    
    1. **CHURN PROBABILITY ASSESSMENT** (Be specific with percentage based on data)
       - Calculate precise churn probability using the provided risk score and behavioral patterns
       - Explain the mathematical reasoning behind your assessment
       - Compare against industry benchmarks if relevant patterns exist
    
    2. **KEY RISK FACTORS IDENTIFICATION** (Rank by impact)
       - Identify the top 3 risk factors from the actual data provided
       - Quantify the impact of each factor on churn probability
       - Explain why each factor is significant for this specific customer
    
    3. **CUSTOMER VALUE ANALYSIS** (Financial impact assessment)
       - Calculate lifetime value based on purchase history and frequency
       - Estimate revenue at risk if customer churns
       - Assess the cost-benefit of retention efforts for this customer
    
    4. **BEHAVIORAL PATTERN ANALYSIS** (Data-driven insights)
       - Analyze purchase patterns and identify concerning trends
       - Evaluate engagement levels based on usage and support data
       - Identify positive indicators that suggest retention potential
    
    5. **TARGETED RETENTION STRATEGY** (Specific to this customer)
       - Recommend 3-4 specific actions based on the customer's profile
       - Prioritize recommendations by expected impact and feasibility
       - Suggest timing for each intervention based on urgency level
    
    6. **SUCCESS PROBABILITY** (Evidence-based prediction)
       - Estimate the likelihood of successful retention
       - Identify factors that would improve retention chances
       - Suggest metrics to track intervention effectiveness
    
    CRITICAL INSTRUCTIONS:
    - Base ALL analysis STRICTLY on the provided data points
    - Use quantitative reasoning wherever possible
    - Do NOT make assumptions beyond what the data supports
    - Provide specific, actionable recommendations
    - Include confidence levels for your predictions
    - Explain your reasoning process for each conclusion
    
    Format your response with clear sections and bullet points for actionability.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating enhanced customer insights:', error);
    throw error;
  }
};

export const generateEnhancedPortfolioAnalysis = async (customers: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Calculate comprehensive portfolio metrics
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / totalCustomers;
    const avgRiskScore = customers.reduce((sum, c) => sum + (c.riskScore || c.risk_score || 0), 0) / totalCustomers;
    
    // Risk distribution analysis
    const highRisk = customers.filter(c => (c.riskScore || c.risk_score || 0) >= 70);
    const mediumRisk = customers.filter(c => {
      const score = c.riskScore || c.risk_score || 0;
      return score >= 30 && score < 70;
    });
    const lowRisk = customers.filter(c => (c.riskScore || c.risk_score || 0) < 30);
    
    // Revenue at risk calculation
    const revenueAtRisk = highRisk.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const revenueAtRiskPercentage = ((revenueAtRisk / totalRevenue) * 100).toFixed(1);
    
    // Customer lifecycle analysis
    const recentlyActive = customers.filter(c => {
      const lastPurchase = c.lastPurchaseDate || c.last_purchase_date;
      if (!lastPurchase) return false;
      const daysSince = Math.floor((Date.now() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 30;
    });
    
    const dormantCustomers = customers.filter(c => {
      const lastPurchase = c.lastPurchaseDate || c.last_purchase_date;
      if (!lastPurchase) return true;
      const daysSince = Math.floor((Date.now() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    });
    
    // Data quality assessment
    const avgDataQuality = customers.reduce((sum, c) => {
      let quality = 0;
      if (c.customer_id || c.customerId) quality += 20;
      if (c.email) quality += 20;
      if (c.last_purchase_date || c.lastPurchaseDate) quality += 20;
      if ((c.purchase_count || c.purchaseCount) !== undefined) quality += 20;
      if ((c.total_spent || c.totalSpent) !== undefined) quality += 20;
      return sum + quality;
    }, 0) / totalCustomers;

    const prompt = `
    You are a senior customer analytics consultant providing strategic insights to C-level executives. Analyze this customer portfolio with the precision and depth expected for board-level decision making.

    PORTFOLIO OVERVIEW:
    - Total Customers: ${totalCustomers.toLocaleString()}
    - Total Portfolio Value: $${totalRevenue.toLocaleString()}
    - Average Customer Value: $${(totalRevenue / totalCustomers).toFixed(2)}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    - Average Risk Score: ${avgRiskScore.toFixed(1)}/100
    - Portfolio Data Quality: ${avgDataQuality.toFixed(1)}%
    
    RISK SEGMENTATION:
    - High Risk: ${highRisk.length} customers (${((highRisk.length / totalCustomers) * 100).toFixed(1)}%)
    - Medium Risk: ${mediumRisk.length} customers (${((mediumRisk.length / totalCustomers) * 100).toFixed(1)}%)
    - Low Risk: ${lowRisk.length} customers (${((lowRisk.length / totalCustomers) * 100).toFixed(1)}%)
    
    FINANCIAL IMPACT:
    - Revenue at Risk: $${revenueAtRisk.toLocaleString()} (${revenueAtRiskPercentage}%)
    - Average High-Risk Customer Value: $${highRisk.length > 0 ? (revenueAtRisk / highRisk.length).toFixed(2) : '0'}
    
    CUSTOMER LIFECYCLE:
    - Recently Active (30 days): ${recentlyActive.length} (${((recentlyActive.length / totalCustomers) * 100).toFixed(1)}%)
    - Dormant (90+ days): ${dormantCustomers.length} (${((dormantCustomers.length / totalCustomers) * 100).toFixed(1)}%)
    
    EXECUTIVE ANALYSIS REQUIRED:
    
    1. **PORTFOLIO HEALTH ASSESSMENT** (Score 1-10 with justification)
       - Provide an overall health score based on risk distribution and financial metrics
       - Compare against industry benchmarks and best practices
       - Identify the most critical health indicators
    
    2. **STRATEGIC RISK ANALYSIS**
       - Quantify the immediate financial impact of potential churn
       - Assess the portfolio's resilience to customer loss
       - Identify systemic risks affecting multiple customer segments
    
    3. **REVENUE OPTIMIZATION OPPORTUNITIES**
       - Calculate potential revenue recovery through targeted retention
       - Identify underperforming segments with growth potential
       - Recommend portfolio rebalancing strategies
    
    4. **OPERATIONAL PRIORITIES** (90-day action plan)
       - Rank interventions by ROI and feasibility
       - Specify resource allocation recommendations
       - Define success metrics and monitoring frameworks
    
    5. **STRATEGIC RECOMMENDATIONS**
       - Long-term customer acquisition strategy adjustments
       - Product/service improvements based on churn patterns
       - Investment priorities for customer success initiatives
    
    6. **COMPETITIVE POSITIONING**
       - Assess customer retention capability vs. industry standards
       - Identify competitive vulnerabilities in the customer base
       - Recommend defensive and offensive strategies
    
    DELIVERABLE REQUIREMENTS:
    - Executive summary suitable for board presentation
    - Quantified business impact for all recommendations
    - Risk-adjusted ROI calculations where applicable
    - Clear prioritization with timelines and resource needs
    - Measurable success criteria for each initiative
    
    Present findings with the analytical rigor expected for strategic decision-making at the highest organizational levels.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating enhanced portfolio analysis:', error);
    throw error;
  }
};
