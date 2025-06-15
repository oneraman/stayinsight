
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CustomerRowData {
  [key: string]: any;
  customer_id?: string;
  customerId?: string;
  id?: string;
  email?: string;
  email_address?: string;
  name?: string;
  customer_name?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  last_purchase_date?: string | number;
  lastPurchaseDate?: string | number;
  last_order_date?: string | number;
  purchase_count?: number | string;
  purchaseCount?: number | string;
  order_count?: number | string;
  total_spent?: number | string;
  totalSpent?: number | string;
  lifetime_value?: number | string;
  avg_order_value?: number | string;
  avgOrderValue?: number | string;
}

export const validateCustomerRow = (row: CustomerRowData, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Critical validations
  if (!row.customer_id && !row.customerId && !row.id) {
    errors.push(`Row ${index + 1}: Missing customer ID`);
  }
  
  // Numeric field validations
  const numericFields = [
    { field: 'total_spent', alt: 'totalSpent', name: 'total spent' },
    { field: 'purchase_count', alt: 'purchaseCount', name: 'purchase count' },
    { field: 'avg_order_value', alt: 'avgOrderValue', name: 'average order value' }
  ];
  
  numericFields.forEach(({ field, alt, name }) => {
    const value = row[field] || row[alt];
    if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
      errors.push(`Row ${index + 1}: Invalid ${name} value: ${value}`);
    }
  });
  
  // Email validation
  const email = row.email || row.email_address;
  if (email && typeof email === 'string' && !email.includes('@')) {
    warnings.push(`Row ${index + 1}: Email format may be invalid: ${email}`);
  }
  
  // Date validation warnings
  const dateField = row.last_purchase_date || row.lastPurchaseDate || row.last_order_date;
  if (dateField && typeof dateField === 'string') {
    const parsedDate = new Date(dateField);
    if (isNaN(parsedDate.getTime())) {
      warnings.push(`Row ${index + 1}: Date format may be invalid: ${dateField}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateFileData = (data: CustomerRowData[]): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  if (data.length === 0) {
    allErrors.push("The uploaded file appears to be empty or has no valid data rows.");
    return { isValid: false, errors: allErrors, warnings: allWarnings };
  }
  
  // Check for required columns
  const firstRow = data[0];
  const hasCustomerId = firstRow.customer_id || firstRow.customerId || firstRow.id;
  
  if (!hasCustomerId) {
    allWarnings.push("No customer ID column detected. Make sure your file has a 'customer_id', 'customerId', or 'id' column.");
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const validation = validateCustomerRow(row, index);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};
