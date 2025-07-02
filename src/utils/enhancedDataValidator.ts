
import { ColumnMapping } from './advancedColumnMapper';

export interface DataQualityReport {
  overallScore: number;
  fieldScores: Record<string, number>;
  issues: DataIssue[];
  corrections: DataCorrection[];
  recommendations: string[];
}

export interface DataIssue {
  type: 'missing' | 'invalid' | 'outlier' | 'inconsistent' | 'duplicate';
  field: string;
  row: number;
  value: any;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface DataCorrection {
  field: string;
  row: number;
  originalValue: any;
  correctedValue: any;
  confidence: number;
  reason: string;
}

export class EnhancedDataValidator {
  private outlierThresholds: Record<string, { min: number; max: number }> = {
    total_spent: { min: 0, max: 100000 },
    purchase_count: { min: 0, max: 1000 },
    avg_order_value: { min: 0, max: 10000 },
    age: { min: 13, max: 120 },
    tenure: { min: 0, max: 600 }, // 50 years in months
    support_calls: { min: 0, max: 100 },
    payment_delay: { min: 0, max: 365 }
  };

  validateAndCleanData(data: any[], mappings: ColumnMapping[]): {
    cleanedData: any[];
    qualityReport: DataQualityReport;
  } {
    const cleanedData: any[] = [];
    const issues: DataIssue[] = [];
    const corrections: DataCorrection[] = [];
    const fieldScores: Record<string, number> = {};

    // Process each row
    data.forEach((row, index) => {
      const cleanedRow: any = {};
      
      mappings.forEach(mapping => {
        const originalValue = row[mapping.sourceColumn];
        const cleanResult = this.cleanField(
          originalValue, 
          mapping.targetField, 
          mapping.dataType, 
          index
        );

        cleanedRow[mapping.targetField] = cleanResult.value;

        if (cleanResult.issues.length > 0) {
          issues.push(...cleanResult.issues);
        }

        if (cleanResult.correction) {
          corrections.push(cleanResult.correction);
        }
      });

      cleanedData.push(cleanedRow);
    });

    // Calculate field scores
    mappings.forEach(mapping => {
      const fieldIssues = issues.filter(issue => issue.field === mapping.targetField);
      const errorRate = fieldIssues.length / data.length;
      fieldScores[mapping.targetField] = Math.max(0, 100 - (errorRate * 100));
    });

    // Calculate overall score
    const overallScore = Object.values(fieldScores).reduce((sum, score) => sum + score, 0) / Object.keys(fieldScores).length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, fieldScores);

    return {
      cleanedData,
      qualityReport: {
        overallScore,
        fieldScores,
        issues,
        corrections,
        recommendations
      }
    };
  }

  private cleanField(value: any, fieldName: string, dataType: string, rowIndex: number): {
    value: any;
    issues: DataIssue[];
    correction?: DataCorrection;
  } {
    const issues: DataIssue[] = [];
    let correction: DataCorrection | undefined;
    let cleanedValue = value;

    // Handle missing values
    if (value === null || value === undefined || value === '') {
      issues.push({
        type: 'missing',
        field: fieldName,
        row: rowIndex,
        value,
        severity: this.getMissingSeverity(fieldName),
        description: `Missing value for ${fieldName}`
      });
      cleanedValue = this.getDefaultValue(fieldName, dataType);
      return { value: cleanedValue, issues };
    }

    // Clean based on data type
    switch (dataType) {
      case 'string':
        cleanedValue = this.cleanStringField(value, fieldName, rowIndex, issues);
        break;
      case 'number':
        const numberResult = this.cleanNumberField(value, fieldName, rowIndex, issues);
        cleanedValue = numberResult.value;
        if (numberResult.correction) correction = numberResult.correction;
        break;
      case 'date':
        const dateResult = this.cleanDateField(value, fieldName, rowIndex, issues);
        cleanedValue = dateResult.value;
        if (dateResult.correction) correction = dateResult.correction;
        break;
    }

    // Check for outliers in numeric fields
    if (dataType === 'number' && cleanedValue !== null) {
      const outlierCheck = this.checkOutlier(cleanedValue, fieldName, rowIndex);
      if (outlierCheck.isOutlier) {
        issues.push(outlierCheck.issue);
      }
    }

    return { value: cleanedValue, issues, correction };
  }

  private cleanStringField(value: any, fieldName: string, rowIndex: number, issues: DataIssue[]): string {
    let cleaned = String(value).trim();

    // Email validation
    if (fieldName === 'email') {
      cleaned = cleaned.toLowerCase();
      if (!this.isValidEmail(cleaned)) {
        issues.push({
          type: 'invalid',
          field: fieldName,
          row: rowIndex,
          value,
          severity: 'high',
          description: 'Invalid email format'
        });
        return cleaned; // Return as-is, let user decide
      }
    }

    // Gender normalization
    if (fieldName === 'gender') {
      cleaned = this.normalizeGender(cleaned);
    }

    return cleaned;
  }

  private cleanNumberField(value: any, fieldName: string, rowIndex: number, issues: DataIssue[]): {
    value: number | null;
    correction?: DataCorrection;
  } {
    let correction: DataCorrection | undefined;
    
    // Try to parse number from string
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,£€¥\s%()]/g, '').replace(/[()]/g, '-');
      const parsed = Number(cleaned);
      
      if (isNaN(parsed) || !isFinite(parsed)) {
        issues.push({
          type: 'invalid',
          field: fieldName,
          row: rowIndex,
          value,
          severity: 'medium',
          description: `Cannot parse "${value}" as number`
        });
        return { value: null };
      }

      if (cleaned !== value) {
        correction = {
          field: fieldName,
          row: rowIndex,
          originalValue: value,
          correctedValue: parsed,
          confidence: 90,
          reason: 'Removed currency symbols and formatting'
        };
      }

      return { value: Math.max(0, parsed), correction };
    }

    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      issues.push({
        type: 'invalid',
        field: fieldName,
        row: rowIndex,
        value,
        severity: 'medium',
        description: 'Invalid number value'
      });
      return { value: null };
    }

    return { value: Math.max(0, num) };
  }

  private cleanDateField(value: any, fieldName: string, rowIndex: number, issues: DataIssue[]): {
    value: string | null;
    correction?: DataCorrection;
  } {
    if (typeof value === 'number') {
      // Excel serial date
      if (value > 25569 && value < 73050) {
        const excelEpoch = new Date(1900, 0, 1);
        const days = value - 1;
        const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        return {
          value: date.toISOString(),
          correction: {
            field: fieldName,
            row: rowIndex,
            originalValue: value,
            correctedValue: date.toISOString(),
            confidence: 95,
            reason: 'Converted Excel serial date'
          }
        };
      }
    }

    const dateStr = String(value).trim();
    const parsed = new Date(dateStr);
    
    if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1900 || parsed.getFullYear() > 2100) {
      issues.push({
        type: 'invalid',
        field: fieldName,
        row: rowIndex,
        value,
        severity: 'medium',
        description: 'Invalid date format'
      });
      return { value: null };
    }

    // Check for future dates
    if (parsed > new Date()) {
      issues.push({
        type: 'invalid',
        field: fieldName,
        row: rowIndex,
        value,
        severity: 'low',
        description: 'Date is in the future'
      });
    }

    return { value: parsed.toISOString() };
  }

  private checkOutlier(value: number, fieldName: string, rowIndex: number): {
    isOutlier: boolean;
    issue?: DataIssue;
  } {
    const thresholds = this.outlierThresholds[fieldName];
    if (!thresholds) return { isOutlier: false };

    if (value < thresholds.min || value > thresholds.max) {
      return {
        isOutlier: true,
        issue: {
          type: 'outlier',
          field: fieldName,
          row: rowIndex,
          value,
          severity: 'medium',
          description: `Value ${value} is outside expected range (${thresholds.min}-${thresholds.max})`
        }
      };
    }

    return { isOutlier: false };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private normalizeGender(gender: string): string {
    const normalized = gender.toLowerCase();
    if (['m', 'male', 'man'].includes(normalized)) return 'Male';
    if (['f', 'female', 'woman'].includes(normalized)) return 'Female';
    return gender; // Return original if can't normalize
  }

  private getMissingSeverity(fieldName: string): 'low' | 'medium' | 'high' {
    const criticalFields = ['customer_id', 'email'];
    const importantFields = ['total_spent', 'purchase_count', 'last_purchase_date'];
    
    if (criticalFields.includes(fieldName)) return 'high';
    if (importantFields.includes(fieldName)) return 'medium';
    return 'low';
  }

  private getDefaultValue(fieldName: string, dataType: string): any {
    if (dataType === 'number') return 0;
    if (dataType === 'date') return null;
    return '';
  }

  private generateRecommendations(issues: DataIssue[], fieldScores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    // Low quality fields
    Object.entries(fieldScores).forEach(([field, score]) => {
      if (score < 70) {
        recommendations.push(`Consider reviewing ${field} data - quality score is ${score.toFixed(1)}%`);
      }
    });

    // High severity issues
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
    if (highSeverityIssues.length > 0) {
      recommendations.push(`${highSeverityIssues.length} critical data issues need immediate attention`);
    }

    // Missing data patterns
    const missingIssues = issues.filter(issue => issue.type === 'missing');
    if (missingIssues.length > issues.length * 0.3) {
      recommendations.push('Consider data collection improvements - high percentage of missing values');
    }

    return recommendations;
  }
}
