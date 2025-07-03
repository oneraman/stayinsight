
export interface DataQualityReport {
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  recommendations: string[];
  fieldScores: Record<string, number>;
}

export class EnhancedDataValidator {
  validateAndCleanData(data: any[], mappings: any[]): { cleanedData: any[]; qualityReport: DataQualityReport } {
    console.log('🔍 Starting enhanced data validation...');
    
    const cleanedData = data.filter(row => {
      // Filter out completely empty rows
      return Object.values(row).some(value => value !== null && value !== undefined && value !== '');
    });

    // Calculate quality metrics
    const totalFields = mappings.length;
    let totalCompleteness = 0;
    let totalAccuracy = 0;
    let totalConsistency = 0;
    const fieldScores: Record<string, number> = {};
    const recommendations: string[] = [];

    // Analyze each field
    mappings.forEach(mapping => {
      const fieldName = mapping.targetField;
      const values = cleanedData.map(row => row[mapping.sourceColumn]).filter(v => v !== null && v !== undefined && v !== '');
      
      // Completeness: percentage of non-empty values
      const completeness = (values.length / cleanedData.length) * 100;
      
      // Accuracy: based on data type validation
      let accuracy = 100;
      if (mapping.dataType === 'number') {
        const validNumbers = values.filter(v => !isNaN(Number(v))).length;
        accuracy = values.length > 0 ? (validNumbers / values.length) * 100 : 100;
      } else if (mapping.dataType === 'date') {
        const validDates = values.filter(v => !isNaN(Date.parse(v))).length;
        accuracy = values.length > 0 ? (validDates / values.length) * 100 : 100;
      }
      
      // Consistency: variation in format
      const consistency = this.calculateConsistency(values, mapping.dataType);
      
      const fieldScore = (completeness + accuracy + consistency) / 3;
      fieldScores[fieldName] = fieldScore;
      
      totalCompleteness += completeness;
      totalAccuracy += accuracy;
      totalConsistency += consistency;
      
      // Generate recommendations
      if (completeness < 80) {
        recommendations.push(`${fieldName} field has ${completeness.toFixed(1)}% completeness - consider data enrichment`);
      }
      if (accuracy < 90) {
        recommendations.push(`${fieldName} field has data format issues - ${accuracy.toFixed(1)}% accuracy`);
      }
    });

    const avgCompleteness = totalCompleteness / mappings.length;
    const avgAccuracy = totalAccuracy / mappings.length;
    const avgConsistency = totalConsistency / mappings.length;
    const overallScore = (avgCompleteness + avgAccuracy + avgConsistency) / 3;

    const qualityReport: DataQualityReport = {
      overallScore,
      completenessScore: avgCompleteness,
      accuracyScore: avgAccuracy,
      consistencyScore: avgConsistency,
      recommendations,
      fieldScores
    };

    console.log('📊 Data quality report generated:', qualityReport);
    return { cleanedData, qualityReport };
  }

  private calculateConsistency(values: any[], dataType: string): number {
    if (values.length === 0) return 100;
    
    if (dataType === 'string') {
      // Check for consistent casing and format
      const formats = new Set(values.map(v => typeof v === 'string' ? v.trim().toLowerCase() : v));
      return (1 - (formats.size - 1) / values.length) * 100;
    }
    
    if (dataType === 'number') {
      // Check for consistent number formats
      const stringValues = values.filter(v => typeof v === 'string');
      if (stringValues.length === 0) return 100;
      
      const hasCommas = stringValues.filter(v => v.includes(',')).length;
      const hasCurrency = stringValues.filter(v => /[$£€¥]/.test(v)).length;
      
      // Penalize inconsistent formatting
      const inconsistency = Math.abs(hasCommas - stringValues.length/2) + Math.abs(hasCurrency - stringValues.length/2);
      return Math.max(0, 100 - (inconsistency / stringValues.length) * 100);
    }
    
    return 100; // Default for other types
  }
}
