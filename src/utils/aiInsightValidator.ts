
export interface InsightValidationResult {
  accuracyScore: number;
  confidenceLevel: number;
  validationIssues: ValidationIssue[];
  recommendations: string[];
  dataQualityImpact: number;
}

export interface ValidationIssue {
  type: 'inconsistency' | 'missing_data' | 'logical_error' | 'unsupported_claim';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedMetric: string;
  suggestion: string;
}

export class AIInsightValidator {
  validateInsights(insights: string, originalData: any, dataQuality: number): InsightValidationResult {
    const validationIssues: ValidationIssue[] = [];
    let accuracyScore = 100;
    
    // Check for data consistency
    const consistencyIssues = this.checkDataConsistency(insights, originalData);
    validationIssues.push(...consistencyIssues);
    
    // Validate numerical claims
    const numericalIssues = this.validateNumericalClaims(insights, originalData);
    validationIssues.push(...numericalIssues);
    
    // Check for logical coherence
    const logicalIssues = this.checkLogicalCoherence(insights);
    validationIssues.push(...logicalIssues);
    
    // Calculate accuracy score based on issues
    const highSeverityIssues = validationIssues.filter(issue => issue.severity === 'high').length;
    const mediumSeverityIssues = validationIssues.filter(issue => issue.severity === 'medium').length;
    const lowSeverityIssues = validationIssues.filter(issue => issue.severity === 'low').length;
    
    accuracyScore -= (highSeverityIssues * 20) + (mediumSeverityIssues * 10) + (lowSeverityIssues * 5);
    accuracyScore = Math.max(0, accuracyScore);
    
    // Calculate confidence level based on data quality and validation results
    const confidenceLevel = Math.min(dataQuality, accuracyScore) * 0.9; // Conservative approach
    
    // Generate recommendations
    const recommendations = this.generateImprovementRecommendations(validationIssues, dataQuality);
    
    return {
      accuracyScore,
      confidenceLevel,
      validationIssues,
      recommendations,
      dataQualityImpact: 100 - dataQuality
    };
  }

  private checkDataConsistency(insights: string, originalData: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if insights mention metrics not present in data
    const mentionedMetrics = this.extractMentionedMetrics(insights);
    const availableMetrics = Object.keys(originalData);
    
    mentionedMetrics.forEach(metric => {
      if (!availableMetrics.includes(metric) && !this.isCalculatedMetric(metric)) {
        issues.push({
          type: 'missing_data',
          severity: 'medium',
          description: `Insights reference ${metric} which is not available in the source data`,
          affectedMetric: metric,
          suggestion: `Remove references to ${metric} or note data limitation`
        });
      }
    });
    
    return issues;
  }

  private validateNumericalClaims(insights: string, originalData: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Extract numerical claims from insights
    const numericalClaims = this.extractNumericalClaims(insights);
    
    numericalClaims.forEach(claim => {
      const validation = this.validateNumericalClaim(claim, originalData);
      if (!validation.isValid) {
        issues.push({
          type: 'inconsistency',
          severity: validation.severity,
          description: `Numerical claim "${claim.text}" appears inconsistent with source data`,
          affectedMetric: claim.metric,
          suggestion: validation.suggestion
        });
      }
    });
    
    return issues;
  }

  private checkLogicalCoherence(insights: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for contradictory statements
    const contradictions = this.findContradictions(insights);
    
    contradictions.forEach(contradiction => {
      issues.push({
        type: 'logical_error',
        severity: 'high',
        description: `Contradictory statements found: ${contradiction.statement1} vs ${contradiction.statement2}`,
        affectedMetric: 'overall_analysis',
        suggestion: 'Resolve contradictory analysis and ensure logical consistency'
      });
    });
    
    return issues;
  }

  private extractMentionedMetrics(insights: string): string[] {
    // Simple regex-based extraction - in production, would use NLP
    const metricPatterns = [
      /total[_\s]?spent/gi,
      /purchase[_\s]?count/gi,
      /risk[_\s]?score/gi,
      /avg[_\s]?order[_\s]?value/gi,
      /last[_\s]?purchase/gi,
      /tenure/gi,
      /age/gi
    ];
    
    const mentioned: string[] = [];
    metricPatterns.forEach(pattern => {
      const matches = insights.match(pattern);
      if (matches) {
        mentioned.push(...matches.map(m => m.toLowerCase().replace(/\s/g, '_')));
      }
    });
    
    return [...new Set(mentioned)];
  }

  private isCalculatedMetric(metric: string): boolean {
    const calculatedMetrics = [
      'churn_probability',
      'lifetime_value',
      'days_since_last_purchase',
      'purchase_frequency',
      'engagement_level'
    ];
    
    return calculatedMetrics.some(calc => metric.includes(calc));
  }

  private extractNumericalClaims(insights: string): Array<{ text: string; value: number; metric: string }> {
    // Extract numerical claims - simplified implementation
    const claims: Array<{ text: string; value: number; metric: string }> = [];
    
    // Look for percentage claims
    const percentageRegex = /(\d+(?:\.\d+)?)\s*%/g;
    let match;
    
    while ((match = percentageRegex.exec(insights)) !== null) {
      claims.push({
        text: match[0],
        value: parseFloat(match[1]),
        metric: 'percentage'
      });
    }
    
    // Look for dollar amounts
    const dollarRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    while ((match = dollarRegex.exec(insights)) !== null) {
      claims.push({
        text: match[0],
        value: parseFloat(match[1].replace(/,/g, '')),
        metric: 'currency'
      });
    }
    
    return claims;
  }

  private validateNumericalClaim(claim: { text: string; value: number; metric: string }, originalData: any): { isValid: boolean; severity: 'low' | 'medium' | 'high'; suggestion: string } {
    // Simplified validation logic
    if (claim.metric === 'percentage' && (claim.value < 0 || claim.value > 100)) {
      return {
        isValid: false,
        severity: 'high',
        suggestion: 'Percentage values should be between 0 and 100'
      };
    }
    
    if (claim.metric === 'currency' && claim.value < 0) {
      return {
        isValid: false,
        severity: 'medium',
        suggestion: 'Currency values should not be negative'
      };
    }
    
    return { isValid: true, severity: 'low', suggestion: '' };
  }

  private findContradictions(insights: string): Array<{ statement1: string; statement2: string }> {
    // Simplified contradiction detection
    const contradictions: Array<{ statement1: string; statement2: string }> = [];
    
    // Look for contradictory risk assessments
    const lowRiskMatch = insights.match(/low\s+risk/gi);
    const highRiskMatch = insights.match(/high\s+risk/gi);
    
    if (lowRiskMatch && highRiskMatch) {
      contradictions.push({
        statement1: 'Customer assessed as low risk',
        statement2: 'Customer assessed as high risk'
      });
    }
    
    return contradictions;
  }

  private generateImprovementRecommendations(issues: ValidationIssue[], dataQuality: number): string[] {
    const recommendations: string[] = [];
    
    if (dataQuality < 70) {
      recommendations.push('Improve data quality by addressing missing or inconsistent values');
    }
    
    if (issues.some(issue => issue.type === 'missing_data')) {
      recommendations.push('Collect additional customer data points for more comprehensive analysis');
    }
    
    if (issues.some(issue => issue.type === 'logical_error')) {
      recommendations.push('Review analysis logic for consistency and coherence');
    }
    
    if (issues.some(issue => issue.severity === 'high')) {
      recommendations.push('Address high-severity validation issues before using insights for decision-making');
    }
    
    return recommendations;
  }
}

export const insightValidator = new AIInsightValidator();
