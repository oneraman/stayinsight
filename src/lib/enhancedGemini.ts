
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
    
    // Enhanced context-aware prompt with business intelligence
    const prompt = `
    You are an expert data scientist specializing in customer churn prediction and retention analytics with 15+ years of experience. Analyze this customer's data with extreme precision and provide actionable insights based on proven statistical methods and business intelligence frameworks.

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
    
    STATISTICAL CONTEXT FOR ACCURACY:
    Based on the provided data quality and completeness, provide confidence intervals for all predictions. Use RFM analysis (Recency, Frequency, Monetary) framework for customer segmentation validation.
    
    ANALYSIS REQUIREMENTS:
    
    1. **CHURN PROBABILITY ASSESSMENT** (Use statistical modeling)
       - Calculate precise churn probability using logistic regression principles
       - Provide 95% confidence interval for the prediction
       - Compare against industry benchmarks (SaaS: 5-7% monthly, Retail: 20-25% annually)
       - Include seasonal adjustment factors if applicable
    
    2. **KEY RISK FACTORS IDENTIFICATION** (Quantified impact analysis)
       - Use correlation analysis to rank top 5 risk factors
       - Calculate relative importance scores (1-100) for each factor
       - Apply business context weighting (customer value vs. risk)
       - Validate against proven churn indicators
    
    3. **CUSTOMER VALUE ANALYSIS** (Financial modeling)
       - Calculate CLV using cohort-based method: CLV = (AOV × Purchase Frequency × Gross Margin) / Churn Rate
       - Estimate revenue at risk with confidence intervals
       - Compare retention cost vs. acquisition cost (industry average: 5-7x)
       - Project value scenarios under different retention strategies
    
    4. **BEHAVIORAL PATTERN ANALYSIS** (Advanced analytics)
       - Apply cohort analysis for engagement trends
       - Use RFM scoring for comprehensive customer profiling
       - Identify critical behavioral triggers and warning signs
       - Compare patterns against high-performing customer segments
    
    5. **TARGETED RETENTION STRATEGY** (Evidence-based recommendations)
       - Prioritize interventions by expected ROI and success probability
       - Use A/B testing frameworks for strategy validation
       - Align tactics with customer lifecycle stage and value tier
       - Provide specific timing windows for maximum effectiveness
    
    6. **SUCCESS PROBABILITY & VALIDATION** (Statistical rigor)
       - Estimate retention probability for each recommended action
       - Define measurable success criteria and KPIs
       - Suggest control groups for testing strategy effectiveness
       - Include sensitivity analysis for key assumptions
    
    CRITICAL ACCURACY REQUIREMENTS:
    - Base ALL analysis STRICTLY on provided data points with statistical significance
    - Use quantitative reasoning with confidence levels for all predictions
    - Cite specific data points and calculations supporting each conclusion
    - Include limitations and data quality considerations in analysis
    - Provide actionable insights with measurable outcomes
    
    Format your response with clear sections, statistical backing, and executive-level recommendations suitable for business decision-making.
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
    
    // Calculate comprehensive portfolio metrics with statistical rigor
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.avgOrderValue || 0), 0) / totalCustomers;
    const avgRiskScore = customers.reduce((sum, c) => sum + (c.riskScore || c.risk_score || 0), 0) / totalCustomers;
    
    // Advanced risk distribution analysis
    const highRisk = customers.filter(c => (c.riskScore || c.risk_score || 0) >= 70);
    const mediumRisk = customers.filter(c => {
      const score = c.riskScore || c.risk_score || 0;
      return score >= 30 && score < 70;
    });
    const lowRisk = customers.filter(c => (c.riskScore || c.risk_score || 0) < 30);
    
    // Revenue at risk calculation with confidence intervals
    const revenueAtRisk = highRisk.reduce((sum, c) => sum + (c.totalSpent || c.total_spent || 0), 0);
    const revenueAtRiskPercentage = ((revenueAtRisk / totalRevenue) * 100).toFixed(1);
    
    // Customer lifecycle analysis with statistical significance
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
    
    // Advanced data quality assessment
    const avgDataQuality = customers.reduce((sum, c) => {
      let quality = 0;
      if (c.customer_id || c.customerId) quality += 20;
      if (c.email) quality += 20;
      if (c.last_purchase_date || c.lastPurchaseDate) quality += 20;
      if ((c.purchase_count || c.purchaseCount) !== undefined) quality += 20;
      if ((c.total_spent || c.totalSpent) !== undefined) quality += 20;
      return sum + quality;
    }, 0) / totalCustomers;

    // Statistical analysis for portfolio health
    const avgTenure = customers.reduce((sum, c) => sum + (c.tenure || 12), 0) / totalCustomers;
    const avgPurchaseCount = customers.reduce((sum, c) => sum + (c.purchase_count || c.purchaseCount || 0), 0) / totalCustomers;
    
    const prompt = `
    You are a senior customer analytics consultant and data scientist providing strategic insights to C-level executives for a board-level presentation. Analyze this customer portfolio with the analytical rigor expected for strategic decision-making at the highest organizational levels.

    COMPREHENSIVE PORTFOLIO METRICS:
    - Total Customers: ${totalCustomers.toLocaleString()}
    - Total Portfolio Value: $${totalRevenue.toLocaleString()}
    - Average Customer Value: $${(totalRevenue / totalCustomers).toFixed(2)}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    - Average Risk Score: ${avgRiskScore.toFixed(1)}/100
    - Portfolio Data Quality: ${avgDataQuality.toFixed(1)}%
    - Average Customer Tenure: ${avgTenure.toFixed(1)} months
    - Average Purchase Frequency: ${avgPurchaseCount.toFixed(1)} orders
    
    RISK SEGMENTATION WITH STATISTICAL SIGNIFICANCE:
    - High Risk (70-100): ${highRisk.length} customers (${((highRisk.length / totalCustomers) * 100).toFixed(1)}%)
    - Medium Risk (30-69): ${mediumRisk.length} customers (${((mediumRisk.length / totalCustomers) * 100).toFixed(1)}%)
    - Low Risk (0-29): ${lowRisk.length} customers (${((lowRisk.length / totalCustomers) * 100).toFixed(1)}%)
    
    FINANCIAL IMPACT ANALYSIS:
    - Revenue at Risk: $${revenueAtRisk.toLocaleString()} (${revenueAtRiskPercentage}% of total)
    - Average High-Risk Customer Value: $${highRisk.length > 0 ? (revenueAtRisk / highRisk.length).toFixed(2) : '0'}
    - Estimated Annual Churn Impact: $${(revenueAtRisk * 0.25).toLocaleString()} (assuming 25% churn rate)
    
    CUSTOMER LIFECYCLE INSIGHTS:
    - Recently Active (30 days): ${recentlyActive.length} (${((recentlyActive.length / totalCustomers) * 100).toFixed(1)}%)
    - Dormant Customers (90+ days): ${dormantCustomers.length} (${((dormantCustomers.length / totalCustomers) * 100).toFixed(1)}%)
    - Portfolio Activity Rate: ${(((totalCustomers - dormantCustomers.length) / totalCustomers) * 100).toFixed(1)}%
    
    EXECUTIVE ANALYSIS REQUIREMENTS (Board-Level Rigor):
    
    1. **PORTFOLIO HEALTH ASSESSMENT** (Quantified scoring with industry benchmarks)
       - Provide overall health score (1-100) with detailed methodology
       - Compare against SaaS/retail industry benchmarks (healthy portfolios: 80+ score)
       - Identify the top 3 critical health indicators requiring immediate attention
       - Calculate portfolio resilience score based on customer diversification
    
    2. **STRATEGIC RISK ANALYSIS** (Financial modeling with scenarios)
       - Quantify immediate financial impact with 90% confidence intervals
       - Model best-case, worst-case, and most-likely scenarios for next 12 months
       - Assess portfolio concentration risk and single-point-of-failure customers
       - Calculate maximum tolerable loss and early warning thresholds
    
    3. **REVENUE OPTIMIZATION OPPORTUNITIES** (ROI-focused recommendations)
       - Calculate potential revenue recovery through targeted retention (use 60-80% success rates)
       - Identify underperforming segments with quantified growth potential
       - Recommend portfolio rebalancing with specific customer acquisition targets
       - Estimate lifetime value improvement opportunities by segment
    
    4. **OPERATIONAL PRIORITIES** (90-day action plan with resource allocation)
       - Rank interventions by ROI, feasibility, and impact (use scoring matrix)
       - Specify resource allocation with FTE requirements and budget estimates
       - Define success metrics with baseline, target, and stretch goals
       - Create implementation timeline with milestones and checkpoints
    
    5. **STRATEGIC RECOMMENDATIONS** (Long-term competitive positioning)
       - Adjust customer acquisition strategy based on successful customer profiles
       - Recommend product/service improvements using churn pattern analysis
       - Prioritize investment in customer success initiatives with budget ranges
       - Define competitive differentiation strategies based on retention data
    
    6. **COMPETITIVE POSITIONING** (Market analysis with benchmarking)
       - Assess retention capability vs. industry standards (provide percentile ranking)
       - Identify competitive vulnerabilities using customer feedback patterns
       - Recommend defensive strategies for high-value customer protection
       - Suggest offensive opportunities for market share capture
    
    DELIVERABLE REQUIREMENTS (C-Suite Standard):
    - Executive summary suitable for 15-minute board presentation
    - All recommendations must include quantified business impact and ROI calculations
    - Risk-adjusted ROI calculations with sensitivity analysis
    - Clear prioritization matrix with timelines, resource needs, and success criteria
    - Measurable KPIs for each initiative with reporting cadence recommendations
    - Include statistical confidence levels for all projections and recommendations
    
    Present findings with the analytical depth and strategic perspective expected for organizational decision-making at the highest levels. Use data-driven insights to support every recommendation with clear business rationale.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating enhanced portfolio analysis:', error);
    throw error;
  }
};

export const generateContextualInsights = async (customerData: any, portfolioContext: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    CONTEXTUAL CUSTOMER ANALYSIS WITH PORTFOLIO BENCHMARKING
    
    Analyze this individual customer within the context of the overall portfolio performance and industry benchmarks.
    
    CUSTOMER DATA: ${JSON.stringify(customerData, null, 2)}
    PORTFOLIO CONTEXT: ${JSON.stringify(portfolioContext, null, 2)}
    
    Provide insights on:
    1. How this customer compares to portfolio averages
    2. Relative risk assessment within peer group
    3. Tailored retention strategies based on portfolio learnings
    4. Expected success probability for interventions
    5. Resource allocation recommendations
    
    Use statistical analysis and provide confidence levels for all recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating contextual insights:', error);
    throw error;
  }
};

export const validateInsightAccuracy = async (insights: string, customerData: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    INSIGHT VALIDATION AND ACCURACY ASSESSMENT
    
    Review these AI-generated insights for accuracy, relevance, and actionability:
    
    INSIGHTS TO VALIDATE: ${insights}
    ORIGINAL DATA: ${JSON.stringify(customerData, null, 2)}
    
    Provide:
    1. Accuracy score (1-100) with justification
    2. Identification of any inconsistencies or errors
    3. Confidence level assessment for each recommendation
    4. Suggestions for insight improvement
    5. Data quality impact on insight reliability
    
    Return structured validation results.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error validating insight accuracy:', error);
    throw error;
  }
};
