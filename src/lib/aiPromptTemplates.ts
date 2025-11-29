/**
 * Concise AI prompt templates for StayInsight
 * All prompts enforce brevity and structured output
 */

export const dashboardInsightsPrompt = (
  totalCustomers: number,
  atRiskCustomers: number,
  totalRevenue: number,
  avgRiskScore: number
) => `Analyze this customer portfolio in under 150 words:

Total Customers: ${totalCustomers}
At-Risk Customers: ${atRiskCustomers} (${((atRiskCustomers / totalCustomers) * 100).toFixed(1)}%)
Total Revenue: $${totalRevenue.toLocaleString()}
Average Risk Score: ${avgRiskScore.toFixed(1)}%

Respond with EXACTLY:
• Health Score: X/100
• Top Risk: [one sentence]
• Quick Win: [one specific action]
• Revenue Impact: $X at risk

Keep it under 150 words. Be direct and actionable.`;

export const customerInsightPrompt = (customerData: any) => `Customer: ${customerData.name || 'Unknown'}
Risk Score: ${customerData.risk_score || customerData.riskScore || 0}%
Total Spent: $${customerData.total_spent || customerData.totalSpent || 0}
Purchase Count: ${customerData.purchase_count || customerData.purchaseCount || 0}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}

Respond in under 75 words:
1. RISK: High/Medium/Low + one reason
2. ACTION: One specific thing to do this week
3. OUTCOME: Expected result if action taken`;

export const churnPredictionPrompt = (customerData: any) => `Customer: ${customerData.name || 'Unknown'}
Risk: ${customerData.risk_score || customerData.riskScore || 0}%
Spent: $${customerData.total_spent || customerData.totalSpent || 0}
Orders: ${customerData.purchase_count || customerData.purchaseCount || 0}
Last Purchase: ${customerData.last_purchase_date || customerData.lastPurchaseDate || 'Unknown'}

Respond in exactly 50 words:
• Churn Risk: X% (High/Medium/Low)
• Timeframe: X days until likely churn
• Warning Sign: [one key indicator]
• Save Action: [one specific intervention]`;

export const portfolioAnalysisPrompt = (
  totalCustomers: number,
  highRiskCount: number,
  totalRevenue: number,
  avgRiskScore: number
) => `Portfolio: ${totalCustomers} customers, $${totalRevenue.toLocaleString()} revenue, ${highRiskCount} at-risk

Give exactly 3 insights, each under 20 words:
1. URGENT: [biggest risk right now]
2. OPPORTUNITY: [quick win action]
3. METRIC: [key number to watch]

Format as JSON:
{
  "insights": [
    { "type": "urgent|opportunity|metric", "title": "...", "description": "..." }
  ],
  "healthScore": 0-100
}`;

export const dataChatSystemPrompt = `You are a concise data analyst for customer churn analysis.

Rules:
- Keep answers under 3 sentences
- Use bullet points for lists
- Be direct and specific
- No fluff or filler words
- Focus on actionable insights
- Reference actual customer data`;
