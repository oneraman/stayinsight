
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEnhancedCustomerInsights, generateContextualInsights, validateInsightAccuracy } from '@/lib/enhancedGemini';
import { insightValidator, InsightValidationResult } from './aiInsightValidator';

const API_KEY = 'AIzaSyD1IUVaUj3nDzRJWoGZU4BlCYpo4pjcGQk';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface MultiModelAnalysisResult {
  primaryInsights: string;
  validationResults: InsightValidationResult;
  consensusAnalysis: string;
  confidenceScore: number;
  alternativeViewpoints: string[];
  recommendedActions: Array<{
    action: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

export class MultiModelAnalyzer {
  async analyzeWithMultipleModels(customerData: any, portfolioContext?: any): Promise<MultiModelAnalysisResult> {
    try {
      console.log('🔍 Starting multi-model analysis for enhanced accuracy...');
      
      // Model 1: Primary detailed analysis
      const primaryInsights = await generateEnhancedCustomerInsights(customerData);
      
      // Model 2: Contextual analysis (if portfolio context available)
      let contextualInsights = '';
      if (portfolioContext) {
        contextualInsights = await generateContextualInsights(customerData, portfolioContext);
      }
      
      // Model 3: Risk-focused analysis
      const riskFocusedInsights = await this.generateRiskFocusedAnalysis(customerData);
      
      // Model 4: Opportunity-focused analysis
      const opportunityInsights = await this.generateOpportunityAnalysis(customerData);
      
      // Validate primary insights
      const dataQuality = this.calculateDataQuality(customerData);
      const validationResults = insightValidator.validateInsights(primaryInsights, customerData, dataQuality);
      
      // Generate consensus analysis from all models
      const consensusAnalysis = await this.generateConsensusAnalysis([
        primaryInsights,
        contextualInsights,
        riskFocusedInsights,
        opportunityInsights
      ], customerData);
      
      // Calculate overall confidence score
      const confidenceScore = this.calculateOverallConfidence(validationResults, dataQuality);
      
      // Extract alternative viewpoints
      const alternativeViewpoints = this.extractAlternativeViewpoints([
        contextualInsights,
        riskFocusedInsights,
        opportunityInsights
      ]);
      
      // Generate recommended actions with confidence scores
      const recommendedActions = await this.generateRecommendedActions(consensusAnalysis, confidenceScore);
      
      return {
        primaryInsights,
        validationResults,
        consensusAnalysis,
        confidenceScore,
        alternativeViewpoints,
        recommendedActions
      };
      
    } catch (error) {
      console.error('Multi-model analysis failed:', error);
      throw new Error('Failed to complete multi-model analysis');
    }
  }

  private async generateRiskFocusedAnalysis(customerData: any): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    RISK-FOCUSED CUSTOMER ANALYSIS
    
    You are a risk management specialist. Focus exclusively on identifying and quantifying churn risks for this customer.
    
    Customer Data: ${JSON.stringify(customerData, null, 2)}
    
    Provide:
    1. Detailed risk factor analysis with quantified impact scores
    2. Early warning indicators and trigger points
    3. Risk mitigation strategies with success probabilities
    4. Comparative risk assessment against industry benchmarks
    5. Risk-adjusted retention cost recommendations
    
    Be conservative in your estimates and focus on risk quantification.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async generateOpportunityAnalysis(customerData: any): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    OPPORTUNITY-FOCUSED CUSTOMER ANALYSIS
    
    You are a growth strategist. Focus on identifying opportunities to increase customer value and loyalty.
    
    Customer Data: ${JSON.stringify(customerData, null, 2)}
    
    Provide:
    1. Upselling and cross-selling opportunities with revenue potential
    2. Engagement improvement strategies
    3. Loyalty building initiatives
    4. Customer lifetime value optimization tactics
    5. Referral and advocacy potential assessment
    
    Be optimistic but realistic in opportunity assessment.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async generateConsensusAnalysis(analyses: string[], customerData: any): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    CONSENSUS ANALYSIS SYNTHESIS
    
    You are a senior analyst synthesizing multiple AI analyses into a single, coherent strategic recommendation.
    
    MULTIPLE ANALYSES TO SYNTHESIZE:
    ${analyses.map((analysis, index) => `Analysis ${index + 1}: ${analysis}`).join('\n\n')}
    
    CUSTOMER DATA: ${JSON.stringify(customerData, null, 2)}
    
    Provide a consensus analysis that:
    1. Identifies areas of agreement across all analyses
    2. Addresses any contradictions or conflicting recommendations
    3. Synthesizes the most reliable insights with confidence levels
    4. Provides a unified strategic recommendation
    5. Highlights areas where additional data would improve accuracy
    
    Focus on actionable insights with the highest confidence levels.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private calculateDataQuality(customerData: any): number {
    const importantFields = [
      'customer_id', 'email', 'total_spent', 'purchase_count', 
      'last_purchase_date', 'avg_order_value', 'tenure'
    ];
    
    let qualityScore = 0;
    const fieldWeight = 100 / importantFields.length;
    
    importantFields.forEach(field => {
      const value = customerData[field];
      if (value !== undefined && value !== null && value !== '') {
        qualityScore += fieldWeight;
      }
    });
    
    return Math.round(qualityScore);
  }

  private calculateOverallConfidence(validationResults: InsightValidationResult, dataQuality: number): number {
    // Weighted average of validation accuracy, confidence level, and data quality
    const weights = {
      accuracy: 0.4,
      confidence: 0.3,
      dataQuality: 0.3
    };
    
    const overallScore = 
      (validationResults.accuracyScore * weights.accuracy) +
      (validationResults.confidenceLevel * weights.confidence) +
      (dataQuality * weights.dataQuality);
    
    return Math.round(overallScore);
  }

  private extractAlternativeViewpoints(analyses: string[]): string[] {
    // Simple extraction of key different perspectives
    const viewpoints: string[] = [];
    
    analyses.forEach((analysis, index) => {
      if (analysis && analysis.length > 100) {
        // Extract first few sentences as alternative viewpoint summary
        const sentences = analysis.split('.').slice(0, 3).join('.') + '.';
        if (sentences.length > 50) {
          viewpoints.push(`Perspective ${index + 1}: ${sentences}`);
        }
      }
    });
    
    return viewpoints;
  }

  private async generateRecommendedActions(consensusAnalysis: string, confidenceScore: number): Promise<Array<{
    action: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    ACTIONABLE RECOMMENDATIONS EXTRACTION
    
    From this consensus analysis, extract specific, actionable recommendations:
    
    ${consensusAnalysis}
    
    Overall Analysis Confidence: ${confidenceScore}%
    
    Provide 5-7 specific actions in this exact JSON format:
    [
      {
        "action": "Specific action description",
        "confidence": 85,
        "priority": "high",
        "expectedImpact": "Quantified expected outcome"
      }
    ]
    
    Ensure each action is:
    1. Specific and actionable
    2. Has a confidence score (0-100)
    3. Has appropriate priority level
    4. Includes measurable expected impact
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const actions = JSON.parse(jsonMatch[0]);
        return actions;
      }
    } catch (error) {
      console.warn('Failed to parse recommended actions JSON:', error);
    }
    
    // Fallback to default recommendations
    return [
      {
        action: 'Implement targeted retention campaign',
        confidence: Math.max(60, confidenceScore - 10),
        priority: 'high' as const,
        expectedImpact: '25-40% churn reduction'
      },
      {
        action: 'Personalized engagement outreach',
        confidence: Math.max(50, confidenceScore - 20),
        priority: 'medium' as const,
        expectedImpact: '15-25% engagement improvement'
      }
    ];
  }
}

export const multiModelAnalyzer = new MultiModelAnalyzer();
