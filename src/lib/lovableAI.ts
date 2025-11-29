import { supabase } from "@/lib/supabase";

export interface LovableAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call Lovable AI Gateway through Supabase edge function
 * Uses google/gemini-2.5-flash by default
 */
export const callLovableAI = async (
  prompt: string,
  options: LovableAIOptions = {}
): Promise<string> => {
  try {
    console.log("🤖 Calling Lovable AI Gateway via edge function...");

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Authentication required to use AI features');
    }

    // Call the edge function which will use Lovable AI Gateway
    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: {
        prompt,
        model: options.model || 'google/gemini-2.5-flash',
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("❌ AI Gateway error:", error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data?.response) {
      throw new Error('No response received from AI Gateway');
    }

    console.log("✅ AI response received successfully");
    return data.response;

  } catch (error) {
    console.error("❌ Error calling Lovable AI:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error('AI rate limit exceeded. Please try again in a few moments.');
      }
      if (error.message.includes('402')) {
        throw new Error('AI credits exhausted. Please add credits to your workspace.');
      }
      if (error.message.includes('Authentication')) {
        throw new Error('Please log in to use AI features.');
      }
    }
    
    throw error;
  }
};

/**
 * Generate customer insights using Lovable AI
 */
export const generateCustomerInsights = async (customerData: any): Promise<string> => {
  const prompt = `Analyze this customer data and provide detailed churn insights:

Customer: ${customerData.name || 'Unknown'}
Customer ID: ${customerData.customer_id || customerData.customerId}
Email: ${customerData.email || 'Not provided'}
Total Orders: ${customerData.purchase_count || customerData.purchaseCount || 0}
Total Spent: $${customerData.total_spent || customerData.totalSpent || 0}
Average Order Value: $${customerData.avg_order_value || customerData.avgOrderValue || 0}
Risk Score: ${customerData.risk_score || customerData.riskScore || 'Not calculated'}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}

Provide:
1. Churn Risk Assessment (High/Medium/Low)
2. Key Risk Factors
3. Customer Value Analysis
4. Behavioral Patterns
5. Retention Strategies (3-4 specific actions)
6. Urgency Level
7. Success Probability

Be specific and data-driven.`;

  return callLovableAI(prompt);
};

/**
 * Generate churn prediction using Lovable AI
 */
export const generateChurnPrediction = async (customerData: any): Promise<string> => {
  const prompt = `As a churn prediction expert, analyze this customer's likelihood to churn:

Customer ID: ${customerData.customer_id || customerData.customerId}
Name: ${customerData.name || 'Unknown'}
Purchase History: ${customerData.purchase_count || customerData.purchaseCount || 0} orders
Total Revenue: $${customerData.total_spent || customerData.totalSpent || 0}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}
Risk Score: ${customerData.risk_score || customerData.riskScore || 'Not calculated'}
Segment: ${customerData.segment || 'Unknown'}

Provide:
1. Churn Probability (percentage)
2. Time Frame estimate
3. Primary Indicators (top 3 factors)
4. Protective Factors
5. Intervention Window
6. Recommended Actions (3-4 specific interventions)

Be specific and actionable.`;

  return callLovableAI(prompt);
};

/**
 * Generate portfolio analysis using Lovable AI
 */
export const generatePortfolioAnalysis = async (customers: any[]): Promise<string> => {
  const totalCustomers = customers.length;
  const highRiskCount = customers.filter(c => (c.risk_score || c.riskScore || 0) >= 70).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || c.totalSpent || 0), 0);
  const avgRiskScore = customers.reduce((sum, c) => sum + (c.risk_score || c.riskScore || 0), 0) / totalCustomers;

  const prompt = `Analyze this customer portfolio and provide strategic insights:

Portfolio Metrics:
- Total Customers: ${totalCustomers}
- High Risk Customers: ${highRiskCount} (${((highRiskCount / totalCustomers) * 100).toFixed(1)}%)
- Total Revenue: $${totalRevenue.toLocaleString()}
- Average Risk Score: ${avgRiskScore.toFixed(1)}%

Provide:
1. Portfolio Health Score (1-10)
2. Churn Risk Assessment
3. Revenue at Risk
4. Critical Issues
5. Strategic Opportunities
6. 30-Day Action Plan
7. Success Metrics

Focus on actionable insights.`;

  return callLovableAI(prompt);
};
