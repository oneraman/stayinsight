/**
 * Smart data extraction with type-specific parsing and validation
 */

export class SmartDataExtractor {
  /**
   * Extract and parse currency values
   */
  static parseCurrency(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const str = String(value).trim();
    
    // Remove currency symbols and thousands separators
    const cleaned = str.replace(/[$€£¥,\s]/g, '');
    
    // Handle percentages
    if (cleaned.includes('%')) {
      const num = parseFloat(cleaned.replace('%', ''));
      return isNaN(num) ? null : Math.max(0, num / 100);
    }
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : Math.max(0, num);
  }

  /**
   * Extract and parse date values with multiple format support
   */
  static parseDate(value: any): Date | null {
    if (!value) return null;
    
    try {
      // Handle Excel serial dates
      if (typeof value === 'number') {
        if (value > 25569 && value < 73050) { // Valid Excel date range
          const excelEpoch = new Date(1900, 0, 1);
          const days = value - 1;
          return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        }
      }
      
      // Handle string dates
      if (typeof value === 'string') {
        // Try direct parsing
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime()) && 
            parsed.getFullYear() > 1900 && 
            parsed <= new Date()) {
          return parsed;
        }
        
        // Try MM/DD/YYYY
        const usFormat = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (usFormat) {
          const [, month, day, year] = usFormat;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) return date;
        }
        
        // Try DD/MM/YYYY
        const euFormat = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (euFormat) {
          const [, day, month, year] = euFormat;
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) return date;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Extract and parse numeric values
   */
  static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    
    if (typeof value === 'string') {
      // Remove common numeric formatting
      const cleaned = value.replace(/[$,£€¥\s%]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    
    return null;
  }

  /**
   * Extract and validate email addresses
   */
  static parseEmail(value: any): string | null {
    if (!value) return null;
    
    const str = String(value).trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(str)) {
      return str;
    }
    
    return null;
  }

  /**
   * Extract and normalize text values
   */
  static parseText(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    
    const str = String(value).trim();
    
    // Filter out invalid values
    if (str === 'undefined' || str === 'null' || str === 'N/A' || str === 'n/a') {
      return null;
    }
    
    return str;
  }

  /**
   * Extract and validate age
   */
  static parseAge(value: any): number | null {
    const num = this.parseNumber(value);
    if (num === null) return null;
    
    // Validate reasonable age range
    if (num >= 13 && num <= 120) {
      return Math.round(num);
    }
    
    return null;
  }

  /**
   * Extract and validate tenure (in months)
   */
  static parseTenure(value: any): number | null {
    const num = this.parseNumber(value);
    if (num === null) return null;
    
    // Validate reasonable tenure range (0-600 months = 50 years)
    if (num >= 0 && num <= 600) {
      return Math.round(num);
    }
    
    return null;
  }

  /**
   * Extract value based on data type
   */
  static extractByType(value: any, dataType: string): any {
    switch (dataType) {
      case 'currency':
        return this.parseCurrency(value);
      case 'date':
        return this.parseDate(value);
      case 'number':
        return this.parseNumber(value);
      case 'email':
        return this.parseEmail(value);
      case 'string':
      default:
        return this.parseText(value);
    }
  }

  /**
   * Validate extracted data
   */
  static validate(value: any, fieldName: string): { valid: boolean; error?: string } {
    // Required fields validation
    const requiredFields = ['customer_id'];
    if (requiredFields.includes(fieldName)) {
      if (!value || String(value).trim() === '') {
        return { valid: false, error: `${fieldName} is required` };
      }
    }

    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
    }

    // Age validation
    if (fieldName === 'age' && value !== null) {
      if (value < 13 || value > 120) {
        return { valid: false, error: 'Age must be between 13 and 120' };
      }
    }

    // Numeric field validation
    const numericFields = ['total_spent', 'purchase_count', 'avg_order_value', 'support_calls', 'payment_delay'];
    if (numericFields.includes(fieldName) && value !== null) {
      if (typeof value !== 'number' || isNaN(value) || value < 0) {
        return { valid: false, error: `${fieldName} must be a positive number` };
      }
    }

    return { valid: true };
  }

  /**
   * Extract customer record from row data
   */
  static extractCustomerRecord(
    row: any,
    mappings: Array<{ sourceColumn: string; targetField: string; dataType: string }>,
    userId: string,
    rowIndex: number
  ): any {
    const record: any = {
      user_id: userId
    };

    // Extract each mapped field
    for (const mapping of mappings) {
      const rawValue = row[mapping.sourceColumn];
      const extractedValue = this.extractByType(rawValue, mapping.dataType);
      
      record[mapping.targetField] = extractedValue;
    }

    // Generate customer_id if not provided
    if (!record.customer_id || String(record.customer_id).trim() === '') {
      record.customer_id = `CUST_${Date.now()}_${rowIndex}`;
    }

    // Calculate avg_order_value if not provided
    if (!record.avg_order_value && record.total_spent && record.purchase_count && record.purchase_count > 0) {
      record.avg_order_value = record.total_spent / record.purchase_count;
    }

    // Convert date to ISO string
    if (record.last_purchase_date instanceof Date) {
      record.last_purchase_date = record.last_purchase_date.toISOString();
    }

    return record;
  }

  /**
   * Calculate data quality score for extracted record
   */
  static calculateQualityScore(record: any): number {
    const criticalFields = ['customer_id', 'email', 'total_spent', 'purchase_count'];
    const importantFields = ['name', 'last_purchase_date', 'avg_order_value'];
    const optionalFields = ['age', 'gender', 'tenure', 'subscription_type'];

    let score = 0;
    let maxScore = 0;

    // Critical fields (60% weight)
    criticalFields.forEach(field => {
      maxScore += 15;
      if (record[field] !== null && record[field] !== undefined && String(record[field]).trim() !== '') {
        score += 15;
      }
    });

    // Important fields (30% weight)
    importantFields.forEach(field => {
      maxScore += 10;
      if (record[field] !== null && record[field] !== undefined && String(record[field]).trim() !== '') {
        score += 10;
      }
    });

    // Optional fields (10% weight)
    optionalFields.forEach(field => {
      maxScore += 2.5;
      if (record[field] !== null && record[field] !== undefined && String(record[field]).trim() !== '') {
        score += 2.5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }
}
