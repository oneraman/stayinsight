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
  const prompt = `Customer: ${customerData.name || 'Unknown'}
Risk: ${customerData.risk_score || customerData.riskScore || 0}%
Spent: $${customerData.total_spent || customerData.totalSpent || 0}
Orders: ${customerData.purchase_count || customerData.purchaseCount || 0}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}

Answer in under 75 words:
1. RISK: High/Medium/Low + why (1 sentence)
2. ACTION: One specific thing to do this week
3. OUTCOME: Expected result if action taken`;

  return callLovableAI(prompt, { maxTokens: 400 });
};

/**
 * Generate churn prediction using Lovable AI
 */
export const generateChurnPrediction = async (customerData: any): Promise<string> => {
  const prompt = `Customer: ${customerData.name || 'Unknown'}
Risk: ${customerData.risk_score || customerData.riskScore || 0}%
Spent: $${customerData.total_spent || customerData.totalSpent || 0}
Orders: ${customerData.purchase_count || customerData.purchaseCount || 0}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}

Respond in exactly 50 words:
• Churn Risk: X% (High/Medium/Low)
• Timeframe: X days until likely churn
• Warning Sign: [one key indicator]
• Save Action: [one specific intervention]`;

  return callLovableAI(prompt, { maxTokens: 300 });
};

/**
 * Generate portfolio analysis using Lovable AI
 */
export const generatePortfolioAnalysis = async (customers: any[]): Promise<string> => {
  const totalCustomers = customers.length;
  const highRiskCount = customers.filter(c => (c.risk_score || c.riskScore || 0) >= 65).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || c.totalSpent || 0), 0);
  const avgRiskScore = customers.reduce((sum, c) => sum + (c.risk_score || c.riskScore || 0), 0) / totalCustomers;

  const prompt = `Portfolio: ${totalCustomers} customers, $${totalRevenue.toLocaleString()} revenue, ${highRiskCount} at-risk

Give exactly 3 insights, each under 20 words:
1. URGENT: [biggest risk right now]
2. OPPORTUNITY: [quick win action]
3. METRIC: [key number to watch]

Under 150 words total.`;

  return callLovableAI(prompt, { maxTokens: 400 });
};
