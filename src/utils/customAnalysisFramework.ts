
export interface CustomRiskFactor {
  id: string;
  name: string;
  weight: number;
  calculation: 'linear' | 'exponential' | 'threshold' | 'custom';
  parameters: {
    min?: number;
    max?: number;
    threshold?: number;
    multiplier?: number;
    customFormula?: string;
  };
  enabled: boolean;
}

export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  industry: string;
  riskFactors: CustomRiskFactor[];
  scoringMethod: 'weighted_average' | 'risk_matrix' | 'ml_based';
  thresholds: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
  created: Date;
  lastModified: Date;
}

export interface AnalysisConfiguration {
  selectedModel: string;
  customFactors: CustomRiskFactor[];
  analysisDepth: 'basic' | 'intermediate' | 'advanced';
  includeForecasting: boolean;
  forecastPeriods: number;
  confidenceThreshold: number;
  segmentationCriteria: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | string;
    value2?: number;
  }>;
}

export interface CustomAnalysisResult {
  customerId: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factorScores: Array<{
    factorId: string;
    factorName: string;
    score: number;
    contribution: number;
    explanation: string;
  }>;
  recommendations: string[];
  confidence: number;
  modelUsed: string;
  analysisTimestamp: Date;
}

export class CustomAnalysisFramework {
  private predefinedModels: BusinessModel[] = [
    {
      id: 'saas_standard',
      name: 'SaaS Standard Model',
      description: 'Standard risk assessment for SaaS businesses',
      industry: 'Software as a Service',
      riskFactors: [
        {
          id: 'usage_frequency',
          name: 'Usage Frequency',
          weight: 0.25,
          calculation: 'threshold',
          parameters: { threshold: 30, multiplier: 2 },
          enabled: true
        },
        {
          id: 'subscription_value',
          name: 'Subscription Value',
          weight: 0.20,
          calculation: 'linear',
          parameters: { min: 0, max: 1000 },
          enabled: true
        },
        {
          id: 'support_tickets',
          name: 'Support Ticket Volume',
          weight: 0.15,
          calculation: 'exponential',
          parameters: { multiplier: 1.5 },
          enabled: true
        },
        {
          id: 'feature_adoption',
          name: 'Feature Adoption Rate',
          weight: 0.20,
          calculation: 'linear',
          parameters: { min: 0, max: 100 },
          enabled: true
        },
        {
          id: 'payment_history',
          name: 'Payment History',
          weight: 0.20,
          calculation: 'threshold',
          parameters: { threshold: 5, multiplier: 3 },
          enabled: true
        }
      ],
      scoringMethod: 'weighted_average',
      thresholds: { lowRisk: 30, mediumRisk: 70, highRisk: 100 },
      created: new Date(),
      lastModified: new Date()
    },
    {
      id: 'ecommerce_standard',
      name: 'E-commerce Standard Model',
      description: 'Risk assessment optimized for e-commerce businesses',
      industry: 'E-commerce',
      riskFactors: [
        {
          id: 'purchase_recency',
          name: 'Purchase Recency',
          weight: 0.30,
          calculation: 'exponential',
          parameters: { multiplier: 1.2 },
          enabled: true
        },
        {
          id: 'order_frequency',
          name: 'Order Frequency',
          weight: 0.25,
          calculation: 'linear',
          parameters: { min: 0, max: 50 },
          enabled: true
        },
        {
          id: 'average_order_value',
          name: 'Average Order Value',
          weight: 0.20,
          calculation: 'linear',
          parameters: { min: 0, max: 500 },
          enabled: true
        },
        {
          id: 'return_rate',
          name: 'Return Rate',
          weight: 0.15,
          calculation: 'threshold',
          parameters: { threshold: 15, multiplier: 2 },
          enabled: true
        },
        {
          id: 'loyalty_program',
          name: 'Loyalty Program Engagement',
          weight: 0.10,
          calculation: 'linear',
          parameters: { min: 0, max: 100 },
          enabled: true
        }
      ],
      scoringMethod: 'weighted_average',
      thresholds: { lowRisk: 25, mediumRisk: 65, highRisk: 100 },
      created: new Date(),
      lastModified: new Date()
    }
  ];

  getPredefinedModels(): BusinessModel[] {
    return [...this.predefinedModels];
  }

  createCustomModel(modelData: Omit<BusinessModel, 'id' | 'created' | 'lastModified'>): BusinessModel {
    const model: BusinessModel = {
      ...modelData,
      id: `custom_${Date.now()}`,
      created: new Date(),
      lastModified: new Date()
    };

    return model;
  }

  validateModel(model: BusinessModel): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check weights sum to 1
    const totalWeight = model.riskFactors
      .filter(f => f.enabled)
      .reduce((sum, f) => sum + f.weight, 0);
    
    if (Math.abs(totalWeight - 1) > 0.01) {
      errors.push('Risk factor weights must sum to 1.0');
    }

    // Check threshold logic
    if (model.thresholds.lowRisk >= model.thresholds.mediumRisk) {
      errors.push('Low risk threshold must be less than medium risk threshold');
    }
    if (model.thresholds.mediumRisk >= model.thresholds.highRisk) {
      errors.push('Medium risk threshold must be less than high risk threshold');
    }

    // Check factor parameters
    model.riskFactors.forEach(factor => {
      if (factor.calculation === 'linear' && (!factor.parameters.min || !factor.parameters.max)) {
        errors.push(`Linear factor ${factor.name} requires min and max parameters`);
      }
      if (factor.calculation === 'threshold' && !factor.parameters.threshold) {
        errors.push(`Threshold factor ${factor.name} requires threshold parameter`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  runCustomAnalysis(
    customers: any[], 
    configuration: AnalysisConfiguration
  ): CustomAnalysisResult[] {
    const model = this.predefinedModels.find(m => m.id === configuration.selectedModel);
    if (!model) {
      throw new Error(`Model ${configuration.selectedModel} not found`);
    }

    const results: CustomAnalysisResult[] = [];

    customers.forEach(customer => {
      const factorScores: Array<{
        factorId: string;
        factorName: string;
        score: number;
        contribution: number;
        explanation: string;
      }> = [];

      let overallScore = 0;
      const enabledFactors = model.riskFactors.filter(f => f.enabled);

      enabledFactors.forEach(factor => {
        const factorScore = this.calculateFactorScore(customer, factor);
        const contribution = factorScore * factor.weight;
        overallScore += contribution;

        factorScores.push({
          factorId: factor.id,
          factorName: factor.name,
          score: Math.round(factorScore * 100) / 100,
          contribution: Math.round(contribution * 100) / 100,
          explanation: this.generateFactorExplanation(customer, factor, factorScore)
        });
      });

      // Apply custom factors if any
      configuration.customFactors.forEach(factor => {
        if (factor.enabled) {
          const factorScore = this.calculateFactorScore(customer, factor);
          const contribution = factorScore * factor.weight;
          overallScore += contribution;

          factorScores.push({
            factorId: factor.id,
            factorName: factor.name,
            score: Math.round(factorScore * 100) / 100,
            contribution: Math.round(contribution * 100) / 100,
            explanation: this.generateFactorExplanation(customer, factor, factorScore)
          });
        }
      });

      const riskLevel = this.determineRiskLevel(overallScore, model.thresholds);
      const confidence = this.calculateAnalysisConfidence(customer, model);
      
      // Only include results that meet confidence threshold
      if (confidence >= configuration.confidenceThreshold) {
        results.push({
          customerId: customer.customer_id,
          overallRiskScore: Math.round(overallScore * 100) / 100,
          riskLevel,
          factorScores: factorScores.sort((a, b) => b.contribution - a.contribution),
          recommendations: this.generateCustomRecommendations(customer, factorScores, riskLevel),
          confidence: Math.round(confidence * 100) / 100,
          modelUsed: model.name,
          analysisTimestamp: new Date()
        });
      }
    });

    return results.sort((a, b) => b.overallRiskScore - a.overallRiskScore);
  }

  private calculateFactorScore(customer: any, factor: CustomRiskFactor): number {
    const value = this.extractFactorValue(customer, factor);
    
    switch (factor.calculation) {
      case 'linear':
        return this.calculateLinearScore(value, factor.parameters);
      case 'exponential':
        return this.calculateExponentialScore(value, factor.parameters);
      case 'threshold':
        return this.calculateThresholdScore(value, factor.parameters);
      case 'custom':
        return this.calculateCustomScore(value, factor.parameters, customer);
      default:
        return 0;
    }
  }

  private extractFactorValue(customer: any, factor: CustomRiskFactor): number {
    // Map factor IDs to customer data fields
    const fieldMapping: { [key: string]: string } = {
      'usage_frequency': 'usage_frequency',
      'subscription_value': 'total_spent',
      'support_tickets': 'support_calls',
      'feature_adoption': 'engagement_score', // Would need to be calculated
      'payment_history': 'payment_delay',
      'purchase_recency': 'days_since_last_purchase',
      'order_frequency': 'purchase_count',
      'average_order_value': 'avg_order_value',
      'return_rate': 'return_rate', // Would need to be calculated
      'loyalty_program': 'loyalty_score' // Would need to be calculated
    };

    const field = fieldMapping[factor.id];
    if (field && customer[field] !== undefined) {
      return customer[field];
    }

    // Calculate derived values
    switch (factor.id) {
      case 'days_since_last_purchase':
        if (customer.last_purchase_date) {
          const now = new Date();
          const lastPurchase = new Date(customer.last_purchase_date);
          return (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);
        }
        return 365; // Default to high risk if no purchase date

      case 'engagement_score':
        // Simple engagement calculation
        const purchases = customer.purchase_count || 0;
        const support = customer.support_calls || 0;
        const recency = this.extractFactorValue(customer, { ...factor, id: 'days_since_last_purchase' });
        return Math.max(0, 100 - (recency / 7) - (support * 5) + (purchases * 2));

      case 'loyalty_score':
        // Simple loyalty calculation
        const tenure = customer.tenure || 0;
        const totalSpent = customer.total_spent || 0;
        return Math.min(100, (tenure * 2) + (totalSpent / 100));

      case 'return_rate':
        // Would need return data - default to 5%
        return 5;

      default:
        return 0;
    }
  }

  private calculateLinearScore(value: number, params: any): number {
    const { min = 0, max = 100 } = params;
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return normalized * 100;
  }

  private calculateExponentialScore(value: number, params: any): number {
    const { multiplier = 1.5 } = params;
    return Math.min(100, Math.pow(value / 10, multiplier) * 10);
  }

  private calculateThresholdScore(value: number, params: any): number {
    const { threshold = 50, multiplier = 2 } = params;
    return value > threshold ? Math.min(100, value * multiplier) : value;
  }

  private calculateCustomScore(value: number, params: any, customer: any): number {
    // Simple custom formula evaluation - in production would use a safe evaluator
    const { customFormula = 'value' } = params;
    try {
      // Replace placeholders with actual values
      let formula = customFormula
        .replace(/value/g, value.toString())
        .replace(/total_spent/g, (customer.total_spent || 0).toString())
        .replace(/purchase_count/g, (customer.purchase_count || 0).toString());
      
      // Basic formula evaluation (very simplified)
      return Math.min(100, Math.max(0, eval(formula) || 0));
    } catch {
      return value; // Fallback to raw value
    }
  }

  private determineRiskLevel(score: number, thresholds: BusinessModel['thresholds']): 'low' | 'medium' | 'high' {
    if (score <= thresholds.lowRisk) return 'low';
    if (score <= thresholds.mediumRisk) return 'medium';
    return 'high';
  }

  private calculateAnalysisConfidence(customer: any, model: BusinessModel): number {
    let confidence = 0.5; // Base confidence

    // Data completeness affects confidence
    const requiredFields = ['total_spent', 'purchase_count', 'last_purchase_date'];
    const availableFields = requiredFields.filter(field => 
      customer[field] !== undefined && customer[field] !== null
    ).length;
    
    confidence += (availableFields / requiredFields.length) * 0.3;

    // Customer tenure affects confidence
    if (customer.tenure && customer.tenure > 6) {
      confidence += 0.2;
    }

    // Model complexity affects confidence
    const enabledFactors = model.riskFactors.filter(f => f.enabled).length;
    if (enabledFactors >= 3) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private generateFactorExplanation(customer: any, factor: CustomRiskFactor, score: number): string {
    const value = this.extractFactorValue(customer, factor);
    
    switch (factor.id) {
      case 'purchase_recency':
        return `Last purchase ${Math.round(value)} days ago (score: ${score.toFixed(1)})`;
      case 'order_frequency':
        return `${value} total purchases (score: ${score.toFixed(1)})`;
      case 'average_order_value':
        return `$${value.toFixed(2)} average order value (score: ${score.toFixed(1)})`;
      case 'support_tickets':
        return `${value} support tickets (score: ${score.toFixed(1)})`;
      default:
        return `${factor.name}: ${value} (score: ${score.toFixed(1)})`;
    }
  }

  private generateCustomRecommendations(
    customer: any, 
    factorScores: any[], 
    riskLevel: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];

    // Get top contributing factors
    const topFactors = factorScores.slice(0, 3);

    topFactors.forEach(factor => {
      if (factor.score > 70) {
        switch (factor.factorId) {
          case 'purchase_recency':
            recommendations.push('Send re-engagement campaign to encourage repeat purchase');
            break;
          case 'support_tickets':
            recommendations.push('Proactive customer success outreach to address concerns');
            break;
          case 'usage_frequency':
            recommendations.push('Provide usage training and onboarding support');
            break;
          case 'payment_history':
            recommendations.push('Offer flexible payment options and payment reminders');
            break;
          default:
            recommendations.push(`Address high ${factor.factorName.toLowerCase()} score`);
        }
      }
    });

    // Risk-level specific recommendations
    switch (riskLevel) {
      case 'high':
        recommendations.push('Urgent: Implement immediate retention intervention');
        break;
      case 'medium':
        recommendations.push('Monitor closely and implement preventive measures');
        break;
      case 'low':
        recommendations.push('Maintain current engagement level');
        break;
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  exportAnalysisConfiguration(config: AnalysisConfiguration): string {
    return JSON.stringify(config, null, 2);
  }

  importAnalysisConfiguration(configJson: string): AnalysisConfiguration {
    try {
      return JSON.parse(configJson);
    } catch (error) {
      throw new Error('Invalid configuration format');
    }
  }
}

export const customAnalysisFramework = new CustomAnalysisFramework();
