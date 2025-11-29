/**
 * AI Response Formatter
 * Parses and structures raw AI responses for UI display
 */

export interface FormattedInsight {
  type: 'urgent' | 'opportunity' | 'metric' | 'risk' | 'action';
  title: string;
  description: string;
  value?: string;
  icon?: string;
}

export interface FormattedPrediction {
  churnRisk: number;
  riskLevel: 'high' | 'medium' | 'low';
  timeframe: string;
  warningSign: string;
  action: string;
}

/**
 * Parse JSON response or extract structured data from text
 */
export const parseAIResponse = (response: string, type: 'insight' | 'prediction' | 'portfolio'): any => {
  // Try to parse JSON first
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Continue to text parsing
  }

  // Fallback to text parsing
  if (type === 'prediction') {
    return parsePredictionText(response);
  } else if (type === 'portfolio') {
    return parsePortfolioText(response);
  }
  
  return parseInsightText(response);
};

/**
 * Parse churn prediction from text
 */
const parsePredictionText = (text: string): FormattedPrediction => {
  const churnRiskMatch = text.match(/(?:Churn Risk|Risk):\s*(\d+)%/i);
  const timeframeMatch = text.match(/(?:Timeframe|Timeline):\s*([^•\n]+)/i);
  const warningMatch = text.match(/(?:Warning Sign|Indicator):\s*([^•\n]+)/i);
  const actionMatch = text.match(/(?:Save Action|Action|Intervention):\s*([^•\n]+)/i);

  const churnRisk = churnRiskMatch ? parseInt(churnRiskMatch[1]) : 50;
  
  return {
    churnRisk,
    riskLevel: churnRisk >= 65 ? 'high' : churnRisk >= 25 ? 'medium' : 'low',
    timeframe: timeframeMatch ? timeframeMatch[1].trim() : '30-60 days',
    warningSign: warningMatch ? warningMatch[1].trim() : 'Declining engagement',
    action: actionMatch ? actionMatch[1].trim() : 'Contact customer'
  };
};

/**
 * Parse portfolio insights from text
 */
const parsePortfolioText = (text: string): { insights: FormattedInsight[], healthScore: number } => {
  const insights: FormattedInsight[] = [];
  
  // Extract health score
  const healthMatch = text.match(/(?:Health Score|Score):\s*(\d+)/i);
  const healthScore = healthMatch ? parseInt(healthMatch[1]) : 70;

  // Extract insights using bullet points or numbered lists
  const lines = text.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    if (line.match(/^[\d•\-*]/)) {
      const cleanLine = line.replace(/^[\d•\-*.\s]+/, '').trim();
      if (cleanLine.length < 10) return; // Skip very short lines

      let type: 'urgent' | 'opportunity' | 'metric' = 'urgent';
      if (cleanLine.toLowerCase().includes('opportun')) type = 'opportunity';
      else if (cleanLine.toLowerCase().includes('metric') || cleanLine.match(/\$\d+/)) type = 'metric';

      const [title, ...rest] = cleanLine.split(/[:–-]/);
      insights.push({
        type,
        title: title.trim(),
        description: rest.join(':').trim() || title.trim()
      });
    }
  });

  return { insights: insights.slice(0, 3), healthScore };
};

/**
 * Parse customer insight from text
 */
const parseInsightText = (text: string): FormattedInsight => {
  const lines = text.split('\n').filter(line => line.trim());
  const firstLine = lines[0] || text;
  
  return {
    type: 'risk',
    title: firstLine.substring(0, 100),
    description: text.substring(0, 200)
  };
};

/**
 * Format response for display (truncate, clean)
 */
export const formatForDisplay = (text: string, maxLength: number = 150): string => {
  let cleaned = text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim() + '...';
  }

  return cleaned;
};

/**
 * Extract key metrics from text (numbers, percentages, currency)
 */
export const extractMetrics = (text: string): { label: string; value: string }[] => {
  const metrics: { label: string; value: string }[] = [];
  
  // Extract percentages
  const percentMatches = text.matchAll(/(\w+[\w\s]*?):\s*(\d+(?:\.\d+)?%)/gi);
  for (const match of percentMatches) {
    metrics.push({ label: match[1].trim(), value: match[2] });
  }

  // Extract currency
  const currencyMatches = text.matchAll(/(\w+[\w\s]*?):\s*\$?([\d,]+(?:\.\d{2})?)/gi);
  for (const match of currencyMatches) {
    if (!match[2].includes('%')) {
      metrics.push({ label: match[1].trim(), value: `$${match[2]}` });
    }
  }

  return metrics.slice(0, 4); // Limit to 4 key metrics
};
